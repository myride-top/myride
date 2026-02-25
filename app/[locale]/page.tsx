import { redirect } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    redirect('/en/browse')
  }

  redirect(`/${locale}/browse`)
}
