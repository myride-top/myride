import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Event, Profile } from '@/lib/types/database'
import { isEventUuid } from '@/lib/utils/event-path'

export type EventOrganizer = Pick<
  Profile,
  'id' | 'username' | 'full_name' | 'avatar_url'
>

export type EventClubPreview = {
  id: string
  name: string
  slug: string
  badge_url: string | null
}

export type EventWithDetails = Event & {
  attendee_count: number
  organizer: EventOrganizer | null
  club: EventClubPreview | null
}

export type EventAttendeeCarPreview = {
  attendanceId: string
  userId: string
  username: string | null
  fullName: string | null
  car: {
    id: string
    name: string
    make: string
    model: string
    year: number
    url_slug: string
    main_photo_url: string | null
  } | null
}

export type EventSitemapRow = {
  slug: string
  updated_at: string | null
  created_at: string | null
}

async function createEventsSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — safe to ignore.
          }
        },
      },
    }
  )
}

function upcomingFilter(nowIso: string): string {
  return `end_date.gte.${nowIso},and(end_date.is.null,event_date.gte.${nowIso})`
}

/** Select without requiring `slug` so pages work before/after migration. */
const EVENT_SELECT =
  'id, created_by, title, description, event_type, event_date, end_date, latitude, longitude, event_image_url, route, club_id, created_at, updated_at, club:clubs(id, name, slug, badge_url)'

const EVENT_SELECT_WITH_SLUG =
  'id, slug, created_by, title, description, event_type, event_date, end_date, latitude, longitude, event_image_url, route, club_id, created_at, updated_at, club:clubs(id, name, slug, badge_url)'

type EventRow = Event & {
  club: EventClubPreview | EventClubPreview[] | null
}

async function attachAttendeeCounts<T extends { id: string }>(
  events: T[]
): Promise<Array<T & { attendee_count: number }>> {
  if (events.length === 0) {
    return []
  }

  const supabase = await createEventsSupabase()
  const eventIds = events.map(e => e.id)
  const { data: attendees } = await supabase
    .from('event_attendees')
    .select('event_id')
    .in('event_id', eventIds)
    .eq('attending', true)

  const counts = new Map<string, number>()
  attendees?.forEach(row => {
    counts.set(row.event_id, (counts.get(row.event_id) || 0) + 1)
  })

  return events.map(event => ({
    ...event,
    attendee_count: counts.get(event.id) || 0,
  }))
}

function normalizeClub(club: EventRow['club']): EventClubPreview | null {
  if (!club) return null
  return Array.isArray(club) ? club[0] ?? null : club
}

function withSlugFallback<T extends { id: string; slug?: string | null }>(
  row: T
): T & { slug: string | null } {
  return {
    ...row,
    slug: row.slug ?? null,
  }
}

async function selectEvents(
  buildQuery: (
    select: string
  ) => Promise<{ data: EventRow[] | EventRow | null; error: { message: string; code?: string } | null }>
): Promise<EventRow[]> {
  const withSlug = await buildQuery(EVENT_SELECT_WITH_SLUG)
  if (!withSlug.error) {
    const data = withSlug.data
    if (!data) return []
    return Array.isArray(data) ? data : [data]
  }

  // Column missing (42703) — fall back without slug
  if (
    withSlug.error.message?.includes('slug') ||
    withSlug.error.code === '42703'
  ) {
    const withoutSlug = await buildQuery(EVENT_SELECT)
    if (withoutSlug.error || !withoutSlug.data) {
      return []
    }
    const data = withoutSlug.data
    return Array.isArray(data) ? data : [data]
  }

  return []
}

export async function getUpcomingEvents(): Promise<
  Array<Event & { attendee_count: number; club: EventClubPreview | null }>
> {
  const supabase = await createEventsSupabase()
  const now = new Date().toISOString()

  const rows = await selectEvents(async select => {
    const result = await supabase
      .from('events')
      .select(select)
      .or(upcomingFilter(now))
      .order('event_date', { ascending: true })
    return result as {
      data: EventRow[] | null
      error: { message: string; code?: string } | null
    }
  })

  const normalized = rows.map(row =>
    withSlugFallback({
      ...row,
      club: normalizeClub(row.club),
    })
  )

  return attachAttendeeCounts(normalized)
}

