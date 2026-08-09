'use client'

import { useEffect, useState } from 'react'
import { ClubBadges } from '@/components/clubs/club-badges'
import { getClubBadgesForUserClient } from '@/lib/database/clubs-client'
import type { ClubBadgeInfo } from '@/lib/types/database'

interface UserClubBadgesProps {
  userId?: string | null
  clubs?: ClubBadgeInfo[]
  size?: 'xs' | 'sm' | 'md'
  className?: string
  maxVisible?: number
}

/**
 * Renders club badges for a user. Pass `clubs` to avoid refetching when
 * the parent already loaded badges in bulk.
 */
export const UserClubBadges = ({
  userId,
  clubs: clubsProp,
  size = 'sm',
  className,
  maxVisible,
}: UserClubBadgesProps) => {
  const [clubs, setClubs] = useState<ClubBadgeInfo[]>(clubsProp ?? [])

  useEffect(() => {
    if (clubsProp) {
      setClubs(clubsProp)
      return
    }

    if (!userId) {
      setClubs([])
      return
    }

    let cancelled = false

    void getClubBadgesForUserClient(userId).then(result => {
      if (!cancelled) {
        setClubs(result)
      }
    })

    return () => {
      cancelled = true
    }
  }, [userId, clubsProp])

  return (
    <ClubBadges
      clubs={clubs}
      size={size}
      className={className}
      maxVisible={maxVisible}
    />
  )
}
