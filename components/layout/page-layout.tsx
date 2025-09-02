import React from 'react'
import { cn } from '@/lib/utils'
import { MainNavbar, LandingNavbar } from '@/components/navbar'

interface PageLayoutProps {
  children: React.ReactNode
  user?: {
    id: string
    name?: string
    email: string
    image?: string
  }
  showCreateButton?: boolean
  className?: string
  mainClassName?: string
  containerClassName?: string
}

export default function PageLayout({
  children,
  user,
  showCreateButton = false,
  className = '',
  mainClassName = '',
  containerClassName = '',
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {user ? (
        <MainNavbar showCreateButton={showCreateButton} />
      ) : (
        <LandingNavbar />
      )}

      <main
        className={cn(
          'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24',
          mainClassName
        )}
      >
        <div className={cn('px-4 py-6 sm:px-0', containerClassName)}>
          {children}
        </div>
      </main>
    </div>
  )
}
