'use client'

import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from 'zustand/middleware'

export type CookieConsentStatus = 'accepted' | null

const LEGACY_STORAGE_KEY = 'myride-cookie-consent'

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

function getClientJSONStorage(): StateStorage {
  if (typeof window === 'undefined') {
    return noopStorage
  }
  try {
    const ls = window.localStorage
    if (typeof ls?.getItem === 'function') {
      return ls
    }
  } catch {
    /* ignore */
  }
  return noopStorage
}

interface CookieConsentState {
  consentStatus: CookieConsentStatus
  acceptCookies: () => void
  declineCookies: () => void
  clearConsent: () => void
}

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    set => ({
      consentStatus: null,
      acceptCookies: () => set({ consentStatus: 'accepted' }),
      declineCookies: () => set({ consentStatus: null }),
      clearConsent: () => set({ consentStatus: null }),
    }),
    {
      name: 'myride-cookie-consent-store',
      storage: createJSONStorage(getClientJSONStorage),
      partialize: state => ({ consentStatus: state.consentStatus }),
    }
  )
)

/** One-time migration from pre-Zustand plain localStorage value. */
export function migrateLegacyCookieConsentKey(): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy === 'accepted') {
      useCookieConsentStore.setState({ consentStatus: 'accepted' })
    }
    if (legacy !== null) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  } catch {
    /* ignore broken storage */
  }
}
