'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import {
  LOCALE_CHANGE_EVENT,
  LOCALE_COOKIE_NAME,
  LOCALES,
  buildLocalePath,
  getLocaleFromPathname,
  type Locale,
} from '@/lib/i18n/config'
import { useI18n } from '@/lib/i18n/provider'
import { LocaleFlag } from '@/components/common/locale-flag'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  cs: 'Czech',
  es: 'Spanish',
  de: 'German',
}

export const LanguageSwitcher = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale, t } = useI18n()

  const currentLocale = useMemo<Locale>(() => {
    const localeFromPath = getLocaleFromPathname(pathname)
    return localeFromPath ?? locale
  }, [locale, pathname])

  const getLocaleLabel = (value: Locale) => LOCALE_LABELS[value]

  const handleLocaleChange = (nextLocale: string) => {
    if (!LOCALES.includes(nextLocale as Locale)) {
      return
    }

    const resolved = nextLocale as Locale
    const nextPath = buildLocalePath(resolved, pathname)
    const query = searchParams.toString()

    document.cookie = `${LOCALE_COOKIE_NAME}=${resolved}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`
    window.dispatchEvent(
      new CustomEvent<Locale>(LOCALE_CHANGE_EVENT, {
        detail: resolved,
      })
    )
    router.replace(query ? `${nextPath}?${query}` : nextPath, {
      scroll: false,
    })
  }

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger
        className='w-[148px] h-9 text-xs md:text-sm'
        aria-label={t('lang.label', 'Language')}
      >
        <div className='flex items-center gap-2 min-w-0'>
          <LocaleFlag
            locale={currentLocale}
            className='shrink-0 self-center'
            title={getLocaleLabel(currentLocale)}
          />
          <span className='truncate leading-none'>{getLocaleLabel(currentLocale)}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((item) => (
          <SelectItem key={item} value={item}>
            <span className='flex items-center gap-2'>
              <LocaleFlag
                locale={item}
                className='shrink-0 self-center'
                title={getLocaleLabel(item)}
              />
              <span className='leading-none'>{getLocaleLabel(item)}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
