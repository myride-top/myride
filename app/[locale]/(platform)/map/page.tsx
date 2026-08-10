'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { MainNavbar } from '@/components/navbar/main-navbar'
import { EventMap } from '@/components/map/event-map'
import { EventWithAttendeeCount } from '@/lib/database/events-client'
import { getAllEventsClient } from '@/lib/database/events-client'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n/provider'

export default function MapPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const clubSlugFilter = searchParams.get('club')
  const highlightEventId = searchParams.get('event')
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
        toast.error(t('map.toast.loadFailed', 'Failed to load events'))
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadEvents()
    }
  }, [t, user])

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        <MainNavbar />
        <div className='fixed inset-0 w-full h-full pt-16 sm:pt-20'>
          {loading ? (
            <div className='flex items-center justify-center w-full h-full bg-background'>
              <LoadingSpinner message={t('map.loading', 'Loading map...')} />
            </div>
          ) : (
            <EventMap
              events={events}
              onEventsChange={setEvents}
              clubSlugFilter={clubSlugFilter}
              highlightEventId={highlightEventId}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
