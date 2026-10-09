import { SITE_URL } from '@/lib/constants/site'

export type GeocodeResult = {
  address: string
  fullAddress: string
  city?: string
  country?: string
  street?: string
}

type NominatimAddress = {
  road?: string
  house_number?: string
  city?: string
  town?: string
  village?: string
  country?: string
  display_name?: string
}

type NominatimResponse = {
  display_name?: string
  address?: NominatimAddress
}

function formatAddress(
  latitude: number,
  longitude: number,
  address: NominatimAddress,
  displayName?: string
): string {
  if (address.road && address.house_number) {
    let formatted = `${address.road} ${address.house_number}`
    if (address.city || address.town || address.village) {
      formatted += `, ${address.city || address.town || address.village}`
    }
    return formatted
  }

  if (address.road) {
    let formatted = address.road
    if (address.city || address.town || address.village) {
      formatted += `, ${address.city || address.town || address.village}`
    }
    return formatted
  }

  if (address.city || address.town || address.village) {
    let formatted = address.city || address.town || address.village || ''
    if (address.country) {
      formatted += `, ${address.country}`
    }
    return formatted
  }

  if (displayName) {
    return displayName.split(',')[0]
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}

/** Reverse-geocode coordinates via Nominatim (cached 24h). */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': `MyRide App (${SITE_URL})`,
        },
        next: { revalidate: 86400 },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as NominatimResponse
    const address = data.address || {}
    const formatted = formatAddress(
      latitude,
      longitude,
      address,
      data.display_name
    )

    return {
      address: formatted,
      fullAddress: data.display_name || formatted,
      city: address.city || address.town || address.village,
      country: address.country,
      street:
        address.road && address.house_number
          ? `${address.road} ${address.house_number}`
          : address.road,
    }
  } catch {
    return null
  }
}

export function googleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}

export function staticMapImageUrl(
  latitude: number,
  longitude: number,
  width = 600,
  height = 300
): string {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=14&size=${width}x${height}&maptype=mapnik&markers=${latitude},${longitude},lightblue1`
}
