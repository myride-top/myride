import { useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import {
  trackCarViewClient,
  trackCarShareClient,
} from '@/lib/database/cars-client'

export function useCarAnalytics(carId: string, carOwnerId: string) {
  const { user } = useAuth()

  // Memoize the dependencies to ensure consistent references
  const memoizedCarId = useMemo(() => carId, [carId])
  const memoizedCarOwnerId = useMemo(() => carOwnerId, [carOwnerId])
  const memoizedUserId = useMemo(() => user?.id, [user?.id])

  // Track car view when component mounts (only if not the car owner and carId is valid)
  useEffect(() => {
    const trackView = async () => {
      // Don't track if carId is empty or invalid
      if (!memoizedCarId || memoizedCarId === '') {
        return
      }

      // Don't track views from the car owner
      if (memoizedUserId === memoizedCarOwnerId) {
        return
      }

      try {
        // Get client-side metadata
        const metadata = {
          userAgent: navigator.userAgent,
          referrer: document.referrer || null,
        }

        await trackCarViewClient(memoizedCarId, memoizedUserId, metadata)
      } catch (error) {
        console.error('Error tracking car view:', error)
      }
    }

    trackView()
  }, [memoizedCarId, memoizedUserId, memoizedCarOwnerId])

  // Track car share (only if not the car owner and carId is valid)
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
      // Don't track if carId is empty or invalid
      if (!memoizedCarId || memoizedCarId === '') {
        return
      }

      // Don't track shares from the car owner
      if (memoizedUserId === memoizedCarOwnerId) {
        return
      }

      try {
        const metadata = {
          shareUrl,
          userAgent: navigator.userAgent,
        }

        await trackCarShareClient(
          memoizedCarId,
          platform,
          memoizedUserId,
          metadata
        )
      } catch (error) {
        console.error('Error tracking car share:', error)
      }
    },
    [memoizedCarId, memoizedUserId, memoizedCarOwnerId]
  )

  return {
    trackShare,
  }
}
