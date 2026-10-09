import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProfileByUsername } from '@/lib/database/profiles'
import { getCarsByUser } from '@/lib/database/cars'
import {
  DEFAULT_OG_IMAGE,
  OPEN_GRAPH_LOCALES,
  buildLocaleAlternates,
} from '@/lib/constants/site'
import { isLocale, type Locale } from '@/lib/i18n/config'
import ProfileGaragePageClient from './garage-page-client'

type ProfilePageProps = {
  params: Promise<{ locale: string; username: string }>
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale: localeParam, username } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const path = `/u/${username}`
  const { canonical, languages, openGraphUrl } = buildLocaleAlternates(
    locale,
    path
  )

  const profile = await getProfileByUsername(username)
  if (!profile) {
    notFound()
  }

  const title = `${profile.full_name || profile.username}'s Garage`
  const description = profile.full_name
    ? `Check out ${profile.full_name}'s car collection on MyRide!`
    : `Check out @${profile.username}'s car collection on MyRide!`

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
              url: DEFAULT_OG_IMAGE,
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
      images: profile.avatar_url
        ? [profile.avatar_url]
        : [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function ProfileGaragePage({ params }: ProfilePageProps) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) {
    notFound()
  }

  const cars = (await getCarsByUser(profile.id)) || []

  return (
    <ProfileGaragePageClient initialProfile={profile} initialCars={cars} />
  )
}
