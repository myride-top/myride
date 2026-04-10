'use client'

import { useEffect, useState } from 'react'
import {
  migrateLegacyCookieConsentKey,
  useCookieConsentStore,
  type CookieConsentStatus,
} from '@/lib/stores/cookie-consent-store'

export type { CookieConsentStatus }

export function useCookieConsent() {
  const consentStatus = useCookieConsentStore(s => s.consentStatus)
  const acceptCookies = useCookieConsentStore(s => s.acceptCookies)
  const declineCookies = useCookieConsentStore(s => s.declineCookies)
  const clearConsent = useCookieConsentStore(s => s.clearConsent)

  const [isLoaded, setIsLoaded] = useState(() =>
    useCookieConsentStore.persist.hasHydrated()
  )

  useEffect(() => {
    const onReady = () => {
      migrateLegacyCookieConsentKey()
      setIsLoaded(true)
    }

    if (useCookieConsentStore.persist.hasHydrated()) {
      onReady()
      return
    }

    const unsub = useCookieConsentStore.persist.onFinishHydration(onReady)
    return unsub
  }, [])

  return {
    consentStatus,
    isLoaded,
    hasConsented: consentStatus === 'accepted',
    acceptCookies,
    declineCookies,
    clearConsent,
  }
}
