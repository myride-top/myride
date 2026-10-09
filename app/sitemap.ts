import { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/i18n/config'
import { SITE_URL } from '@/lib/constants/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: Array<{
    path: string
    changeFrequency:
      | 'always'
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'yearly'
      | 'never'
    priority: number
  }> = [
    { path: '/browse', changeFrequency: 'daily', priority: 1 },
    { path: '/clubs/explore', changeFrequency: 'daily', priority: 0.8 },
    { path: '/legal/terms', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/legal/privacy', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/legal/cookies', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/legal/licenses', changeFrequency: 'yearly', priority: 0.5 },
  ]

  const lastModified = new Date()
  const localizedEntries = staticRoutes.flatMap((route) =>
    LOCALES.map((locale) => {
      const languages: Record<string, string> = {
        'x-default': `${SITE_URL}/en${route.path}`,
      }
      for (const loc of LOCALES) {
        languages[loc] = `${SITE_URL}/${loc}${route.path}`
      }

      return {
        url: `${SITE_URL}/${locale}${route.path}`,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages,
        },
      }
    })
  )
  return localizedEntries
}
