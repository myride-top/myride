import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { LOCALES } from '@/lib/i18n/config'
import { SITE_URL } from '@/lib/constants/site'

export const revalidate = 3600

type SitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

const PAGE_SIZE = 1000

const buildLocalizedEntries = (
  path: string,
  lastModified: Date,
  changeFrequency: SitemapChangeFrequency,
  priority: number
): MetadataRoute.Sitemap => {
  const languages: Record<string, string> = {
    'x-default': `${SITE_URL}/en${path}`,
  }
  for (const loc of LOCALES) {
    languages[loc] = `${SITE_URL}/${loc}${path}`
  }

  return LOCALES.map(locale => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages,
    },
  }))
}

const createSitemapClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

async function fetchAllPublicCars(
  supabase: ReturnType<typeof createSitemapClient>,
  usernameById: Map<string, string>
) {
  const rows: Array<{
    url_slug: string
    updated_at: string | null
    created_at: string | null
    username: string
  }> = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('cars')
      .select('url_slug, updated_at, created_at, user_id')
      .not('url_slug', 'is', null)
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error('sitemap cars fetch failed:', error.message)
      break
    }

    if (!data || data.length === 0) {
      break
    }

    for (const row of data) {
      const username = row.user_id ? usernameById.get(row.user_id) : undefined
      if (!username || !row.url_slug) {
        continue
      }

      rows.push({
        url_slug: row.url_slug,
        updated_at: row.updated_at,
        created_at: row.created_at,
        username,
      })
    }

    if (data.length < PAGE_SIZE) {
      break
    }
  }

  return rows
}

async function fetchAllProfilesForCarLookup(
  supabase: ReturnType<typeof createSitemapClient>
) {
  const rows: Array<{
    id: string
    username: string
    is_premium: boolean
    updated_at: string | null
    created_at: string | null
  }> = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, is_premium, updated_at, created_at')
      .not('username', 'is', null)
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error('sitemap profiles fetch failed:', error.message)
      break
    }

    if (!data || data.length === 0) {
      break
    }

    for (const row of data) {
      if (!row.username || !row.id) {
        continue
      }
      rows.push({
        id: row.id,
        username: row.username,
        is_premium: Boolean(row.is_premium),
        updated_at: row.updated_at,
        created_at: row.created_at,
      })
    }

    if (data.length < PAGE_SIZE) {
      break
    }
  }

  return rows
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: Array<{
    path: string
    changeFrequency: SitemapChangeFrequency
    priority: number
  }> = [
    { path: '/browse', changeFrequency: 'daily', priority: 1 },
    { path: '/events', changeFrequency: 'daily', priority: 0.8 },
    { path: '/clubs/explore', changeFrequency: 'daily', priority: 0.8 },
    { path: '/legal/terms', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/legal/privacy', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/legal/cookies', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/legal/licenses', changeFrequency: 'yearly', priority: 0.5 },
  ]

  const lastModified = new Date()
  const entries: MetadataRoute.Sitemap = staticRoutes.flatMap(route =>
    buildLocalizedEntries(
      route.path,
      lastModified,
      route.changeFrequency,
      route.priority
    )
  )

  try {
    const supabase = createSitemapClient()
    const profiles = await fetchAllProfilesForCarLookup(supabase)
    const usernameById = new Map(
      profiles.map(profile => [profile.id, profile.username])
    )
    const premiumProfiles = profiles.filter(profile => profile.is_premium)
    const cars = await fetchAllPublicCars(supabase, usernameById)

    for (const car of cars) {
      const modified = new Date(car.updated_at || car.created_at || Date.now())
      entries.push(
        ...buildLocalizedEntries(
          `/u/${car.username}/${car.url_slug}`,
          modified,
          'weekly',
          0.7
        )
      )
    }

    // Only premium (public) profiles — non-premium garage pages are noindex
    for (const profile of premiumProfiles) {
      const modified = new Date(
        profile.updated_at || profile.created_at || Date.now()
      )
      entries.push(
        ...buildLocalizedEntries(
          `/u/${profile.username}`,
          modified,
          'weekly',
          0.6
        )
      )
    }

    for (let from = 0; ; from += PAGE_SIZE) {
      const withSlug = await supabase
        .from('events')
        .select('slug, updated_at, created_at')
        .not('slug', 'is', null)
        .order('updated_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (withSlug.error) {
        const withId = await supabase
          .from('events')
          .select('id, updated_at, created_at')
          .order('updated_at', { ascending: false })
          .range(from, from + PAGE_SIZE - 1)

        if (withId.error) {
          console.error('sitemap events fetch failed:', withId.error.message)
          break
        }

        if (!withId.data || withId.data.length === 0) {
          break
        }

        for (const event of withId.data) {
          const modified = new Date(
            event.updated_at || event.created_at || Date.now()
          )
          entries.push(
            ...buildLocalizedEntries(
              `/events/${event.id}`,
              modified,
              'weekly',
              0.7
            )
          )
        }

        if (withId.data.length < PAGE_SIZE) {
          break
        }
        continue
      }

      if (!withSlug.data || withSlug.data.length === 0) {
        break
      }

      for (const event of withSlug.data) {
        if (!event.slug) continue
        const modified = new Date(
          event.updated_at || event.created_at || Date.now()
        )
        entries.push(
          ...buildLocalizedEntries(
            `/events/${event.slug}`,
            modified,
            'weekly',
            0.7
          )
        )
      }

      if (withSlug.data.length < PAGE_SIZE) {
        break
      }
    }
  } catch (error) {
    console.error('sitemap dynamic fetch failed:', error)
  }

  return entries
}
