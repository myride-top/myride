import { useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import {
  trackEventViewClient,
  trackEventShareClient,
} from '@/lib/database/events-client'

export function useEventAnalytics(eventId: string, eventCreatorId: string) {
  const { user } = useAuth()

  // Memoize the dependencies to ensure consistent references
  const memoizedEventId = useMemo(() => eventId, [eventId])
  const memoizedEventCreatorId = useMemo(() => eventCreatorId, [eventCreatorId])
  const memoizedUserId = useMemo(() => user?.id, [user?.id])

  // Track event view when component mounts (only if not the event creator and eventId is valid)
  useEffect(() => {
    const trackView = async () => {
      // Don't track if eventId is empty or invalid
      if (!memoizedEventId || memoizedEventId === '') {
        return
      }

      // Don't track views from the event creator
      if (memoizedUserId === memoizedEventCreatorId) {
        return
      }

      try {
        // Get client-side metadata
        const metadata = {
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
        }

        await trackEventViewClient(memoizedEventId, memoizedUserId, metadata)
      } catch {}
    }

    trackView()
  }, [memoizedEventId, memoizedUserId, memoizedEventCreatorId])

  // Track event share (only if not the event creator and eventId is valid)
  const trackShare = useCallback(
    async (
      platform:
        | 'twitter'
        | 'facebook'
        | 'instagram'
        | 'whatsapp'
        | 'telegram'
        | 'copy_link'
        | 'other',
      shareUrl?: string
    ) => {
      // Don't track if eventId is empty or invalid
      if (!memoizedEventId || memoizedEventId === '') {
        return
      }

      // Don't track shares from the event creator
      if (memoizedUserId === memoizedEventCreatorId) {
        return
      }

      try {
        const metadata = {
          shareUrl,
          userAgent: navigator.userAgent,
        }

        await trackEventShareClient(
          memoizedEventId,
          platform,
          memoizedUserId,
          metadata
        )
      } catch {}
    },
    [memoizedEventId, memoizedUserId, memoizedEventCreatorId]
  )

  return {
    trackShare,
  }
}

