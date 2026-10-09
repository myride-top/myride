import Link from 'next/link'
import { Calendar, MapPin, Users } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/layout/page-header'
import { PageLayout } from '@/components/layout/page-layout'
import { getUpcomingEvents } from '@/lib/database/events'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/server'
import { getEventPublicPath } from '@/lib/utils/event-path'
import { reverseGeocode } from '@/lib/utils/geocode'

type EventsPageProps = {
  params: Promise<{ locale: string }>
}

function formatEventDate(dateString: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateString))
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const t = await getTranslations({ locale, namespace: 'events' })

  const events = await getUpcomingEvents()

  const eventsWithPlaces = await Promise.all(
    events.map(async event => {
      const place = await reverseGeocode(event.latitude, event.longitude)
      return {
        ...event,
        placeLabel:
          place?.address ||
          `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}`,
      }
    })
  )

  return (
    <PageLayout showCreateButton>
      <PageHeader
        title={t('title', 'Upcoming events')}
        description={t(
          'description',
          'Public car meets and events you can share and join.'
        )}
      />

      {eventsWithPlaces.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t('emptyTitle', 'No upcoming events')}
          description={t(
            'emptyDescription',
            'Check back soon or create an event on the map.'
          )}
        />
      ) : (
        <ul className='space-y-4'>
          {eventsWithPlaces.map(event => (
            <li key={event.id}>
              <Link
                href={getEventPublicPath(locale, event)}
                className='block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40'
              >
                <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0'>
                    <h2 className='truncate text-lg font-semibold text-foreground'>
                      {event.title}
                    </h2>
                    <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground'>
                      <span className='inline-flex items-center gap-1.5'>
                        <Calendar className='h-4 w-4 shrink-0' aria-hidden />
                        {formatEventDate(event.event_date, locale)}
                      </span>
                      <span className='inline-flex items-center gap-1.5'>
                        <MapPin className='h-4 w-4 shrink-0' aria-hidden />
                        <span className='truncate'>{event.placeLabel}</span>
                      </span>
                      <span className='inline-flex items-center gap-1.5'>
                        <Users className='h-4 w-4 shrink-0' aria-hidden />
                        {t(
                          'attendeeCount',
                          { count: event.attendee_count },
                          '{count} attending'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  )
}
