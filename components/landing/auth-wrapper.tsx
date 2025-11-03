'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { LoadingSpinner } from '@/components/common/loading-spinner'

interface AuthWrapperProps {
  children: ReactNode
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
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

  return <>{children}</>
}
