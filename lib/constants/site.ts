import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
} from '@/lib/i18n/config'

export const SITE_URL = 'https://www.myride.top'

/** Build canonical + hreflang alternates for a locale-prefixed path (e.g. `/browse`). */
export function buildLocaleAlternates(locale: Locale, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const pathSuffix = normalizedPath === '/' ? '' : normalizedPath
  const canonical = `/${locale}${pathSuffix}`

  const languages: Record<string, string> = {
    'x-default': `/${DEFAULT_LOCALE}${pathSuffix}`,
  }

  for (const loc of LOCALES) {
    languages[loc] = `/${loc}${pathSuffix}`
  }

  return {
    canonical,
    languages,
    openGraphUrl: canonical,
  }
}
