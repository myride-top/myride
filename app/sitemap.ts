import { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/i18n/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://myride.top'
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
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/browse', changeFrequency: 'daily', priority: 0.9 },
    { path: '/legal/terms', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/legal/privacy', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/legal/cookies', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/legal/licenses', changeFrequency: 'yearly', priority: 0.5 },
  ]

  const lastModified = new Date()
  const localizedEntries = staticRoutes.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${baseUrl}/${locale}${route.path === '/' ? '' : route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  )
  return localizedEntries
}
