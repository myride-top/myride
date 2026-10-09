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

const interpolate = (
  template: string,
  values?: Record<string, string | number>
): string => {
  if (!values) {
    return template
  }

  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, String(value))
  }
  return result
}

/** next-intl-compatible translator scoped to a message namespace. */
export const getTranslations = async ({
  locale,
  namespace,
}: {
  locale: Locale
  namespace: string
}) => {
  const messages = await getDictionary(locale)

  return (
    key: string,
    valuesOrFallback?: string | Record<string, string | number>,
    fallback?: string
  ): string => {
    const values =
      typeof valuesOrFallback === 'object' ? valuesOrFallback : undefined
    const explicitFallback =
      typeof valuesOrFallback === 'string' ? valuesOrFallback : fallback

    const translated = getMessageByKey(messages, `${namespace}.${key}`)
    const template =
      translated ?? explicitFallback ?? `${namespace}.${key}`

    return interpolate(template, values)
  }
}
