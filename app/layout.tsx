import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/context/auth-context'
import { UnitProvider } from '@/lib/context/unit-context'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from 'sonner'
import CookieConsent from '@/components/common/cookie-consent'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'MyRide - Showcase Your Car',
  description:
    'Showcase your car to friends and audience with super fast and easy to use platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <UnitProvider>
              {children}
              <Toaster
                position='top-right'
                richColors
                closeButton
                duration={4000}
              />
              <CookieConsent />
            </UnitProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
