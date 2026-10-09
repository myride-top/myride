import { Metadata } from 'next'
import { getCarByUrlSlugAndUsername } from '@/lib/database/cars'
import { getProfileByUsername } from '@/lib/database/profiles'
import { SITE_URL, buildLocaleAlternates } from '@/lib/constants/site'
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
  try {
    const { locale: localeParam, username, car: carSlug } = await params
    const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
    const path = `/u/${username}/${carSlug}`
    const { canonical, languages, openGraphUrl } = buildLocaleAlternates(
      locale,
      path
    )

    // First try to get the car
    const car = await getCarByUrlSlugAndUsername(carSlug, username)

    if (!car) {
      return {
        title: 'Car Not Found',
        description: 'The requested car could not be found.',
        alternates: { canonical, languages },
        openGraph: { url: openGraphUrl },
      }
    }

    // Try to get the profile, but don't fail if it doesn't exist
    let profile = null
    try {
      profile = await getProfileByUsername(username)
    } catch {}

    // Get the main photo URL or first available photo
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
    const fallbackImage = imageUrl || `${SITE_URL}/og-image-default.svg`

    const metadata: Metadata = {
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

    return metadata
  } catch {
    return {
      title: 'Car Details - MyRide',
      description: 'View car details on MyRide',
    }
  }
}

export default function CarLayout({ children }: CarLayoutProps) {
  return <>{children}</>
}
