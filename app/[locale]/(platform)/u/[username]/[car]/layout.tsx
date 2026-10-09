import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCarByUrlSlugAndUsername } from '@/lib/database/cars'
import { getProfileByUsername } from '@/lib/database/profiles'
import {
  DEFAULT_OG_IMAGE,
  OPEN_GRAPH_LOCALES,
  SITE_URL,
  buildLocaleAlternates,
} from '@/lib/constants/site'
import { isLocale, type Locale } from '@/lib/i18n/config'

interface CarLayoutProps {
  children: React.ReactNode
  params: Promise<{
    locale: string
    username: string
    car: string
  }>
}

export async function generateMetadata({
  params,
}: CarLayoutProps): Promise<Metadata> {
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
    // Profile is optional for metadata branding
  }

  let imageUrl = car.main_photo_url
  if (!imageUrl && car.photos && car.photos.length > 0) {
    const firstPhoto = car.photos[0]
    if (typeof firstPhoto === 'string') {
      imageUrl = firstPhoto
    } else if (
      firstPhoto &&
      typeof firstPhoto === 'object' &&
      firstPhoto.url
    ) {
      imageUrl = firstPhoto.url
    }
  }

  const title = `${car.name} by @${profile?.username || username}`
  const description = car.description
    ? `${car.description} - ${car.year} ${car.make} ${car.model}`
    : `Check out this ${car.year} ${car.make} ${car.model} by @${
        profile?.username || username
      } on MyRide!`

  const ogImageUrl = `${SITE_URL}/api/og/car?username=${encodeURIComponent(username)}&slug=${encodeURIComponent(carSlug)}&format=og`
  const fallbackImage = imageUrl || `${SITE_URL}${DEFAULT_OG_IMAGE}`

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

export default function CarLayout({ children }: CarLayoutProps) {
  return <>{children}</>
}
