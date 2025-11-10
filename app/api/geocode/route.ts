import { NextRequest } from 'next/server'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = generalRateLimit.isAllowed(request)
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return createSecureResponse(
        { error: 'Missing latitude or longitude' },
        400
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return createSecureResponse({ error: 'Invalid coordinates' }, 400)
    }

    // Use OpenStreetMap Nominatim API for reverse geocoding
    // Free, no API key required, but should be used responsibly
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MyRide App (https://myride.top)',
        },
      }
    )

    if (!response.ok) {
      return createSecureResponse(
        { error: 'Failed to fetch address' },
        500
      )
    }

    const data = await response.json()

    // Format address from Nominatim response
    const address = data.address || {}
    let formattedAddress = ''

    // Try to get a readable address
    if (address.road && address.house_number) {
      formattedAddress = `${address.road} ${address.house_number}`
      if (address.city || address.town || address.village) {
        formattedAddress += `, ${address.city || address.town || address.village}`
      }
    } else if (address.road) {
      formattedAddress = address.road
      if (address.city || address.town || address.village) {
        formattedAddress += `, ${address.city || address.town || address.village}`
      }
    } else if (address.city || address.town || address.village) {
      formattedAddress = address.city || address.town || address.village
      if (address.country) {
        formattedAddress += `, ${address.country}`
      }
    } else if (address.display_name) {
      // Fallback to full display name
      formattedAddress = address.display_name.split(',')[0]
    } else {
      // Last resort - return coordinates
      formattedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    }

    return createSecureResponse({
      address: formattedAddress,
      fullAddress: data.display_name || formattedAddress,
      details: address,
    })
  } catch (error) {
    console.error('Error geocoding:', error)
    return createSecureResponse(
      {
        error: 'Failed to geocode address',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

