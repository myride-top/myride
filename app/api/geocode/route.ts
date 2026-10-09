import { NextRequest } from 'next/server'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'
import { reverseGeocode } from '@/lib/utils/geocode'

export async function GET(request: NextRequest) {
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

    const result = await reverseGeocode(latitude, longitude)

    if (!result) {
      return createSecureResponse({ error: 'Failed to fetch address' }, 500)
    }

    return createSecureResponse({
      address: result.address,
      fullAddress: result.fullAddress,
      details: {
        city: result.city,
        country: result.country,
        road: result.street,
      },
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
