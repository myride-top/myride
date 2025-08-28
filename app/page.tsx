'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/loading-spinner'

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
    <main className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center max-w-2xl mx-auto px-4'>
        <h1 className='text-4xl font-bold text-foreground mb-4'>MyRide</h1>
        <p className='text-xl text-muted-foreground mb-8'>
          Showcase your car to friends and audience with super fast and easy to
          use platform
        </p>
        <div className='space-x-4'>
          <Link
            href='/login'
            className='inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors cursor-pointer'
          >
            Sign In
          </Link>
          <Link
            href='/register'
            className='inline-block bg-card text-primary px-6 py-3 rounded-md font-medium border border-primary hover:bg-accent transition-colors cursor-pointer'
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  )
}
