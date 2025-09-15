'use client'

import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCookieConsent } from '@/lib/hooks/use-cookie-consent'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  const { consentStatus, isLoaded, acceptCookies, declineCookies } =
    useCookieConsent()

  useEffect(() => {
    // Only show if consent hasn't been given and component is loaded
    if (isLoaded && !consentStatus) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, consentStatus])

  // Don't show cookie consent on car detail pages
  if (pathname.match(/^\/[^\/]+\/[^\/]+$/)) {
    return null
  }

  const handleAccept = () => {
    acceptCookies()
    setIsVisible(false)
  }

  const handleDecline = () => {
    declineCookies()
    setIsVisible(false)
  }

  const handleClose = () => {
    // Just hide the banner without saving any consent status
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300'>
      <div className='bg-card border-t border-border/50 backdrop-blur supports-[backdrop-filter]:bg-card/80'>
        <div className='max-w-7xl mx-auto px-4 py-3'>
          <div className='flex items-center justify-between gap-4'>
            {/* Cookie Icon and Text */}
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              <Cookie className='h-5 w-5 text-primary flex-shrink-0' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm text-muted-foreground'>
                  We use cookies to enhance your experience. By continuing to
                  use this site, you agree to our{' '}
                  <Link
                    href='/legal/cookies'
                    className='text-primary hover:underline font-medium'
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-2 flex-shrink-0'>
              <button
                onClick={handleDecline}
                className='text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded'
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className='text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-3 py-1 rounded font-medium'
              >
                Accept
              </button>
              <button
                onClick={handleClose}
                className='text-muted-foreground hover:text-foreground transition-colors p-1 rounded'
                aria-label='Close cookie notice'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
