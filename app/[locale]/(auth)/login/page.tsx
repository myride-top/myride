import { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'
import {
  OPEN_GRAPH_LOCALES,
  buildLocaleAlternates,
} from '@/lib/constants/site'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getServerTranslator, getTranslations } from '@/lib/i18n/server'

type LoginPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string }>
}

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const t = await getTranslations({ locale, namespace: 'meta' })
  const { canonical, languages, openGraphUrl } = buildLocaleAlternates(
    locale,
    '/login'
  )

  const title = t('login.title')
  const description = t('login.description')

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      locale: OPEN_GRAPH_LOCALES[locale],
      url: openGraphUrl,
      type: 'website',
      siteName: 'MyRide',
    },
    twitter: {
      title,
      description,
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { t } = await getServerTranslator()
  const { next } = await searchParams
  const registerHref = next
    ? `/register?next=${encodeURIComponent(next)}`
    : '/register'

  return (
    <div className='min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 pt-24'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-foreground'>
            {t('auth.login.pageTitle', 'Sign in to your account')}
          </h2>
          <p className='mt-2 text-center text-sm text-muted-foreground'>
            {t('auth.login.or', 'Or')}{' '}
            <Link
              href={registerHref}
              className='font-medium text-primary hover:text-primary/80 cursor-pointer'
            >
              {t('auth.login.createAccount', 'create a new account')}
            </Link>
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
