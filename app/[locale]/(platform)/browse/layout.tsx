import { MinimalFooter } from '@/components/common/minimal-footer'
import { buildLocaleAlternates } from '@/lib/constants/site'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { Metadata } from 'next'

type BrowseLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: BrowseLayoutProps): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const { canonical, languages, openGraphUrl } = buildLocaleAlternates(
    locale,
    '/browse'
  )

  return {
    title: 'Browse Cars',
    description:
      'Discover amazing cars from the MyRide community. Browse through detailed car specifications, photos, and modifications shared by car enthusiasts worldwide.',
    keywords:
      'browse cars, car gallery, vehicle showcase, automotive community, car photos, car specifications, car modifications',
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: 'MyRide - Browse Cars',
      description:
        'Discover amazing cars from the MyRide community. Browse through detailed car specifications, photos, and modifications shared by car enthusiasts worldwide.',
      type: 'website',
      url: openGraphUrl,
      siteName: 'MyRide',
      images: [
        {
          url: '/og-image-default.svg',
          width: 1200,
          height: 630,
          alt: 'Browse Cars on MyRide',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'MyRide - Browse Cars',
      description:
        'Discover amazing cars from the MyRide community. Browse through detailed car specifications, photos, and modifications shared by car enthusiasts worldwide.',
      images: ['/og-image-default.svg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function BrowseLayout({ children }: BrowseLayoutProps) {
  return (
    <>
      {children}
      <MinimalFooter />
    </>
  )
}
