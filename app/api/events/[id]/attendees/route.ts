import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Get attendees with profile and car information
    const { data: attendees, error: attendeesError } = await supabase
      .from('event_attendees')
      .select(
        `
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        cars:car_id (
          id,
          name,
          make,
          model,
          year,
          url_slug,
          user_id
        )
      `
      )
      .eq('event_id', id)
      .eq('attending', true)
      .order('created_at', { ascending: false })

    if (attendeesError) {
      return createSecureResponse(
        { error: 'Failed to fetch attendees' },
        500
      )
    }

    // Get profile usernames for car links
    const userIds = attendees
      ?.map((a: any) => a.cars?.user_id)
      .filter(Boolean) as string[]
    const uniqueUserIds = [...new Set(userIds)]

    const profilesMap = new Map<string, string>()
    if (uniqueUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', uniqueUserIds)

      profiles?.forEach(profile => {
        profilesMap.set(profile.id, profile.username)
      })
    }

    // Format attendees with proper structure
    const formattedAttendees = attendees?.map((attendee: any) => ({
      id: attendee.id,
      user_id: attendee.user_id,
      car_id: attendee.car_id,
      attending: attendee.attending,
      created_at: attendee.created_at,
      profile: attendee.profiles
        ? {
            id: attendee.profiles.id,
            username: attendee.profiles.username,
            full_name: attendee.profiles.full_name,
            avatar_url: attendee.profiles.avatar_url,
          }
        : null,
      car: attendee.cars
        ? {
            id: attendee.cars.id,
            name: attendee.cars.name,
            make: attendee.cars.make,
            model: attendee.cars.model,
            year: attendee.cars.year,
            url_slug: attendee.cars.url_slug,
            username: profilesMap.get(attendee.cars.user_id) || null,
          }
        : null,
    }))

    return createSecureResponse({ attendees: formattedAttendees || [] })
  } catch (error) {
    console.error('Error fetching attendees:', error)
    return createSecureResponse(
      {
        error: 'Failed to fetch attendees',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

