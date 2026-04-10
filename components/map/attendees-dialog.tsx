'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EventAttendeeWithDetails } from '@/lib/database/events-client'
import { UserAvatar } from '@/components/common/user-avatar'
import { Car as CarIcon } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/provider'
import { buildLocalePath } from '@/lib/i18n/config'

interface AttendeesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendees: EventAttendeeWithDetails[]
  loading?: boolean
  eventTitle: string
}

export function AttendeesDialog({
  open,
  onOpenChange,
  attendees,
  loading = false,
  eventTitle,
}: AttendeesDialogProps) {
  const { t, locale } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>
            {t('map.attendees.title', 'Attendees')} - {eventTitle}
          </DialogTitle>
          <DialogDescription>
            {attendees.length}{' '}
            {attendees.length === 1
              ? t('map.attendees.person', 'person')
              : t('map.attendees.people', 'people')}{' '}
            {t('map.attendees.attendingThisEvent', 'attending this event')}
          </DialogDescription>
        </DialogHeader>
        <div className='flex-1 overflow-y-auto mt-4'>
          <div className='space-y-2'>
            {loading ? (
              <p className='text-sm text-muted-foreground text-center py-8'>
                {t('map.attendees.loading', 'Loading attendees...')}
              </p>
            ) : attendees.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-8'>
                {t('map.attendees.empty', 'No attendees yet')}
              </p>
            ) : (
              attendees.map(attendee => (
                <div
                  key={attendee.id}
                  className='flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors'
                >
                  <UserAvatar
                    username={attendee.profile?.username || 'unknown'}
                    avatarUrl={attendee.profile?.avatar_url || null}
                    size='md'
                  />
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-medium'>
                      {attendee.profile?.full_name ||
                        attendee.profile?.username ||
                        'Unknown User'}
                    </div>
                    {attendee.car && attendee.car.username && (
                      <Link
                        href={buildLocalePath(
                          locale,
                          `/u/${attendee.car.username}/${attendee.car.url_slug}`
                        )}
                        className='text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 mt-1'
                        onClick={e => e.stopPropagation()}
                      >
                        <CarIcon className='w-3.5 h-3.5 flex-shrink-0' />
                      <span className='truncate'>
                        {attendee.car.name}
                        {attendee.car.year && ` (${attendee.car.year})`}
                        {attendee.car.horsepower &&
                            ` • ${Math.round(attendee.car.horsepower * 0.7457)} ${t('map.attendees.kw', 'kW')}`}
                      </span>
                    </Link>
                  )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
