import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

export async function POST(
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

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return createSecureResponse({ error: 'Event not found' }, 404)
    }

    // Parse request body
    const body = await request.json()
    const { attending, car_id } = body

    // Validate car_id if provided (must belong to user)
    if (car_id) {
      const { data: car, error: carError } = await supabase
        .from('cars')
        .select('id, user_id')
        .eq('id', car_id)
        .single()

      if (carError || !car || car.user_id !== user.id) {
        return createSecureResponse(
          { error: 'Invalid car selected' },
          400
        )
      }
    }

    // Upsert attendance
    const { data: attendee, error: attendError } = await supabase
      .from('event_attendees')
      .upsert(
        {
          event_id: id,
          user_id: user.id,
          car_id: car_id || null,
          attending: attending !== false, // Default to true
        },
        {
          onConflict: 'event_id,user_id',
        }
      )
      .select()
      .single()

    if (attendError) {
      return createSecureResponse(
        { error: 'Failed to update attendance' },
        500
      )
    }

    return createSecureResponse({ attendee })
  } catch (error) {
    console.error('Error updating attendance:', error)
    return createSecureResponse(
      {
        error: 'Failed to update attendance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

export async function DELETE(
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

    // Delete attendance
    const { error: deleteError } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      return createSecureResponse(
        { error: 'Failed to remove attendance' },
        500
      )
    }

    return createSecureResponse({ success: true })
  } catch (error) {
    console.error('Error removing attendance:', error)
    return createSecureResponse(
      {
        error: 'Failed to remove attendance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

