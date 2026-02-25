'use client'

import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import {
  DEFAULT_LOCALE,
  LOCALE_CHANGE_EVENT,
  getLocaleFromPathname,
  isLocale,
  type Locale,
} from '@/lib/i18n/config'
import { DICTIONARIES, type MessageDictionary } from '@/lib/i18n/dictionaries'

interface I18nContextValue {
  locale: Locale
  messages: MessageDictionary
  t: (key: string, fallback?: string) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

const getMessageByKey = (
  messages: MessageDictionary,
  key: string
): string | null => {
  const segments = key.split('.')
  let cursor: unknown = messages

  for (const segment of segments) {
    if (
      typeof cursor === 'object' &&
      cursor !== null &&
      segment in (cursor as Record<string, unknown>)
    ) {
      cursor = (cursor as Record<string, unknown>)[segment]
      continue
    }

    return null
  }

  return typeof cursor === 'string' ? cursor : null
}

interface I18nProviderProps {
  locale: Locale
  messages: MessageDictionary
  children: ReactNode
}

export const I18nProvider = ({
  locale,
  messages,
  children,
}: I18nProviderProps) => {
  const pathname = usePathname()
  const [runtimeLocale, setRuntimeLocale] = useState<Locale>(locale)

  useEffect(() => {
    setRuntimeLocale(locale)
  }, [locale])

  useEffect(() => {
    const localeFromPath = getLocaleFromPathname(pathname)
    if (localeFromPath) {
      setRuntimeLocale(localeFromPath)
    }
  }, [pathname])

  useEffect(() => {
    const handleLocaleChange = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (isLocale(detail)) {
        setRuntimeLocale(detail)
      }
    }

    window.addEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange)

    return () => {
      window.removeEventListener(LOCALE_CHANGE_EVENT, handleLocaleChange)
    }
  }, [])

  const value = useMemo<I18nContextValue>(() => {
    const activeLocale = runtimeLocale
    const activeMessages =
      DICTIONARIES[activeLocale] ?? DICTIONARIES[DEFAULT_LOCALE] ?? messages

    const t = (key: string, fallback?: string): string => {
      const message = getMessageByKey(activeMessages, key)
      if (message) {
        return message
      }
      return fallback ?? key
    }

    return {
      locale: activeLocale,
      messages: activeMessages,
      t,
    }
  }, [messages, runtimeLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  return context
}
