import type { Metadata } from 'next'
import { Commissioner, Atkinson_Hyperlegible } from 'next/font/google'
import { cookies, headers } from 'next/headers'
import { AuthProvider } from '@/lib/context/auth-context'
import { UnitProvider } from '@/lib/context/unit-context'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { CookieConsent } from '@/components/common/cookie-consent'
import { I18nProvider } from '@/lib/i18n/provider'
import { getDictionary } from '@/lib/i18n/dictionaries'
import {
  DEFAULT_LOCALE,
  LOCALE_HEADER_NAME,
  LOCALE_COOKIE_NAME,
  isLocale,
  type Locale,
} from '@/lib/i18n/config'
import {
  StructuredData,
  websiteSchema,
  organizationSchema,
} from '@/components/common/structured-data'
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/constants/site'
import './globals.css'

const commissioner = Commissioner({
  variable: '--font-commissioner',
  subsets: ['latin'],
})

const atkinson = Atkinson_Hyperlegible({
  variable: '--font-atkinson',
  weight: ['400', '700'],
  subsets: ['latin'],
})

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  title: {
    default: 'MyRide - Showcase Your Car to the World',
    template: '%s | MyRide',
  },
  description:
    'The ultimate platform for car enthusiasts to showcase their vehicles. Share detailed specifications, photos, and connect with fellow car lovers. Fast, easy, and beautiful.',
  keywords:
    'car showcase, vehicle gallery, car enthusiasts, automotive community, car photos, vehicle specifications, car modifications, automotive platform',
  authors: [{ name: 'MyRide Team' }],
  creator: 'MyRide',
  publisher: 'MyRide',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/en/browse',
    languages: {
      en: '/en/browse',
      cs: '/cs/browse',
      es: '/es/browse',
      de: '/de/browse',
      'x-default': '/en/browse',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/en/browse',
    siteName: 'MyRide',
    title: 'MyRide - Showcase Your Car to the World',
    description:
      'The ultimate platform for car enthusiasts to showcase their vehicles. Share detailed specifications, photos, and connect with fellow car lovers.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'MyRide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@myride',
    creator: '@myride',
    title: 'MyRide - Showcase Your Car to the World',
    description:
      'The ultimate platform for car enthusiasts to showcase their vehicles. Share detailed specifications, photos, and connect with fellow car lovers.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
  },
  category: 'automotive',
  classification: 'car showcase platform',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerStore = await headers()
  const cookieStore = await cookies()
  const localeFromHeader = headerStore.get(LOCALE_HEADER_NAME)
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value
  const locale: Locale = isLocale(localeFromHeader)
    ? localeFromHeader
    : isLocale(localeFromCookie)
      ? localeFromCookie
      : DEFAULT_LOCALE
  const messages = await getDictionary(locale)

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${commissioner.variable} ${atkinson.variable}`}
    >
      <body className='antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider locale={locale} messages={messages}>
            <AuthProvider>
              <UnitProvider>
                {children}
                <Toaster
                  position='bottom-right'
                  richColors
                  closeButton
                  duration={4000}
                />
                <CookieConsent />
                <StructuredData id='schema-website' data={websiteSchema} />
                <StructuredData
                  id='schema-organization'
                  data={organizationSchema}
                />
              </UnitProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
