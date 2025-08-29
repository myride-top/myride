import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/profile',
        '/create',
        '/api/',
        '/support/thank-you',
        '/*/edit',
      ],
    },
    sitemap: 'https://myride.cz/sitemap.xml',
  }
}
