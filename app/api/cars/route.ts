import { NextRequest } from 'next/server'
import {
  getBrowseCars,
  type BrowseCarsFilters,
  type BrowseSortOption,
} from '@/lib/database/browse'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

const ALLOWED_SORTS = new Set<BrowseSortOption>([
  'newest',
  'oldest',
  'most_liked',
  'most_viewed',
  'most_shared',
  'most_commented',
  'year_asc',
  'year_desc',
  'horsepower_asc',
  'horsepower_desc',
])

const FILTER_KEYS: Array<keyof BrowseCarsFilters> = [
  'search',
  'make',
  'model',
  'yearFrom',
  'yearTo',
  'drivetrain',
  'transmission',
  'fuelType',
  'minHorsepower',
  'maxHorsepower',
  'engineCylinders',
  'minDisplacement',
  'maxDisplacement',
  'minTorque',
  'maxTorque',
  'minZeroToSixty',
  'maxZeroToSixty',
  'minTopSpeed',
  'maxTopSpeed',
  'minWeight',
  'maxWeight',
  'engineType',
]

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
    const page = Number.parseInt(searchParams.get('page') || '1', 10)
    const pageSize = Number.parseInt(searchParams.get('pageSize') || '24', 10)
    const requestedSort = searchParams.get('sortBy')
    const sortBy: BrowseSortOption =
      requestedSort && ALLOWED_SORTS.has(requestedSort as BrowseSortOption)
        ? (requestedSort as BrowseSortOption)
        : 'newest'

    const filters: BrowseCarsFilters = {}
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key)
      if (value) {
        filters[key] = value
      }
    }

    const result = await getBrowseCars({
      page: Number.isNaN(page) ? 1 : page,
      pageSize: Number.isNaN(pageSize) ? 24 : pageSize,
      sortBy,
      filters,
    })

    const response = createSecureResponse(result)
    response.headers.set(
      'Cache-Control',
      'private, max-age=60, stale-while-revalidate=120'
    )
    return response
  } catch {
    return createSecureResponse({ error: 'Failed to fetch cars' }, 500)
  }
}
