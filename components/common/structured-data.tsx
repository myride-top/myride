'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  data: Record<string, string | number | boolean | object | null>
}

export default function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Remove any existing structured data
    const existingScripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    )
    existingScripts.forEach(script => script.remove())

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      script.remove()
    }
  }, [data])

  return null
}

// Predefined structured data schemas
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MyRide',
  description:
    'The ultimate platform for car enthusiasts to showcase their vehicles',
  url: 'https://myride.top',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://myride.top/browse?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MyRide',
  description:
    'The ultimate platform for car enthusiasts to showcase their vehicles',
  url: 'https://myride.top',
  logo: 'https://myride.top/og-image-default.svg',
  sameAs: [
    'https://twitter.com/myride',
    'https://facebook.com/myride',
    'https://instagram.com/myride',
  ],
}

export const carShowcaseSchema = (carData: {
  name: string
  description: string
  make: string
  model: string
  year?: number
  main_photo_url?: string
  photos?: { url: string }[]
  profile?: {
    full_name?: string
    username?: string
  }
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: carData.name,
  description: carData.description,
  brand: {
    '@type': 'Brand',
    name: carData.make,
  },
  model: carData.model,
  vehicleModelDate: carData.year?.toString(),
  category: 'Automotive',
  image: carData.main_photo_url || carData.photos?.[0]?.url,
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Person',
      name: carData.profile?.full_name || carData.profile?.username,
    },
  },
})

export const breadcrumbSchema = (
  breadcrumbs: Array<{ name: string; url: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: breadcrumb.name,
    item: breadcrumb.url,
  })),
})
