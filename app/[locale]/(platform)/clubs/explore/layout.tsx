import { buildLocaleAlternates } from '@/lib/constants/site'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { Metadata } from 'next'

type ExploreClubsLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: ExploreClubsLayoutProps): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const { canonical, languages, openGraphUrl } = buildLocaleAlternates(
    locale,
    '/clubs/explore'
  )

  return {
    title: 'Explore Clubs',
    description:
      'Discover car enthusiast clubs on MyRide. Browse public clubs by country, members, and name.',
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: 'MyRide - Explore Clubs',
      description:
        'Discover car enthusiast clubs on MyRide. Browse public clubs by country, members, and name.',
      type: 'website',
      url: openGraphUrl,
      siteName: 'MyRide',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function ExploreClubsLayout({
  children,
}: ExploreClubsLayoutProps) {
  return children
}
