import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCarByUrlSlugAndUsername } from '@/lib/database/cars'
import { getProfileByUsername } from '@/lib/database/profiles'
import {
  DEFAULT_OG_IMAGE,
  OPEN_GRAPH_LOCALES,
  SITE_URL,
  buildLocaleAlternates,
} from '@/lib/constants/site'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import {
  translateDrivetrain,
  translateFuelType,
  translateTransmission,
} from '@/lib/i18n/car-spec-values'
import {
  StructuredData,
  carJsonLdSchema,
} from '@/components/common/structured-data'
import CarDetailPageClient from './car-page-client'

type CarPageProps = {
  params: Promise<{ locale: string; username: string; car: string }>
}

const resolveCarImage = (car: {
  main_photo_url?: string | null
  photos?: Array<string | { url?: string }> | null
}): string | null => {
  if (car.main_photo_url) {
    return car.main_photo_url
  }

  const firstPhoto = car.photos?.[0]
  if (!firstPhoto) {
    return null
  }

  if (typeof firstPhoto === 'string') {
    return firstPhoto
  }

  return firstPhoto.url || null
}

export async function generateMetadata({
  params,
}: CarPageProps): Promise<Metadata> {
  const { locale: localeParam, username, car: carSlug } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const path = `/u/${username}/${carSlug}`
  const { canonical, languages, openGraphUrl } = buildLocaleAlternates(
    locale,
    path
  )

  const car = await getCarByUrlSlugAndUsername(carSlug, username)
  if (!car) {
    notFound()
  }

  let profile = null
  try {
    profile = await getProfileByUsername(username)
  } catch {
    // optional for title branding
  }

  const title = `${car.name} by @${profile?.username || username}`
  const description = car.description
    ? `${car.description} - ${car.year} ${car.make} ${car.model}`
    : `Check out this ${car.year} ${car.make} ${car.model} by @${
        profile?.username || username
      } on MyRide!`

  const ogImageUrl = `${SITE_URL}/api/og/car?username=${encodeURIComponent(username)}&slug=${encodeURIComponent(carSlug)}&format=og`
  const fallbackImage = resolveCarImage(car) || `${SITE_URL}${DEFAULT_OG_IMAGE}`

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
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${car.name} - ${car.year} ${car.make} ${car.model}`,
        },
      ],
      siteName: 'MyRide',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl || fallbackImage],
    },
  }
}

export default async function CarDetailPage({ params }: CarPageProps) {
  const { locale: localeParam, username, car: carSlug } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const car = await getCarByUrlSlugAndUsername(carSlug, username)

  if (!car) {
    notFound()
  }

  let profile = null
  try {
    profile = await getProfileByUsername(username)
  } catch {
    profile = null
  }

  const carUrl = `${SITE_URL}/${locale}/u/${username}/${carSlug}`
  const image = resolveCarImage(car)

  const messages = await getDictionary(locale)
  const t = (key: string, fallback?: string): string => {
    const segments = key.split('.')
    let cursor: unknown = messages
    for (const segment of segments) {
      if (
        typeof cursor === 'object' &&
        cursor !== null &&
        segment in (cursor as Record<string, unknown>)
      ) {
        cursor = (cursor as Record<string, unknown>)[segment]
        continue
      }
      return fallback ?? key
    }
    return typeof cursor === 'string' ? cursor : (fallback ?? key)
  }

  const fuelLabel = translateFuelType(car.fuel_type, t)
  const transmissionLabel = translateTransmission(car.transmission, t)
  const drivetrainLabel = translateDrivetrain(car.drivetrain, t)

  return (
    <>
      <StructuredData
        id='schema-car'
        data={carJsonLdSchema({
          name: car.name,
          description: car.description,
          make: car.make,
          model: car.model,
          year: car.year,
          image,
          url: carUrl,
        })}
      />
      {/* Guaranteed translated enum labels in SSR HTML for crawlers */}
      <div className='sr-only'>
        <dl>
          {fuelLabel ? (
            <>
              <dt>{t('carDetail.specs.fields.fuel_type', 'Fuel Type')}</dt>
              <dd>{fuelLabel}</dd>
            </>
          ) : null}
          {transmissionLabel ? (
            <>
              <dt>
                {t('carDetail.specs.fields.transmission', 'Transmission')}
              </dt>
              <dd>{transmissionLabel}</dd>
            </>
          ) : null}
          {drivetrainLabel ? (
            <>
              <dt>{t('carDetail.specs.fields.drivetrain', 'Drivetrain')}</dt>
              <dd>{drivetrainLabel}</dd>
            </>
          ) : null}
        </dl>
      </div>
      <CarDetailPageClient initialCar={car} initialProfile={profile} />
    </>
  )
}
