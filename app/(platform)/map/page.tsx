'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { MainNavbar } from '@/components/navbar/main-navbar'
import { EventMap } from '@/components/map/event-map'
import { EventWithAttendeeCount } from '@/lib/database/events-client'
import { getAllEventsClient } from '@/lib/database/events-client'
import { toast } from 'sonner'

export default function MapPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventWithAttendeeCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getAllEventsClient()
        if (data) {
          setEvents(data)
        }
      } catch {
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadEvents()
    }
  }, [user])

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        <MainNavbar />
        <div className='fixed inset-0 w-full h-full pt-16'>
          {loading ? (
            <div className='flex items-center justify-center w-full h-full'>
              <LoadingSpinner />
            </div>
          ) : (
            <EventMap events={events} onEventsChange={setEvents} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

