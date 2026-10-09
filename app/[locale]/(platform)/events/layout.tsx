import { MinimalFooter } from '@/components/common/minimal-footer'
import {
  DEFAULT_OG_IMAGE,
  OPEN_GRAPH_LOCALES,
  buildLocaleAlternates,
} from '@/lib/constants/site'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/server'
import { Metadata } from 'next'

type EventsLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: EventsLayoutProps): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const t = await getTranslations({ locale, namespace: 'meta' })
  const { canonical, languages, openGraphUrl } = buildLocaleAlternates(
    locale,
    '/events'
  )

  const title = t('events.title')
  const description = t('events.description')

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
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: t('events.ogAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function EventsLayout({ children }: EventsLayoutProps) {
  return (
    <>
      {children}
      <MinimalFooter />
    </>
  )
}
