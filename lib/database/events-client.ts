import { createBrowserClient } from '@supabase/ssr'
import { Event, EventAttendee } from '@/lib/types/database'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface EventWithAttendeeCount extends Event {
  attendee_count: number
}

// Cache for events to prevent unnecessary refetches
let eventsCache: {
  data: EventWithAttendeeCount[] | null
  timestamp: number
} | null = null

const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

export async function getAllEventsClient(
  forceRefresh = false
): Promise<EventWithAttendeeCount[] | null> {
  try {
    // Return cached data if still valid and not forcing refresh
    if (
      !forceRefresh &&
      eventsCache &&
      Date.now() - eventsCache.timestamp < CACHE_DURATION
    ) {
      return eventsCache.data
    }

    const response = await fetch('/api/events', {
      // Add cache headers for browser caching
      cache: 'default',
    })

    if (!response.ok) {
      // Return stale cache if available on error
      if (eventsCache) {
        return eventsCache.data
      }
      return null
    }

    const data = await response.json()
    const events = data.events || []

    // Update cache
    eventsCache = {
      data: events,
      timestamp: Date.now(),
    }

    return events
  } catch {
    // Return stale cache if available on error
    if (eventsCache) {
      return eventsCache.data
    }
    return null
  }
}

// Function to clear events cache (useful after creating/updating events)
export function clearEventsCache(): void {
  eventsCache = null
}

export async function createEventClient(
  eventData: {
    title: string
    description?: string
    latitude: number
    longitude: number
    event_date: string
    end_date?: string
    event_type?: string
    event_image_url?: string | null
    route?: [number, number][] | null
  }
): Promise<{ success: boolean; error?: string; data?: Event }> {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create event',
      }
    }

    return {
      success: true,
      data: data.event,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create event',
    }
  }
}

export async function updateEventClient(
  eventId: string,
  updates: {
    title?: string
    description?: string
    latitude?: number
    longitude?: number
    event_date?: string
    end_date?: string | null
    event_type?: string
    event_image_url?: string | null
    route?: [number, number][] | null
  }
): Promise<{ success: boolean; error?: string; data?: Event }> {
  try {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update event',
      }
    }

    return {
      success: true,
      data: data.event,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update event',
    }
  }
}

export async function deleteEventClient(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to delete event',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete event',
    }
  }
}

export async function updateEventAttendanceClient(
  eventId: string,
  attending: boolean,
  carId?: string | null
): Promise<{ success: boolean; error?: string; data?: EventAttendee }> {
  try {
    const response = await fetch(`/api/events/${eventId}/attend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attending,
        car_id: carId || null,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update attendance',
      }
    }

    return {
      success: true,
      data: data.attendee,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update attendance',
    }
  }
}

export async function removeEventAttendanceClient(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/events/${eventId}/attend`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to remove attendance',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to remove attendance',
    }
  }
}

export interface EventAttendeeWithDetails {
  id: string
  user_id: string
  car_id: string | null
  attending: boolean
  created_at: string
  profile: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  } | null
  car: {
    id: string
    name: string
    make: string
    model: string
    year: number
    horsepower: number | null
    url_slug: string
    username: string | null
  } | null
}

export async function getEventAttendeesClient(
  eventId: string
): Promise<EventAttendee[] | null> {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .eq('attending', true)
      .order('created_at', { ascending: false })

    if (error) {
      return null
    }

    return data
  } catch {
    return null
  }
}

export async function getEventAttendeesWithDetailsClient(
  eventId: string
): Promise<EventAttendeeWithDetails[] | null> {
  try {
    const response = await fetch(`/api/events/${eventId}/attendees`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data.attendees || []
  } catch {
    return null
  }
}

export async function getUserEventAttendanceClient(
  eventId: string,
  userId: string
): Promise<EventAttendee | null> {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch {
    return null
  }
}

// Analytics Functions
export async function trackEventViewClient(
  eventId: string,
  userId?: string,
  metadata?: {
    ipAddress?: string
    userAgent?: string
    referrer?: string
  }
): Promise<boolean> {
  try {
    const response = await fetch(`/api/events/${eventId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metadata: {
          userAgent: metadata?.userAgent || navigator.userAgent,
          referrer: metadata?.referrer || document.referrer || undefined,
        },
      }),
    })

    if (!response.ok) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export async function trackEventShareClient(
  eventId: string,
  platform:
    | 'twitter'
    | 'facebook'
    | 'instagram'
    | 'whatsapp'
    | 'telegram'
    | 'copy_link'
    | 'other',
  userId?: string,
  metadata?: {
    shareUrl?: string
    ipAddress?: string
    userAgent?: string
  }
): Promise<boolean> {
  try {
    const response = await fetch(`/api/events/${eventId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform,
        metadata: {
          shareUrl: metadata?.shareUrl || window.location.href,
          userAgent: metadata?.userAgent || navigator.userAgent,
        },
      }),
    })

    if (!response.ok) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export interface UserEventStats {
  views: number
  shares: number
}

export async function getUserEventStatsClient(
  userId: string
): Promise<UserEventStats> {
  try {
    // Get all events created by this user
    const { data: userEvents, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .eq('created_by', userId)

    if (eventsError || !userEvents || userEvents.length === 0) {
      return { views: 0, shares: 0 }
    }

    const eventIds = userEvents.map(e => e.id)

    // Get total event views
    const { count: eventViews } = await supabase
      .from('event_views')
      .select('*', { count: 'exact', head: true })
      .in('event_id', eventIds)

    // Get total event shares
    const { count: eventShares } = await supabase
      .from('event_shares')
      .select('*', { count: 'exact', head: true })
      .in('event_id', eventIds)

    return {
      views: eventViews || 0,
      shares: eventShares || 0,
    }
  } catch {
    return { views: 0, shares: 0 }
  }
}

