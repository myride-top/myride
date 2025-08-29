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
