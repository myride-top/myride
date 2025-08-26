'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import Link from 'next/link'

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
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>Loading...</p>
        </div>
      </main>
    )
  }

  if (user) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>Redirecting to platform...</p>
        </div>
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
            className='inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors'
          >
            Sign In
          </Link>
          <Link
            href='/register'
            className='inline-block bg-card text-primary px-6 py-3 rounded-md font-medium border border-primary hover:bg-accent transition-colors'
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  )
}
