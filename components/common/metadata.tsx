import { Metadata } from 'next'

export interface BaseMetadataOptions {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
}

export function createBaseMetadata(options: BaseMetadataOptions = {}): Metadata {
  const {
    title = 'MyRide - Showcase Your Car to the World',
    description = 'The ultimate platform for car enthusiasts to showcase their vehicles. Share detailed specifications, photos, and connect with fellow car lovers. Fast, easy, and beautiful.',
    keywords = 'car showcase, vehicle gallery, car enthusiasts, automotive community, car photos, vehicle specifications, car modifications, automotive platform',
    image = 'https://myride.top/icon.jpg',
    url = 'https://myride.top',
  } = options

  return {
    title: {
      default: title,
      template: '%s | MyRide',
    },
    description,
    keywords,
    authors: [{ name: 'MyRide Team' }],
    creator: 'MyRide',
    publisher: 'MyRide',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(url),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName: 'MyRide',
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: 'MyRide',
        },
      ],
    },
    twitter: {
      card: 'summary',
      site: '@myride',
      creator: '@myride',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
    category: 'automotive',
    classification: 'car showcase platform',
  }
}

export function createPageMetadata(
  pageTitle: string,
  pageDescription?: string,
  pageKeywords?: string
): Metadata {
  return createBaseMetadata({
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
  })
}
