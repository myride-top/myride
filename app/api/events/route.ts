import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = generalRateLimit.isAllowed(request)
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  }

  try {
    // Authenticate user
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401)
    }

    // Get all events with attendee counts
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })

    if (eventsError) {
      return createSecureResponse(
        { error: 'Failed to fetch events' },
        500
      )
    }

    // Get attendee counts for each event
    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id)
      const { data: attendees } = await supabase
        .from('event_attendees')
        .select('event_id, attending')
        .in('event_id', eventIds)
        .eq('attending', true)

      const attendeeCounts = new Map<string, number>()
      attendees?.forEach(attendee => {
        const count = attendeeCounts.get(attendee.event_id) || 0
        attendeeCounts.set(attendee.event_id, count + 1)
      })

      const eventsWithCounts = events.map(event => ({
        ...event,
        attendee_count: attendeeCounts.get(event.id) || 0,
      }))

      return createSecureResponse({ events: eventsWithCounts })
    }

    return createSecureResponse({ events: [] })
  } catch (error) {
    console.error('Error fetching events:', error)
    return createSecureResponse(
      {
        error: 'Failed to fetch events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = generalRateLimit.isAllowed(request)
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  }

  try {
    // Authenticate user
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401)
    }

    // Check if user is premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single()

    if (!profile?.is_premium) {
      return createSecureResponse(
        { error: 'Only premium users can create events' },
        403
      )
    }

    // Parse request body
    const body = await request.json()
    const { title, description, latitude, longitude, event_date, end_date } =
      body

    // Validate input
    if (!title || !latitude || !longitude || !event_date) {
      return createSecureResponse(
        { error: 'Missing required fields' },
        400
      )
    }

    // Validate that end_date is after event_date if provided
    if (end_date && new Date(end_date) <= new Date(event_date)) {
      return createSecureResponse(
        { error: 'End date must be after start date' },
        400
      )
    }

    // Validate coordinates
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return createSecureResponse(
        { error: 'Invalid coordinates' },
        400
      )
    }

    // Create event
    const { data: event, error: createError } = await supabase
      .from('events')
      .insert({
        title,
        description: description || null,
        latitude,
        longitude,
        event_date,
        end_date: end_date || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (createError) {
      return createSecureResponse(
        { error: 'Failed to create event' },
        500
      )
    }

    return createSecureResponse({ event }, 201)
  } catch (error) {
    console.error('Error creating event:', error)
    return createSecureResponse(
      {
        error: 'Failed to create event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

