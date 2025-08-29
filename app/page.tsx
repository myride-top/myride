import { Metadata } from 'next'
import { Suspense } from 'react'
import { getPlatformStatsServer } from '@/lib/database/stats-server'
import { LandingNavbar } from '@/components/navbar'
import HeroSection from '@/components/landing/hero-section'
import StatsSection from '@/components/landing/stats-section'
import FeaturesSection from '@/components/landing/features-section'
import TestimonialsSection from '@/components/landing/testimonials-section'
import CTASection from '@/components/landing/cta-section'
import Footer from '@/components/landing/footer'
import LoadingSpinner from '@/components/common/loading-spinner'
import AuthWrapper from '@/components/landing/auth-wrapper'

export const metadata: Metadata = {
  title: 'MyRide - Showcase Your Car to the World',
  description:
    'The ultimate platform for car enthusiasts to showcase their vehicles. Share detailed specifications, photos, and connect with fellow car lovers. Fast, easy, and beautiful.',
  keywords:
    'car showcase, vehicle gallery, car enthusiasts, automotive community, car photos, vehicle specifications, car modifications',
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
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myride.top',
    siteName: 'MyRide',
    title: 'MyRide - Showcase Your Car to the World',
    description:
      'The ultimate platform for car enthusiasts to showcase their vehicles. Share detailed specifications, photos, and connect with fellow car lovers.',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'MyRide - The Ultimate Car Showcase Platform',
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
    images: ['/og-image-default.svg'],
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
}

// Create a server component wrapper for the landing content
async function LandingContent() {
  // Fetch stats once on the server
  const platformStats = await getPlatformStatsServer()

  return (
    <>
      <LandingNavbar />
      <main className='min-h-screen'>
        <HeroSection />
        <StatsSection initialStats={platformStats} />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection initialUserCount={platformStats.totalUsers} />
      </main>
      <Footer />
    </>
  )
}

export default function MainPage() {
  return (
    <AuthWrapper>
      <Suspense
        fallback={
          <main className='min-h-screen flex items-center justify-center bg-background'>
            <LoadingSpinner message='Loading...' />
          </main>
        }
      >
        <LandingContent />
      </Suspense>
    </AuthWrapper>
  )
}
