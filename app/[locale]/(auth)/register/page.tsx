import { Metadata } from 'next'
import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'
import {
  OPEN_GRAPH_LOCALES,
  buildLocaleAlternates,
} from '@/lib/constants/site'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getServerTranslator, getTranslations } from '@/lib/i18n/server'

type RegisterPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string }>
}

export async function generateMetadata({
  params,
}: RegisterPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale: Locale = isLocale(localeParam) ? localeParam : 'en'
  const t = await getTranslations({ locale, namespace: 'meta' })
  const { canonical, languages, openGraphUrl } = buildLocaleAlternates(
    locale,
    '/register'
  )

  const title = t('register.title')
  const description = t('register.description')

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

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { t } = await getServerTranslator()
  const { next } = await searchParams
  const loginHref = next
    ? `/login?next=${encodeURIComponent(next)}`
    : '/login'

  return (
    <div className='min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 pt-24'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-foreground'>
            {t('auth.register.pageTitle', 'Create your account')}
          </h2>
          <p className='mt-2 text-center text-sm text-muted-foreground'>
            {t('auth.register.or', 'Or')}{' '}
            <Link
              href={loginHref}
              className='font-medium text-primary hover:text-primary/80 cursor-pointer'
            >
              {t(
                'auth.register.signInExisting',
                'sign in to your existing account'
              )}
            </Link>
          </p>
        </div>
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
