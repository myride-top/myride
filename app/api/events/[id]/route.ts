import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

export async function PUT(
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

    // Check if event exists and user is the creator
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return createSecureResponse({ error: 'Event not found' }, 404)
    }

    if (event.created_by !== user.id) {
      return createSecureResponse(
        { error: 'You can only update your own events' },
        403
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      title,
      description,
      latitude,
      longitude,
      event_date,
      end_date,
      event_type,
      event_image_url,
      route,
    } = body

    // Validate coordinates if provided
    if (latitude !== undefined || longitude !== undefined) {
      if (
        (latitude !== undefined &&
          (typeof latitude !== 'number' ||
            latitude < -90 ||
            latitude > 90)) ||
        (longitude !== undefined &&
          (typeof longitude !== 'number' ||
            longitude < -180 ||
            longitude > 180))
      ) {
        return createSecureResponse(
          { error: 'Invalid coordinates' },
          400
        )
      }
    }

    // Validate that end_date is after event_date if both are provided
    if (end_date !== undefined && event_date !== undefined) {
      if (new Date(end_date) <= new Date(event_date)) {
        return createSecureResponse(
          { error: 'End date must be after start date' },
          400
        )
      }
    } else if (end_date !== undefined) {
      // If only end_date is being updated, check against existing event_date
      const { data: existingEvent } = await supabase
        .from('events')
        .select('event_date')
        .eq('id', id)
        .single()

      if (existingEvent && new Date(end_date) <= new Date(existingEvent.event_date)) {
        return createSecureResponse(
          { error: 'End date must be after start date' },
          400
        )
      }
    }

    // Update event
    const updateData: {
      title?: string
      description?: string | null
      latitude?: number
      longitude?: number
      event_date?: string
      end_date?: string | null
      event_type?: string
      event_image_url?: string | null
      route?: [number, number][] | null
      updated_at?: string
    } = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude
    if (event_date !== undefined) updateData.event_date = event_date
    if (end_date !== undefined) updateData.end_date = end_date || null
    if (event_type !== undefined) updateData.event_type = event_type
    if (event_image_url !== undefined)
      updateData.event_image_url = event_image_url || null
    if (route !== undefined) updateData.route = route || null

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return createSecureResponse(
        { error: 'Failed to update event' },
        500
      )
    }

    return createSecureResponse({ event: updatedEvent })
  } catch (error) {
    console.error('Error updating event:', error)
    return createSecureResponse(
      {
        error: 'Failed to update event',
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

    // Check if event exists and user is the creator
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('created_by')
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return createSecureResponse({ error: 'Event not found' }, 404)
    }

    if (event.created_by !== user.id) {
      return createSecureResponse(
        { error: 'You can only delete your own events' },
        403
      )
    }

    // Delete event (cascade will delete attendees)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return createSecureResponse(
        { error: 'Failed to delete event' },
        500
      )
    }

    return createSecureResponse({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return createSecureResponse(
      {
        error: 'Failed to delete event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

