import { createBrowserClient } from '@supabase/ssr'
import { Event, EventAttendee } from '@/lib/types/database'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface EventWithAttendeeCount extends Event {
  attendee_count: number
}

export async function getAllEventsClient(): Promise<
  EventWithAttendeeCount[] | null
> {
  try {
    const response = await fetch('/api/events')
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data.events || []
  } catch {
    return null
  }
}

export async function createEventClient(
  eventData: {
    title: string
    description?: string
    latitude: number
    longitude: number
    event_date: string
    end_date?: string
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

