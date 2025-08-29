import type { Metadata } from 'next'
import { Commissioner, Atkinson_Hyperlegible } from 'next/font/google'
import { AuthProvider } from '@/lib/context/auth-context'
import { UnitProvider } from '@/lib/context/unit-context'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from 'sonner'
import CookieConsent from '@/components/common/cookie-consent'
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
        className={`${commissioner.variable} ${atkinson.variable} antialiased`}
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
