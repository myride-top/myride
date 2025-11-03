'use client'

import { useAuth } from '@/lib/context/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { LandingNavbar } from '@/components/navbar/landing-navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

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
    <main className='min-h-screen bg-background'>
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </main>
  )
}
