import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MyRide - Car Showcase Platform',
    short_name: 'MyRide',
    description: 'The ultimate platform for car enthusiasts to showcase their vehicles',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/og-image-default.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    categories: ['automotive', 'lifestyle', 'social'],
    lang: 'en',
    dir: 'ltr',
    orientation: 'portrait',
    scope: '/',
    prefer_related_applications: false,
  }
}
