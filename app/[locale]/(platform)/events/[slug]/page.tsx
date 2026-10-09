import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, ExternalLink, MapPin, Users } from 'lucide-react'
import {
  StructuredData,
  eventJsonLdSchema,
} from '@/components/common/structured-data'
import { EventRsvpButton } from '@/components/events/event-rsvp-button'
import { PageLayout } from '@/components/layout/page-layout'
import {
  DEFAULT_OG_IMAGE,
  OPEN_GRAPH_LOCALES,
  SITE_URL,
  buildLocaleAlternates,
} from '@/lib/constants/site'
import {
  getEventAttendeeCarPreviews,
  getEventBySlug,
  isEventPast,
} from '@/lib/database/events'
import { buildLocalePath, isLocale, type Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/server'
import {
  getEventPublicPath,
  getEventPublicSegment,
} from '@/lib/utils/event-path'
import {
  googleMapsUrl,
  reverseGeocode,
  staticMapImageUrl,
} from '@/lib/utils/geocode'
import { Metadata } from 'next'

type EventPageProps = {
  params: Promise<{ locale: string; slug: string }>
}

function formatEventDate(dateString: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(dateString))
}

function formatMetaDate(dateString: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(dateString))
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'

  const event = await getEventBySlug(slug)
  if (!event) {
    notFound()
  }

  const dateLabel = formatMetaDate(event.event_date, locale)
  const title = `${event.title} – ${dateLabel} | MyRide`
  const description =
    event.description?.trim() ||
    `${event.title} · ${dateLabel}`
  const publicSegment = getEventPublicSegment(event)
  const { canonical, languages, openGraphUrl } = buildLocaleAlternates(
    locale,
    `/events/${publicSegment}`
  )
  const ogImageUrl = `${SITE_URL}/api/og/event?slug=${encodeURIComponent(publicSegment)}`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: OPEN_GRAPH_LOCALES[locale],
      url: openGraphUrl,
      siteName: 'MyRide',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl || DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { locale: localeParam, slug } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const t = await getTranslations({ locale, namespace: 'events' })
  const tMap = await getTranslations({ locale, namespace: 'map' })

  const event = await getEventBySlug(slug)
  if (!event) {
    notFound()
  }

  const past = isEventPast(event)
  const [place, attendeeCars] = await Promise.all([
    reverseGeocode(event.latitude, event.longitude),
    getEventAttendeeCarPreviews(event.id, 6),
  ])

  const placeLabel =
    place?.address ||
    `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}`
  const mapsUrl = googleMapsUrl(event.latitude, event.longitude)
  const mapImageUrl = staticMapImageUrl(event.latitude, event.longitude)
  const publicSegment = getEventPublicSegment(event)
  const eventUrl = `${SITE_URL}${getEventPublicPath(locale, event)}`
  const ogImageUrl = `${SITE_URL}/api/og/event?slug=${encodeURIComponent(publicSegment)}`
  const typeLabel = tMap(`eventType.${event.event_type}`, event.event_type)

  const jsonLd = eventJsonLdSchema({
    name: event.title,
    description: event.description,
    startDate: event.event_date,
    endDate: event.end_date,
    image: event.event_image_url || ogImageUrl,
    url: eventUrl,
    locationName: placeLabel,
    streetAddress: place?.street,
    addressLocality: place?.city,
    addressCountry: place?.country,
    latitude: event.latitude,
    longitude: event.longitude,
    organizerName:
      event.organizer?.full_name ||
      event.organizer?.username ||
      'MyRide',
    organizerUrl: event.organizer?.username
      ? `${SITE_URL}${buildLocalePath(locale, `/u/${event.organizer.username}`)}`
      : undefined,
  })

  return (
    <PageLayout showCreateButton>
      <StructuredData data={jsonLd} id='event-jsonld' />

      <article className='space-y-8'>
        <header className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            {past && (
              <span className='rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'>
                {t('pastBadge', 'Past event')}
              </span>
            )}
            <span className='rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'>
              {typeLabel}
            </span>
          </div>

          <h1 className='text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
            {event.title}
          </h1>

          <div className='flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground'>
            <span className='inline-flex items-center gap-1.5'>
              <Calendar className='h-4 w-4 shrink-0' aria-hidden />
              {formatEventDate(event.event_date, locale)}
              {event.end_date
                ? ` – ${formatEventDate(event.end_date, locale)}`
                : null}
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

          <EventRsvpButton
            eventId={event.id}
            eventSlug={publicSegment}
            locale={locale}
            isPast={past}
          />
        </header>

        <section className='space-y-3'>
          <h2 className='text-lg font-semibold text-foreground'>
            {t('location', 'Location')}
          </h2>
          <p className='inline-flex items-start gap-2 text-muted-foreground'>
            <MapPin className='mt-0.5 h-4 w-4 shrink-0' aria-hidden />
            <span>{placeLabel}</span>
          </p>
          <a
            href={mapsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline'
          >
            {t('openInMaps', 'Open in Google Maps')}
            <ExternalLink className='h-3.5 w-3.5' aria-hidden />
          </a>
          <a
            href={mapsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='relative block overflow-hidden rounded-lg border border-border'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mapImageUrl}
              alt={t('mapAlt', { name: event.title }, 'Map for {name}')}
              width={600}
              height={300}
              className='h-auto w-full max-w-xl object-cover'
            />
          </a>
        </section>

        {event.description ? (
          <section className='space-y-3'>
            <h2 className='text-lg font-semibold text-foreground'>
              {t('about', 'About')}
            </h2>
            <p className='whitespace-pre-wrap text-muted-foreground'>
              {event.description}
            </p>
          </section>
        ) : null}

        <section className='space-y-3'>
          <h2 className='text-lg font-semibold text-foreground'>
            {t('organizer', 'Organizer')}
          </h2>
          {event.organizer?.username ? (
            <Link
              href={buildLocalePath(locale, `/u/${event.organizer.username}`)}
              className='inline-flex items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-accent/40'
            >
              {event.organizer.avatar_url ? (
                <Image
                  src={event.organizer.avatar_url}
                  alt=''
                  width={40}
                  height={40}
                  className='h-10 w-10 rounded-full object-cover'
                />
              ) : (
                <span className='flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium'>
                  {(event.organizer.full_name || event.organizer.username)
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
              <span className='font-medium text-foreground'>
                {event.organizer.full_name || `@${event.organizer.username}`}
              </span>
            </Link>
          ) : (
            <p className='text-muted-foreground'>—</p>
          )}
        </section>

        {attendeeCars.length > 0 ? (
          <section className='space-y-4'>
            <h2 className='text-lg font-semibold text-foreground'>
              {t('attendeeCars', 'Cars attending')}
            </h2>
            <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6'>
              {attendeeCars.map(preview => {
                if (!preview.car || !preview.username) {
                  return null
                }
                const href = buildLocalePath(
                  locale,
                  `/u/${preview.username}/${preview.car.url_slug}`
                )
                return (
                  <li key={preview.attendanceId}>
                    <Link
                      href={href}
                      className='group block overflow-hidden rounded-lg border border-border hover:border-primary/40'
                    >
                      <div className='relative aspect-square bg-muted'>
                        {preview.car.main_photo_url ? (
                          <Image
                            src={preview.car.main_photo_url}
                            alt={preview.car.name}
                            fill
                            className='object-cover transition-transform group-hover:scale-105'
                            sizes='(max-width: 640px) 50vw, 120px'
                          />
                        ) : (
                          <div className='flex h-full items-center justify-center text-xs text-muted-foreground'>
                            {preview.car.make}
                          </div>
                        )}
                      </div>
                      <div className='truncate p-2 text-xs font-medium text-foreground'>
                        {preview.car.name}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}
      </article>
    </PageLayout>
  )
}
