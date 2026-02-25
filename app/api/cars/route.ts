import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

type SortOption =
  | 'newest'
  | 'oldest'
  | 'most_liked'
  | 'most_viewed'
  | 'most_shared'
  | 'most_commented'
  | 'year_asc'
  | 'year_desc'
  | 'horsepower_asc'
  | 'horsepower_desc'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 24
const MAX_PAGE_SIZE = 60

const ALLOWED_SORTS = new Set<SortOption>([
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

const CAR_SELECT_FIELDS = `
  id,
  user_id,
  name,
  url_slug,
  make,
  model,
  year,
  description,
  horsepower,
  engine_displacement,
  engine_cylinders,
  torque,
  zero_to_sixty,
  top_speed,
  weight,
  drivetrain,
  transmission,
  fuel_type,
  engine_type,
  photos,
  main_photo_url,
  like_count,
  view_count,
  share_count,
  comment_count,
  created_at,
  updated_at
`

const PROFILE_SELECT_FIELDS = `
  id,
  username,
  full_name,
  avatar_url,
  is_premium,
  nationality
`

const parseInteger = (value: string | null): number | null => {
  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const parseFloatValue = (value: string | null): number | null => {
  if (!value) {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

const clampPage = (value: number | null): number => {
  if (!value || value < 1) {
    return DEFAULT_PAGE
  }

  return value
}

const clampPageSize = (value: number | null): number => {
  if (!value || value < 1) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.min(value, MAX_PAGE_SIZE)
}

const sanitizeLikePattern = (value: string): string =>
  value.replace(/[%_]/g, '').trim()

export async function GET(request: NextRequest) {
  const rateLimitResult = generalRateLimit.isAllowed(request)
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  }

  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = clampPage(parseInteger(searchParams.get('page')))
    const pageSize = clampPageSize(parseInteger(searchParams.get('pageSize')))
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const requestedSort = searchParams.get('sortBy')
    const sortBy: SortOption =
      requestedSort && ALLOWED_SORTS.has(requestedSort as SortOption)
        ? (requestedSort as SortOption)
        : 'newest'

    let query = supabase
      .from('cars')
      .select(CAR_SELECT_FIELDS, { count: 'exact' })

    const search = searchParams.get('search')
    if (search) {
      const normalizedSearch = sanitizeLikePattern(search)
      if (normalizedSearch.length > 0) {
        const isYearSearch = /^\d{4}$/.test(normalizedSearch)
        const searchConditions = [
          `name.ilike.%${normalizedSearch}%`,
          `make.ilike.%${normalizedSearch}%`,
          `model.ilike.%${normalizedSearch}%`,
        ]

        if (isYearSearch) {
          searchConditions.push(`year.eq.${normalizedSearch}`)
        }

        query = query.or(searchConditions.join(','))
      }
    }

    const make = searchParams.get('make')
    if (make) {
      query = query.eq('make', make)
    }

    const model = searchParams.get('model')
    if (model) {
      query = query.eq('model', model)
    }

    const drivetrain = searchParams.get('drivetrain')
    if (drivetrain) {
      query = query.eq('drivetrain', drivetrain)
    }

    const transmission = searchParams.get('transmission')
    if (transmission) {
      const normalizedTransmission = sanitizeLikePattern(transmission)
      if (normalizedTransmission.length > 0) {
        query = query.ilike('transmission', `%${normalizedTransmission}%`)
      }
    }

    const fuelType = searchParams.get('fuelType')
    if (fuelType) {
      const normalizedFuelType = sanitizeLikePattern(fuelType)
      if (normalizedFuelType.length > 0) {
        query = query.ilike('fuel_type', `%${normalizedFuelType}%`)
      }
    }

    const engineType = searchParams.get('engineType')
    if (engineType) {
      const normalizedEngineType = sanitizeLikePattern(engineType)
      if (normalizedEngineType.length > 0) {
        query = query.ilike('engine_type', `%${normalizedEngineType}%`)
      }
    }

    const engineCylinders = parseInteger(searchParams.get('engineCylinders'))
    if (engineCylinders !== null) {
      query = query.eq('engine_cylinders', engineCylinders)
    }

    const yearFrom = parseInteger(searchParams.get('yearFrom'))
    if (yearFrom !== null) {
      query = query.gte('year', yearFrom)
    }

    const yearTo = parseInteger(searchParams.get('yearTo'))
    if (yearTo !== null) {
      query = query.lte('year', yearTo)
    }

    const minHorsepower = parseInteger(searchParams.get('minHorsepower'))
    if (minHorsepower !== null) {
      query = query.gte('horsepower', minHorsepower)
    }

    const maxHorsepower = parseInteger(searchParams.get('maxHorsepower'))
    if (maxHorsepower !== null) {
      query = query.lte('horsepower', maxHorsepower)
    }

    const minDisplacement = parseFloatValue(searchParams.get('minDisplacement'))
    if (minDisplacement !== null) {
      query = query.gte('engine_displacement', minDisplacement)
    }

    const maxDisplacement = parseFloatValue(searchParams.get('maxDisplacement'))
    if (maxDisplacement !== null) {
      query = query.lte('engine_displacement', maxDisplacement)
    }

    const minTorque = parseFloatValue(searchParams.get('minTorque'))
    if (minTorque !== null) {
      query = query.gte('torque', minTorque)
    }

    const maxTorque = parseFloatValue(searchParams.get('maxTorque'))
    if (maxTorque !== null) {
      query = query.lte('torque', maxTorque)
    }

    const minZeroToSixty = parseFloatValue(searchParams.get('minZeroToSixty'))
    if (minZeroToSixty !== null) {
      query = query.gte('zero_to_sixty', minZeroToSixty)
    }

    const maxZeroToSixty = parseFloatValue(searchParams.get('maxZeroToSixty'))
    if (maxZeroToSixty !== null) {
      query = query.lte('zero_to_sixty', maxZeroToSixty)
    }

    const minTopSpeed = parseFloatValue(searchParams.get('minTopSpeed'))
    if (minTopSpeed !== null) {
      query = query.gte('top_speed', minTopSpeed)
    }

    const maxTopSpeed = parseFloatValue(searchParams.get('maxTopSpeed'))
    if (maxTopSpeed !== null) {
      query = query.lte('top_speed', maxTopSpeed)
    }

    const minWeight = parseFloatValue(searchParams.get('minWeight'))
    if (minWeight !== null) {
      query = query.gte('weight', minWeight)
    }

    const maxWeight = parseFloatValue(searchParams.get('maxWeight'))
    if (maxWeight !== null) {
      query = query.lte('weight', maxWeight)
    }

    switch (sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'most_liked':
        query = query.order('like_count', { ascending: false })
        break
      case 'most_viewed':
        query = query.order('view_count', { ascending: false })
        break
      case 'most_shared':
        query = query.order('share_count', { ascending: false })
        break
      case 'most_commented':
        query = query.order('comment_count', { ascending: false })
        break
      case 'year_asc':
        query = query.order('year', { ascending: true })
        break
      case 'year_desc':
        query = query.order('year', { ascending: false })
        break
      case 'horsepower_asc':
        query = query.order('horsepower', { ascending: true })
        break
      case 'horsepower_desc':
        query = query.order('horsepower', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data: cars, error, count } = await query.range(start, end)

    if (error) {
      return createSecureResponse(
        {
          error: 'Failed to fetch cars',
          details:
            process.env.NODE_ENV !== 'production'
              ? { code: error.code, message: error.message }
              : undefined,
        },
        500
      )
    }

    const total = count ?? 0
    const currentCars = (cars ?? []) as Array<Record<string, unknown>>
    const profileById = new Map<string, Record<string, unknown>>()

    const userIds = Array.from(
      new Set(
        currentCars
          .map(car => car.user_id)
          .filter((userId): userId is string => typeof userId === 'string')
      )
    )

    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT_FIELDS)
        .in('id', userIds)

      if (!profileError && profiles) {
        profiles.forEach(profile => {
          profileById.set(profile.id, profile as Record<string, unknown>)
        })
      }
    }

    const carsWithProfiles = currentCars.map(car => {
      const userId = typeof car.user_id === 'string' ? car.user_id : null
      return {
        ...car,
        profiles: userId ? profileById.get(userId) ?? null : null,
      }
    })

    const response = createSecureResponse({
      cars: carsWithProfiles,
      total,
      page,
      pageSize,
      hasMore: start + currentCars.length < total,
    })

    response.headers.set(
      'Cache-Control',
      'private, max-age=60, stale-while-revalidate=120'
    )

    return response
  } catch {
    return createSecureResponse({ error: 'Failed to fetch cars' }, 500)
  }
}
