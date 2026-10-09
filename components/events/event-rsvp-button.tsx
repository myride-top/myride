'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { getCarsByUserClient } from '@/lib/database/cars-client'
import {
  getUserEventAttendanceClient,
} from '@/lib/database/events-client'
import { AttendanceDialog } from '@/components/map/attendance-dialog'
import { Button } from '@/components/ui/button'
import { buildLocalePath, type Locale } from '@/lib/i18n/config'
import { useI18n } from '@/lib/i18n/provider'
import type { Car } from '@/lib/types/database'

type EventRsvpButtonProps = {
  eventId: string
  eventSlug: string
  locale: Locale
  isPast: boolean
}

export function EventRsvpButton({
  eventId,
  eventSlug,
  locale,
  isPast,
}: EventRsvpButtonProps) {
  const { t } = useI18n()
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cars, setCars] = useState<Car[]>([])
  const [isAttending, setIsAttending] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const nextPath = buildLocalePath(locale, `/events/${eventSlug}`)
  const registerHref = `${buildLocalePath(locale, '/register')}?next=${encodeURIComponent(nextPath)}`

  useEffect(() => {
    if (!user) {
      setIsAttending(false)
      setCars([])
      return
    }

    let cancelled = false

    const load = async () => {
      const [userCars, attendance] = await Promise.all([
        getCarsByUserClient(user.id),
        getUserEventAttendanceClient(eventId, user.id),
      ])
      if (cancelled) return
      setCars(userCars || [])
      setIsAttending(Boolean(attendance?.attending))
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [user, eventId, refreshKey])

  if (isPast) {
    return null
  }

  if (!user) {
    return (
      <Button asChild size='lg'>
        <Link href={registerHref}>
          {t('events.rsvp', 'I will attend')}
        </Link>
      </Button>
    )
  }

  return (
    <>
      <Button size='lg' onClick={() => setDialogOpen(true)}>
        {isAttending
          ? t('events.manageRsvp', 'Manage attendance')
          : t('events.rsvp', 'I will attend')}
      </Button>
      <AttendanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={eventId}
        userId={user.id}
        cars={cars}
        onAttendanceChanged={() => setRefreshKey(k => k + 1)}
      />
    </>
  )
}
