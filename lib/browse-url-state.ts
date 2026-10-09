import type { BrowseSortOption } from '@/lib/database/browse'

export interface BrowseFilterState {
  search: string
  make: string
  model: string
  yearFrom: string
  yearTo: string
  drivetrain: string
  transmission: string
  fuelType: string
  minHorsepower: string
  maxHorsepower: string
  engineCylinders: string
  minDisplacement: string
  maxDisplacement: string
  minTorque: string
  maxTorque: string
  minZeroToSixty: string
  maxZeroToSixty: string
  minTopSpeed: string
  maxTopSpeed: string
  minWeight: string
  maxWeight: string
  engineType: string
}

export const DEFAULT_BROWSE_FILTERS: BrowseFilterState = {
  search: '',
  make: 'all',
  model: 'all',
  yearFrom: '',
  yearTo: '',
  drivetrain: 'all',
  transmission: 'all',
  fuelType: 'all',
  minHorsepower: '',
  maxHorsepower: '',
  engineCylinders: 'all',
  minDisplacement: '',
  maxDisplacement: '',
  minTorque: '',
  maxTorque: '',
  minZeroToSixty: '',
  maxZeroToSixty: '',
  minTopSpeed: '',
  maxTopSpeed: '',
  minWeight: '',
  maxWeight: '',
  engineType: 'all',
}

export const BROWSE_SORT_OPTIONS: BrowseSortOption[] = [
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
]

export const getBrowseSortFromParam = (
  value: string | string[] | undefined
): BrowseSortOption => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw && BROWSE_SORT_OPTIONS.includes(raw as BrowseSortOption)) {
    return raw as BrowseSortOption
  }
  return 'newest'
}

export const getBrowsePageFromParam = (
  value: string | string[] | undefined
): number => {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) {
    return 1
  }

  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

const readParam = (
  params: Record<string, string | string[] | undefined>,
  key: string
): string => {
  const value = params[key]
  if (Array.isArray(value)) {
    return value[0] || ''
  }
  return value || ''
}

export const getBrowseFiltersFromParams = (
  params: Record<string, string | string[] | undefined>
): BrowseFilterState => ({
  ...DEFAULT_BROWSE_FILTERS,
  search: readParam(params, 'search') || DEFAULT_BROWSE_FILTERS.search,
  make: readParam(params, 'make') || DEFAULT_BROWSE_FILTERS.make,
  model: readParam(params, 'model') || DEFAULT_BROWSE_FILTERS.model,
  yearFrom: readParam(params, 'yearFrom') || DEFAULT_BROWSE_FILTERS.yearFrom,
  yearTo: readParam(params, 'yearTo') || DEFAULT_BROWSE_FILTERS.yearTo,
  drivetrain:
    readParam(params, 'drivetrain') || DEFAULT_BROWSE_FILTERS.drivetrain,
  transmission:
    readParam(params, 'transmission') || DEFAULT_BROWSE_FILTERS.transmission,
  fuelType: readParam(params, 'fuelType') || DEFAULT_BROWSE_FILTERS.fuelType,
  minHorsepower:
    readParam(params, 'minHorsepower') || DEFAULT_BROWSE_FILTERS.minHorsepower,
  maxHorsepower:
    readParam(params, 'maxHorsepower') || DEFAULT_BROWSE_FILTERS.maxHorsepower,
  engineCylinders:
    readParam(params, 'engineCylinders') ||
    DEFAULT_BROWSE_FILTERS.engineCylinders,
  minDisplacement:
    readParam(params, 'minDisplacement') ||
    DEFAULT_BROWSE_FILTERS.minDisplacement,
  maxDisplacement:
    readParam(params, 'maxDisplacement') ||
    DEFAULT_BROWSE_FILTERS.maxDisplacement,
  minTorque: readParam(params, 'minTorque') || DEFAULT_BROWSE_FILTERS.minTorque,
  maxTorque: readParam(params, 'maxTorque') || DEFAULT_BROWSE_FILTERS.maxTorque,
  minZeroToSixty:
    readParam(params, 'minZeroToSixty') ||
    DEFAULT_BROWSE_FILTERS.minZeroToSixty,
  maxZeroToSixty:
    readParam(params, 'maxZeroToSixty') ||
    DEFAULT_BROWSE_FILTERS.maxZeroToSixty,
  minTopSpeed:
    readParam(params, 'minTopSpeed') || DEFAULT_BROWSE_FILTERS.minTopSpeed,
  maxTopSpeed:
    readParam(params, 'maxTopSpeed') || DEFAULT_BROWSE_FILTERS.maxTopSpeed,
  minWeight: readParam(params, 'minWeight') || DEFAULT_BROWSE_FILTERS.minWeight,
  maxWeight: readParam(params, 'maxWeight') || DEFAULT_BROWSE_FILTERS.maxWeight,
  engineType:
    readParam(params, 'engineType') || DEFAULT_BROWSE_FILTERS.engineType,
})
