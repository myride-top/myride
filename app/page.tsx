'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import LoadingSpinner from '@/components/common/loading-spinner'
import LandingNavbar from '@/components/landing/landing-navbar'
import HeroSection from '@/components/landing/hero-section'
import StatsSection from '@/components/landing/stats-section'
import FeaturesSection from '@/components/landing/features-section'
import TestimonialsSection from '@/components/landing/testimonials-section'
import CTASection from '@/components/landing/cta-section'
import Footer from '@/components/layout/footer'

export default function MainPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <LoadingSpinner message='Loading...' />
      </main>
    )
  }

  if (user) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <LoadingSpinner message='Redirecting to platform...' />
      </main>
    )
  }

  return (
    <>
      <LandingNavbar />
      <main className='min-h-screen'>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
