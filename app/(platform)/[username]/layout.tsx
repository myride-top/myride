import { Metadata } from 'next'
import { getProfileByUsername } from '@/lib/database/profiles'
import { MinimalFooter } from '@/components/common/minimal-footer'

interface ProfileLayoutProps {
  children: React.ReactNode
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({
  params,
}: ProfileLayoutProps): Promise<Metadata> {
  try {
    const { username } = await params

    // Try to get the profile
    const profile = await getProfileByUsername(username)

    if (!profile) {
      return {
        title: 'Profile Not Found',
        description: 'The requested profile could not be found.',
      }
    }

    const title = `${profile.full_name || profile.username}'s Garage`
    const description = profile.full_name
      ? `Check out ${profile.full_name}'s car collection on MyRide!`
      : `Check out @${profile.username}'s car collection on MyRide!`

    const metadata: Metadata = {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://myride.top/${username}`,
        images: profile.avatar_url
          ? [
              {
                url: profile.avatar_url,
                width: 1200,
                height: 630,
                alt: `${profile.full_name || profile.username}'s Garage`,
              },
            ]
          : [
              {
                url: '/og-image-default.svg',
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
        images: profile.avatar_url ? [profile.avatar_url] : ['/og-image-default.svg'],
      },
    }

    return metadata
  } catch {
    return {
      title: 'Profile - MyRide',
      description: 'View profile on MyRide',
    }
  }
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <>
      {children}
      <MinimalFooter />
    </>
  )
}