export async function getEventBySlug(
  slugOrId: string
): Promise<EventWithDetails | null> {
  const supabase = await createEventsSupabase()

  const rows = await selectEvents(async select => {
    let query = supabase.from('events').select(select)
    query = isEventUuid(slugOrId)
      ? query.eq('id', slugOrId)
      : query.eq('slug', slugOrId)
    const result = await query.maybeSingle()
    return result as {
      data: EventRow | null
      error: { message: string; code?: string } | null
    }
  })

  const row = rows[0]
  if (!row) {
    return null
  }

  const club = normalizeClub(row.club)
  const event = withSlugFallback(row)

  const [{ data: organizer }, withCount] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', event.created_by)
      .maybeSingle(),
    attachAttendeeCounts([{ id: event.id }]),
  ])

  return {
    ...event,
    club,
    organizer: organizer
      ? {
          id: organizer.id,
          username: organizer.username,
          full_name: organizer.full_name,
          avatar_url: organizer.avatar_url,
        }
      : null,
    attendee_count: withCount[0]?.attendee_count || 0,
  }
}

export async function getEventAttendeeCarPreviews(
  eventId: string,
  limit = 6
): Promise<EventAttendeeCarPreview[]> {
  const supabase = await createEventsSupabase()

  const { data, error } = await supabase
    .from('event_attendees')
    .select(
      `
      id,
      user_id,
      profiles:user_id (
        username,
        full_name
      ),
      cars:car_id (
        id,
        name,
        make,
        model,
        year,
        url_slug,
        main_photo_url
      )
    `
    )
    .eq('event_id', eventId)
    .eq('attending', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  type Row = {
    id: string
    user_id: string
    profiles:
      | { username: string; full_name: string | null }
      | { username: string; full_name: string | null }[]
      | null
    cars:
      | {
          id: string
          name: string
          make: string
          model: string
          year: number
          url_slug: string
          main_photo_url: string | null
        }
      | {
          id: string
          name: string
          make: string
          model: string
          year: number
          url_slug: string
          main_photo_url: string | null
        }[]
      | null
  }

  return (data as Row[]).map(row => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    const car = Array.isArray(row.cars) ? row.cars[0] : row.cars

    return {
      attendanceId: row.id,
      userId: row.user_id,
      username: profile?.username ?? null,
      fullName: profile?.full_name ?? null,
      car: car
        ? {
            id: car.id,
            name: car.name,
            make: car.make,
            model: car.model,
            year: car.year,
            url_slug: car.url_slug,
            main_photo_url: car.main_photo_url,
          }
        : null,
    }
  })
}

export async function getAllEventSlugsForSitemap(): Promise<EventSitemapRow[]> {
  const supabase = await createEventsSupabase()
  const rows: EventSitemapRow[] = []
  const pageSize = 1000

  for (let from = 0; ; from += pageSize) {
    const withSlug = await supabase
      .from('events')
      .select('slug, updated_at, created_at')
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (withSlug.error) {
      // Pre-migration: fall back to id as path segment
      const withId = await supabase
        .from('events')
        .select('id, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .range(from, from + pageSize - 1)

      if (withId.error || !withId.data || withId.data.length === 0) {
        break
      }

      for (const row of withId.data) {
        rows.push({
          slug: row.id,
          updated_at: row.updated_at,
          created_at: row.created_at,
        })
      }

      if (withId.data.length < pageSize) break
      continue
    }

    if (!withSlug.data || withSlug.data.length === 0) {
      break
    }

    for (const row of withSlug.data) {
      if (!row.slug) continue
      rows.push({
        slug: row.slug,
        updated_at: row.updated_at,
        created_at: row.created_at,
      })
    }

    if (withSlug.data.length < pageSize) {
      break
    }
  }

  return rows
}

export function isEventPast(event: {
  event_date: string
  end_date: string | null
}): boolean {
  const end = event.end_date || event.event_date
  return new Date(end).getTime() < Date.now()
}
