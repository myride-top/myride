import { Metadata } from 'next'
import { getCarByUrlSlugAndUsername } from '@/lib/database/cars'
import { getProfileByUsername } from '@/lib/database/profiles'

interface CarLayoutProps {
  children: React.ReactNode
  params: Promise<{
    username: string
    car: string
  }>
}

export async function generateMetadata({
  params,
}: CarLayoutProps): Promise<Metadata> {
  try {
    const { username, car: carSlug } = await params

    // First try to get the car
    const car = await getCarByUrlSlugAndUsername(carSlug, username)

    if (!car) {
      return {
        title: 'Car Not Found',
        description: 'The requested car could not be found.',
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

    const metadata: Metadata = {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://myride.top/${username}/${carSlug}`,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: `${car.name} - ${car.year} ${car.make} ${car.model}`,
              },
            ]
          : [
              {
                url: '/og-image-default.svg', // Local default image
                width: 1200,
                height: 630,
                alt: 'MyRide - Share Your Ride',
              },
            ],
        siteName: 'MyRide',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : ['/og-image-default.svg'],
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
