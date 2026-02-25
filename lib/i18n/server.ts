import { cookies } from 'next/headers'
import { headers } from 'next/headers'
import {
  DEFAULT_LOCALE,
  LOCALE_HEADER_NAME,
  LOCALE_COOKIE_NAME,
  isLocale,
  type Locale,
} from '@/lib/i18n/config'
import { getDictionary, type MessageDictionary } from '@/lib/i18n/dictionaries'

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

export const getServerLocale = async (): Promise<Locale> => {
  const headerStore = await headers()
  const cookieStore = await cookies()
  const localeFromHeader = headerStore.get(LOCALE_HEADER_NAME)
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value

  if (isLocale(localeFromHeader)) {
    return localeFromHeader
  }

  if (isLocale(localeFromCookie)) {
    return localeFromCookie
  }

  return DEFAULT_LOCALE
}

export const getServerTranslator = async () => {
  const locale = await getServerLocale()
  const messages = await getDictionary(locale)

  const t = (key: string, fallback?: string): string => {
    const translated = getMessageByKey(messages, key)
    if (translated) {
      return translated
    }

    return fallback ?? key
  }

  return { locale, t }
}
