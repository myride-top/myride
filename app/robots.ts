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
        
        '/*/edit',
      ],
    },
    sitemap: 'https://myride.top/sitemap.xml',
  }
}
