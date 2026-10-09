import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getProfileByUsername } from '@/lib/database/profiles'
import { getCarsByUser } from '@/lib/database/cars'
import {
  DEFAULT_OG_IMAGE,
  OPEN_GRAPH_LOCALES,
  buildLocaleAlternates,
} from '@/lib/constants/site'
import { buildLocalePath, isLocale, type Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/server'
import type { Car, Profile } from '@/lib/types/database'
import ProfileGaragePageClient from './garage-page-client'

type ProfilePageProps = {
  params: Promise<{ locale: string; username: string }>
}

async function loadProfilePageData(username: string): Promise<{
  profile: Profile | null
  cars: Car[]
}> {
  try {
    const profile = await getProfileByUsername(username)
    if (!profile) {
      return { profile: null, cars: [] }
    }

    let cars: Car[] = []
    try {
      cars = (await getCarsByUser(profile.id)) || []
    } catch (error) {
      console.error('Failed to load garage cars:', error)
      cars = []
    }

    return { profile, cars }
  } catch (error) {
    console.error('Failed to load profile page:', error)
    return { profile: null, cars: [] }
  }
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

  const { profile } = await loadProfilePageData(username)
  if (!profile) {
    notFound()
  }

  const isPremium = Boolean(profile.is_premium)
  const t = await getTranslations({ locale, namespace: 'meta' })
  const usernameHandle = profile.username
  const title = t('profile.title', { username: usernameHandle })
  const description = t('profile.description', { username: usernameHandle })

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
              alt: title,
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
    robots: isPremium
      ? { index: true, follow: true }
      : { index: false, follow: true },
  }
}

export default async function ProfileGaragePage({ params }: ProfilePageProps) {
  const { locale: localeParam, username } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const { profile, cars } = await loadProfilePageData(username)

  if (!profile) {
    notFound()
  }

  const isPremium = Boolean(profile.is_premium)
  const displayName = profile.full_name || `@${profile.username}`

  return (
    <>
      {/* Guaranteed in SSR HTML even if client trees stream later */}
      {isPremium ? (
        <div className='sr-only'>
          <h1>{displayName}</h1>
          <ul>
            {cars.map(car => (
              <li key={car.id}>
                <Link
                  href={buildLocalePath(
                    locale,
                    `/u/${profile.username}/${car.url_slug}`
                  )}
                >
                  {car.name || `${car.make} ${car.model}`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ProfileGaragePageClient initialProfile={profile} initialCars={cars} />
    </>
  )
}
