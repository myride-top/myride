'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/provider'
import { buildLocalePath } from '@/lib/i18n/config'

export const MinimalFooter = () => {
  const { t, locale } = useI18n()

  const links = [
    { href: '/legal/terms', label: t('footer.terms', 'Terms') },
    { href: '/legal/privacy', label: t('footer.privacy', 'Privacy') },
    { href: '/legal/cookies', label: t('footer.cookies', 'Cookies') },
    { href: '/legal/licenses', label: t('footer.licenses', 'Licenses') },
  ] as const

  return (
    <footer className='border-t border-border/50 bg-background/50 mt-auto'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground'>
            {links.map((link, index) => (
              <span key={link.href} className='contents'>
                {index > 0 ? (
                  <span className='text-muted-foreground/50'>•</span>
                ) : null}
                <Link
                  href={buildLocalePath(locale, link.href)}
                  className='hover:text-primary transition-colors'
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>
          <p className='text-xs text-center text-muted-foreground'>
            &copy; {new Date().getFullYear()} MyRide.{' '}
            {t('footer.rightsReserved', 'All rights reserved.')}{' '}
            {t('footer.createdBy', 'Created by')}{' '}
            <Link href='https://baudys.dev' className='underline'>
              Daniel Anthony Baudyš
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
