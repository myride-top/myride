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
  metadataBase: new URL('https://myride.top'),
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      cs: '/cs',
      es: '/es',
      de: '/de',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myride.top',
    siteName: 'MyRide',
    title: 'MyRide - Showcase Your Car to the World',
    description:
      'The ultimate platform for car enthusiasts to showcase their vehicles. Share detailed specifications, photos, and connect with fellow car lovers.',
  },
  twitter: {
    card: 'summary',
    site: '@myride',
    creator: '@myride',
    title: 'MyRide - Showcase Your Car to the World',
    description:
      'The ultimate platform for car enthusiasts to showcase their vehicles. Share detailed specifications, photos, and connect with fellow car lovers.',
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
  verification: {
    google: 'your-google-verification-code',
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel='icon' href='/icon.svg' type='image/svg+xml' />
        <link rel='alternate icon' href='/favicon.ico' />
      </head>
      <body
        className={`${commissioner.variable} ${atkinson.variable} antialiased`}
      >
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
