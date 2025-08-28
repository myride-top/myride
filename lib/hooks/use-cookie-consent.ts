'use client'

import { useState, useEffect } from 'react'

const COOKIE_CONSENT_KEY = 'myride-cookie-consent'

export type CookieConsentStatus = 'accepted' | null

export function useCookieConsent() {
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Get consent status from localStorage
    const stored = localStorage.getItem(
      COOKIE_CONSENT_KEY
    ) as CookieConsentStatus
    setConsentStatus(stored)
    setIsLoaded(true)
  }, [])

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setConsentStatus('accepted')
  }

  const declineCookies = () => {
    // Don't store declined status - just return to null state
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    setConsentStatus(null)
  }

  const clearConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    setConsentStatus(null)
  }

  return {
    consentStatus,
    isLoaded,
    hasConsented: consentStatus === 'accepted',
    acceptCookies,
    declineCookies,
    clearConsent,
  }
}
