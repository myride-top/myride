import { SITE_URL } from '@/lib/constants/site'

interface StructuredDataProps {
  data: Record<string, JsonValue>
  id?: string
}

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
interface JsonObject {
  [key: string]: JsonValue
}

export const StructuredData = ({ data, id }: StructuredDataProps) => {
  return (
    <script
      id={id}
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Predefined structured data schemas
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MyRide',
  description:
    'The ultimate platform for car enthusiasts to showcase their vehicles',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/en/browse?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MyRide',
  description:
    'The ultimate platform for car enthusiasts to showcase their vehicles',
  url: SITE_URL,
  logo: `${SITE_URL}/og-image-default.png`,
  sameAs: [
    'https://twitter.com/myride',
    'https://tiktok.com/@myride.top',
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

/** Schema.org Car for public car detail pages. */
export const carJsonLdSchema = (carData: {
  name: string
  description?: string | null
  make: string
  model: string
  year?: number | null
  image?: string | null
  url: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Car',
  name: carData.name,
  ...(carData.description ? { description: carData.description } : {}),
  brand: {
    '@type': 'Brand',
    name: carData.make,
  },
  model: carData.model,
  ...(carData.year != null
    ? { vehicleModelDate: String(carData.year) }
    : {}),
  ...(carData.image ? { image: carData.image } : {}),
  url: carData.url,
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

/** Schema.org Event for public event detail pages. */
export const eventJsonLdSchema = (eventData: {
  name: string
  description?: string | null
  startDate: string
  endDate?: string | null
  image?: string | null
  url: string
  locationName: string
  streetAddress?: string
  addressLocality?: string
  addressCountry?: string
  latitude: number
  longitude: number
  organizerName: string
  organizerUrl?: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: eventData.name,
  ...(eventData.description
    ? { description: eventData.description }
    : {}),
  startDate: eventData.startDate,
  ...(eventData.endDate ? { endDate: eventData.endDate } : {}),
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  ...(eventData.image ? { image: eventData.image } : {}),
  url: eventData.url,
  location: {
    '@type': 'Place',
    name: eventData.locationName,
    address: {
      '@type': 'PostalAddress',
      ...(eventData.streetAddress
        ? { streetAddress: eventData.streetAddress }
        : {}),
      ...(eventData.addressLocality
        ? { addressLocality: eventData.addressLocality }
        : {}),
      ...(eventData.addressCountry
        ? { addressCountry: eventData.addressCountry }
        : {}),
      name: eventData.locationName,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: eventData.latitude,
      longitude: eventData.longitude,
    },
  },
  organizer: {
    '@type': 'Person',
    name: eventData.organizerName,
    ...(eventData.organizerUrl ? { url: eventData.organizerUrl } : {}),
  },
})
