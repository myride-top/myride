export const LOCALES = ['en', 'cs', 'es', 'de'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE_NAME = 'myride_locale'
export const LOCALE_CHANGE_EVENT = 'myride:locale-change'
export const LOCALE_HEADER_NAME = 'x-myride-locale'

export const isLocale = (value: string | null | undefined): value is Locale =>
  Boolean(value) && LOCALES.includes(value as Locale)

export const getLocaleFromPathname = (pathname: string): Locale | null => {
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  return isLocale(firstSegment) ? firstSegment : null
}

export const stripLocaleFromPathname = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return '/'
  }

  if (isLocale(segments[0])) {
    const stripped = segments.slice(1)
    return stripped.length > 0 ? `/${stripped.join('/')}` : '/'
  }

  return pathname
}

export const buildLocalePath = (locale: Locale, pathname: string): string => {
  const normalized = stripLocaleFromPathname(pathname)
  if (normalized === '/') {
    return `/${locale}`
  }
  return `/${locale}${normalized}`
}
