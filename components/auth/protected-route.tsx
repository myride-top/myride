'use client'

import { useAuth } from '@/lib/context/auth-context'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { LoadingSpinner } from '@/components/common/loading-spinner'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <LoadingSpinner message='Loading...' />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
