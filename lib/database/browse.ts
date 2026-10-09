import { createClient } from '@/lib/supabase/server'
import type { Car, Profile } from '@/lib/types/database'

export type BrowseSortOption =
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

export interface BrowseCarsFilters {
  search?: string
  make?: string
  model?: string
  yearFrom?: string
  yearTo?: string
  drivetrain?: string
  transmission?: string
  fuelType?: string
  minHorsepower?: string
  maxHorsepower?: string
  engineCylinders?: string
  minDisplacement?: string
  maxDisplacement?: string
  minTorque?: string
  maxTorque?: string
  minZeroToSixty?: string
  maxZeroToSixty?: string
  minTopSpeed?: string
  maxTopSpeed?: string
  minWeight?: string
  maxWeight?: string
  engineType?: string
}

export interface BrowseCarsQuery {
  page?: number
  pageSize?: number
  sortBy?: BrowseSortOption
  filters?: BrowseCarsFilters
}

export type BrowseProfile = Pick<
  Profile,
  'id' | 'username' | 'full_name' | 'avatar_url' | 'is_premium' | 'nationality'
>

export type BrowseCar = Car & {
  profiles?: BrowseProfile | null
}

export interface BrowseCarsResult {
  cars: BrowseCar[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 24
const MAX_PAGE_SIZE = 60

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

const parseInteger = (value: string | undefined): number | null => {
  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const parseFloatValue = (value: string | undefined): number | null => {
  if (!value) {
    return null
  }

  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

const clampPage = (value: number | undefined): number => {
  if (!value || value < 1) {
    return DEFAULT_PAGE
  }

  return value
}

const clampPageSize = (value: number | undefined): number => {
  if (!value || value < 1) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.min(value, MAX_PAGE_SIZE)
}

const sanitizeLikePattern = (value: string): string =>
  value.replace(/[%_]/g, '').trim()

export async function getBrowseCars(
  query: BrowseCarsQuery = {}
): Promise<BrowseCarsResult> {
  const supabase = await createClient()
  const page = clampPage(query.page)
  const pageSize = clampPageSize(query.pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1
  const sortBy: BrowseSortOption =
    query.sortBy && ALLOWED_SORTS.has(query.sortBy) ? query.sortBy : 'newest'
  const filters = query.filters ?? {}

  let dbQuery = supabase.from('cars').select(CAR_SELECT_FIELDS, { count: 'exact' })

  if (filters.search) {
    const normalizedSearch = sanitizeLikePattern(filters.search)
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

      dbQuery = dbQuery.or(searchConditions.join(','))
    }
  }

  if (filters.make && filters.make !== 'all') {
    dbQuery = dbQuery.eq('make', filters.make)
  }

  if (filters.model && filters.model !== 'all') {
    dbQuery = dbQuery.eq('model', filters.model)
  }

  if (filters.drivetrain && filters.drivetrain !== 'all') {
    dbQuery = dbQuery.eq('drivetrain', filters.drivetrain)
  }

  if (filters.transmission && filters.transmission !== 'all') {
    const normalizedTransmission = sanitizeLikePattern(filters.transmission)
    if (normalizedTransmission.length > 0) {
      dbQuery = dbQuery.ilike('transmission', `%${normalizedTransmission}%`)
    }
  }

  if (filters.fuelType && filters.fuelType !== 'all') {
    const normalizedFuelType = sanitizeLikePattern(filters.fuelType)
    if (normalizedFuelType.length > 0) {
      dbQuery = dbQuery.ilike('fuel_type', `%${normalizedFuelType}%`)
    }
  }

  if (filters.engineType && filters.engineType !== 'all') {
    const normalizedEngineType = sanitizeLikePattern(filters.engineType)
    if (normalizedEngineType.length > 0) {
      dbQuery = dbQuery.ilike('engine_type', `%${normalizedEngineType}%`)
    }
  }

  const engineCylinders = parseInteger(filters.engineCylinders)
  if (engineCylinders !== null) {
    dbQuery = dbQuery.eq('engine_cylinders', engineCylinders)
  }

  const yearFrom = parseInteger(filters.yearFrom)
  if (yearFrom !== null) {
    dbQuery = dbQuery.gte('year', yearFrom)
  }

  const yearTo = parseInteger(filters.yearTo)
  if (yearTo !== null) {
    dbQuery = dbQuery.lte('year', yearTo)
  }

  const minHorsepower = parseInteger(filters.minHorsepower)
  if (minHorsepower !== null) {
    dbQuery = dbQuery.gte('horsepower', minHorsepower)
  }

  const maxHorsepower = parseInteger(filters.maxHorsepower)
  if (maxHorsepower !== null) {
    dbQuery = dbQuery.lte('horsepower', maxHorsepower)
  }

  const minDisplacement = parseFloatValue(filters.minDisplacement)
  if (minDisplacement !== null) {
    dbQuery = dbQuery.gte('engine_displacement', minDisplacement)
  }

  const maxDisplacement = parseFloatValue(filters.maxDisplacement)
  if (maxDisplacement !== null) {
    dbQuery = dbQuery.lte('engine_displacement', maxDisplacement)
  }

  const minTorque = parseFloatValue(filters.minTorque)
  if (minTorque !== null) {
    dbQuery = dbQuery.gte('torque', minTorque)
  }

  const maxTorque = parseFloatValue(filters.maxTorque)
  if (maxTorque !== null) {
    dbQuery = dbQuery.lte('torque', maxTorque)
  }

  const minZeroToSixty = parseFloatValue(filters.minZeroToSixty)
  if (minZeroToSixty !== null) {
    dbQuery = dbQuery.gte('zero_to_sixty', minZeroToSixty)
  }

  const maxZeroToSixty = parseFloatValue(filters.maxZeroToSixty)
  if (maxZeroToSixty !== null) {
    dbQuery = dbQuery.lte('zero_to_sixty', maxZeroToSixty)
  }

  const minTopSpeed = parseFloatValue(filters.minTopSpeed)
  if (minTopSpeed !== null) {
    dbQuery = dbQuery.gte('top_speed', minTopSpeed)
  }

  const maxTopSpeed = parseFloatValue(filters.maxTopSpeed)
  if (maxTopSpeed !== null) {
    dbQuery = dbQuery.lte('top_speed', maxTopSpeed)
  }

  const minWeight = parseFloatValue(filters.minWeight)
  if (minWeight !== null) {
    dbQuery = dbQuery.gte('weight', minWeight)
  }

  const maxWeight = parseFloatValue(filters.maxWeight)
  if (maxWeight !== null) {
    dbQuery = dbQuery.lte('weight', maxWeight)
  }

  switch (sortBy) {
    case 'oldest':
      dbQuery = dbQuery.order('created_at', { ascending: true })
      break
    case 'most_liked':
      dbQuery = dbQuery.order('like_count', { ascending: false })
      break
    case 'most_viewed':
      dbQuery = dbQuery.order('view_count', { ascending: false })
      break
    case 'most_shared':
      dbQuery = dbQuery.order('share_count', { ascending: false })
      break
    case 'most_commented':
      dbQuery = dbQuery.order('comment_count', { ascending: false })
      break
    case 'year_asc':
      dbQuery = dbQuery.order('year', { ascending: true })
      break
    case 'year_desc':
      dbQuery = dbQuery.order('year', { ascending: false })
      break
    case 'horsepower_asc':
      dbQuery = dbQuery.order('horsepower', { ascending: true })
      break
    case 'horsepower_desc':
      dbQuery = dbQuery.order('horsepower', { ascending: false })
      break
    case 'newest':
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false })
      break
  }

  const { data: cars, error, count } = await dbQuery.range(start, end)

  if (error) {
    throw new Error(error.message || 'Failed to fetch cars')
  }

  const total = count ?? 0
  const currentCars = (cars ?? []) as Array<Record<string, unknown>>
  const profileById = new Map<string, BrowseProfile>()

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
        profileById.set(profile.id, profile as BrowseProfile)
      })
    }
  }

  const carsWithProfiles: BrowseCar[] = currentCars.map(car => {
    const userId = typeof car.user_id === 'string' ? car.user_id : null
    return {
      ...(car as unknown as Car),
      profiles: userId ? profileById.get(userId) ?? null : null,
    }
  })

  return {
    cars: carsWithProfiles,
    total,
    page,
    pageSize,
    hasMore: start + currentCars.length < total,
  }
}
