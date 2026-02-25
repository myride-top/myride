'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { useUnitPreference } from '@/lib/context/unit-context'
import {
  getAllCarsClient,
  type BrowseCarsFilters,
  type BrowseSortOption,
} from '@/lib/database/cars-client'
import { Car, Profile } from '@/lib/types/database'
import { PageLayout } from '@/components/layout/page-layout'
import { PageHeader } from '@/components/layout/page-header'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { ErrorState } from '@/components/common/error-state'
import { EmptyState } from '@/components/common/empty-state'
import { CarCard } from '@/components/cars/car-card'
import { Grid } from '@/components/common/grid'
import { Button } from '@/components/ui/button-enhanced'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { CarIcon, Filter, X } from 'lucide-react'
import {
  normalizeTransmission,
  normalizeFuelType,
  normalizeEngineType,
} from '@/lib/utils/filter-normalization'
import { unitConversions, getUnitLabel } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/provider'

interface FilterState {
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

const PAGE_SIZE = 24
const SEARCH_DEBOUNCE_MS = 300

const DEFAULT_FILTERS: FilterState = {
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

const SORT_OPTIONS: SortOption[] = [
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

const getInitialSort = (value: string | null): SortOption => {
  if (value && SORT_OPTIONS.includes(value as SortOption)) {
    return value as SortOption
  }

  return 'newest'
}

const getInitialPage = (value: string | null): number => {
  if (!value) {
    return 1
  }

  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

const getInitialFilters = (searchParams: URLSearchParams): FilterState => ({
  ...DEFAULT_FILTERS,
  search: searchParams.get('search') || DEFAULT_FILTERS.search,
  make: searchParams.get('make') || DEFAULT_FILTERS.make,
  model: searchParams.get('model') || DEFAULT_FILTERS.model,
  yearFrom: searchParams.get('yearFrom') || DEFAULT_FILTERS.yearFrom,
  yearTo: searchParams.get('yearTo') || DEFAULT_FILTERS.yearTo,
  drivetrain: searchParams.get('drivetrain') || DEFAULT_FILTERS.drivetrain,
  transmission:
    searchParams.get('transmission') || DEFAULT_FILTERS.transmission,
  fuelType: searchParams.get('fuelType') || DEFAULT_FILTERS.fuelType,
  minHorsepower:
    searchParams.get('minHorsepower') || DEFAULT_FILTERS.minHorsepower,
  maxHorsepower:
    searchParams.get('maxHorsepower') || DEFAULT_FILTERS.maxHorsepower,
  engineCylinders:
    searchParams.get('engineCylinders') || DEFAULT_FILTERS.engineCylinders,
  minDisplacement:
    searchParams.get('minDisplacement') || DEFAULT_FILTERS.minDisplacement,
  maxDisplacement:
    searchParams.get('maxDisplacement') || DEFAULT_FILTERS.maxDisplacement,
  minTorque: searchParams.get('minTorque') || DEFAULT_FILTERS.minTorque,
  maxTorque: searchParams.get('maxTorque') || DEFAULT_FILTERS.maxTorque,
  minZeroToSixty:
    searchParams.get('minZeroToSixty') || DEFAULT_FILTERS.minZeroToSixty,
  maxZeroToSixty:
    searchParams.get('maxZeroToSixty') || DEFAULT_FILTERS.maxZeroToSixty,
  minTopSpeed: searchParams.get('minTopSpeed') || DEFAULT_FILTERS.minTopSpeed,
  maxTopSpeed: searchParams.get('maxTopSpeed') || DEFAULT_FILTERS.maxTopSpeed,
  minWeight: searchParams.get('minWeight') || DEFAULT_FILTERS.minWeight,
  maxWeight: searchParams.get('maxWeight') || DEFAULT_FILTERS.maxWeight,
  engineType: searchParams.get('engineType') || DEFAULT_FILTERS.engineType,
})

const toBrowseFilters = (
  filters: FilterState,
  unitPreference: 'metric' | 'imperial',
  debouncedSearch: string
): BrowseCarsFilters => {
  const minTorque =
    filters.minTorque && unitPreference === 'metric'
      ? String(
          unitConversions.torque.metricToImperial(
            Number.parseFloat(filters.minTorque)
          )
        )
      : filters.minTorque

  const maxTorque =
    filters.maxTorque && unitPreference === 'metric'
      ? String(
          unitConversions.torque.metricToImperial(
            Number.parseFloat(filters.maxTorque)
          )
        )
      : filters.maxTorque

  const minTopSpeed =
    filters.minTopSpeed && unitPreference === 'metric'
      ? String(
          unitConversions.speed.metricToImperial(
            Number.parseFloat(filters.minTopSpeed)
          )
        )
      : filters.minTopSpeed

  const maxTopSpeed =
    filters.maxTopSpeed && unitPreference === 'metric'
      ? String(
          unitConversions.speed.metricToImperial(
            Number.parseFloat(filters.maxTopSpeed)
          )
        )
      : filters.maxTopSpeed

  const minWeight =
    filters.minWeight && unitPreference === 'metric'
      ? String(
          unitConversions.weight.metricToImperial(
            Number.parseFloat(filters.minWeight)
          )
        )
      : filters.minWeight

  const maxWeight =
    filters.maxWeight && unitPreference === 'metric'
      ? String(
          unitConversions.weight.metricToImperial(
            Number.parseFloat(filters.maxWeight)
          )
        )
      : filters.maxWeight

  return {
    ...filters,
    search: debouncedSearch,
    minTorque,
    maxTorque,
    minTopSpeed,
    maxTopSpeed,
    minWeight,
    maxWeight,
  }
}

export default function BrowsePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const { user } = useAuth()
  const { unitPreference } = useUnitPreference()
  const [cars, setCars] = useState<Car[]>([])
  const [totalCars, setTotalCars] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>(() =>
    getInitialSort(searchParams.get('sortBy'))
  )
  const [page, setPage] = useState<number>(() =>
    getInitialPage(searchParams.get('page'))
  )
  const [filters, setFilters] = useState<FilterState>(() =>
    getInitialFilters(new URLSearchParams(searchParams.toString()))
  )
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [filters.search])

  const serverFilters = useMemo(
    () => toBrowseFilters(filters, unitPreference, debouncedSearch),
    [filters, unitPreference, debouncedSearch]
  )

  // Get unique values for filter options
  const uniqueMakes = useMemo(() => {
    const makes = cars.map(car => car.make).filter(Boolean)
    return Array.from(new Set(makes)).sort()
  }, [cars])

  const uniqueModels = useMemo(() => {
    if (!filters.make || filters.make === 'all') return []
    const models = cars
      .filter(car => car.make === filters.make)
      .map(car => car.model)
      .filter(Boolean)
    return Array.from(new Set(models)).sort()
  }, [cars, filters.make])

  const uniqueDrivetrains = useMemo(() => {
    const drivetrains = cars
      .map(car => car.drivetrain)
      .filter((drivetrain): drivetrain is string => Boolean(drivetrain))
    return Array.from(new Set(drivetrains)).sort()
  }, [cars])

  // Normalized transmissions - unify duplicates
  const uniqueTransmissions = useMemo(() => {
    const transmissions = cars
      .map(car => car.transmission)
      .filter((transmission): transmission is string => Boolean(transmission))
      .map(normalizeTransmission)
      .filter((t): t is string => Boolean(t))
    return Array.from(new Set(transmissions)).sort()
  }, [cars])

  // Normalized fuel types - unify duplicates
  const uniqueFuelTypes = useMemo(() => {
    const fuelTypes = cars
      .map(car => car.fuel_type)
      .filter((fuelType): fuelType is string => Boolean(fuelType))
      .map(normalizeFuelType)
      .filter((ft): ft is string => Boolean(ft))
    return Array.from(new Set(fuelTypes)).sort()
  }, [cars])

  // Additional filter options
  const uniqueEngineCylinders = useMemo(() => {
    const cylinders = cars
      .map(car => car.engine_cylinders)
      .filter((cyl): cyl is number => Boolean(cyl))
    return Array.from(new Set(cylinders))
      .sort((a, b) => a - b)
      .map(String)
  }, [cars])

  // Normalized engine types - unify duplicates
  const uniqueEngineTypes = useMemo(() => {
    const types = cars
      .map(car => car.engine_type)
      .filter((type): type is string => Boolean(type))
      .map(normalizeEngineType)
      .filter((type): type is string => Boolean(type))
    return Array.from(new Set(types)).sort()
  }, [cars])

  const hasNextPage = page * PAGE_SIZE < totalCars

  const loadCars = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getAllCarsClient({
        page,
        pageSize: PAGE_SIZE,
        sortBy: sortBy as BrowseSortOption,
        filters: serverFilters,
      })

      if (!response) {
        throw new Error('Failed to load browse cars')
      }

      setCars(response.cars || [])
      setTotalCars(response.total || 0)
    } catch {
      setError(t('browse.error.loadFailed', 'Failed to load cars. Please try again later.'))
      setCars([])
      setTotalCars(0)
    } finally {
      setLoading(false)
    }
  }, [page, serverFilters, sortBy, t])

  const handleLikeChange = (carId: string, newLikeCount: number) => {
    setCars(prevCars =>
      prevCars.map(car =>
        car.id === carId ? { ...car, like_count: newLikeCount } : car
      )
    )
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setPage(1)
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }

      // Reset model when make changes
      if (key === 'make') {
        newFilters.model = 'all'
      }

      return newFilters
    })
  }

  const clearFilters = () => {
    setPage(1)
    setFilters(DEFAULT_FILTERS)
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length
  }

  useEffect(() => {
    void loadCars()
  }, [loadCars])

  useEffect(() => {
    const nextParams = new URLSearchParams()

    if (page > 1) {
      nextParams.set('page', String(page))
    }

    if (sortBy !== 'newest') {
      nextParams.set('sortBy', sortBy)
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (!value || value === 'all') {
        return
      }

      nextParams.set(key, value)
    })

    const nextQuery = nextParams.toString()
    const currentQuery = searchParams.toString()
    if (nextQuery === currentQuery) {
      return
    }

    const destination = nextQuery ? `${pathname}?${nextQuery}` : pathname
    router.replace(destination, { scroll: false })
  }, [filters, page, pathname, router, searchParams, sortBy])

  if (loading) {
    return (
      <PageLayout showCreateButton={true}>
        <div className='flex items-center justify-center min-h-[calc(100vh-6rem)]'>
          <LoadingSpinner
            message={t('browse.loading', 'Loading cars...')}
          />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout showCreateButton={true}>
      <PageHeader
        title={t('browse.title', 'Browse Cars')}
        description={t(
          'browse.description',
          'Discover amazing cars from the community'
        )}
      />

      {/* Filters and Sorting */}
      <div className='mb-6 md:mb-8 space-y-4'>
        {/* Search and Sort Bar */}
        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between'>
          <div className='flex-1 w-full sm:max-w-md'>
            <Input
              placeholder={t('browse.search.placeholder', 'Search cars...')}
              value={filters.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange('search', e.target.value)
              }
              className='w-full'
              aria-label={t(
                'browse.search.ariaLabel',
                'Search cars by name, make, model, or year'
              )}
            />
          </div>

          <div className='flex gap-2 items-center flex-shrink-0'>
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => {
                setPage(1)
                setSortBy(value)
              }}
            >
              <SelectTrigger className='w-full sm:w-48 cursor-pointer min-h-[44px]'>
                <SelectValue
                  placeholder={t('browse.sort.placeholder', 'Sort by...')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest' className='cursor-pointer'>
                  {t('browse.sort.newest', 'Newest First')}
                </SelectItem>
                <SelectItem value='oldest' className='cursor-pointer'>
                  {t('browse.sort.oldest', 'Oldest First')}
                </SelectItem>
                <SelectItem value='most_liked' className='cursor-pointer'>
                  {t('browse.sort.mostLiked', 'Most Liked')}
                </SelectItem>
                <SelectItem value='most_viewed' className='cursor-pointer'>
                  {t('browse.sort.mostViewed', 'Most Viewed')}
                </SelectItem>
                <SelectItem value='most_shared' className='cursor-pointer'>
                  {t('browse.sort.mostShared', 'Most Shared')}
                </SelectItem>
                <SelectItem value='most_commented' className='cursor-pointer'>
                  {t('browse.sort.mostCommented', 'Most Commented')}
                </SelectItem>
                <SelectItem value='year_asc' className='cursor-pointer'>
                  {t('browse.sort.yearAsc', 'Year (Oldest)')}
                </SelectItem>
                <SelectItem value='year_desc' className='cursor-pointer'>
                  {t('browse.sort.yearDesc', 'Year (Newest)')}
                </SelectItem>
                <SelectItem value='horsepower_asc' className='cursor-pointer'>
                  {t('browse.sort.horsepowerAsc', 'Horsepower (Low)')}
                </SelectItem>
                <SelectItem value='horsepower_desc' className='cursor-pointer'>
                  {t('browse.sort.horsepowerDesc', 'Horsepower (High)')}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant='outline'
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2 cursor-pointer min-h-[44px]'
              aria-expanded={showFilters}
              aria-label={
                showFilters
                  ? t('browse.filters.hideAria', 'Hide filters')
                  : t('browse.filters.showAria', 'Show filters')
              }
            >
              <Filter className='w-4 h-4' aria-hidden='true' />
              <span className='hidden sm:inline'>
                {t('browse.filters.label', 'Filters')}
              </span>
              <span className='sm:hidden'>
                {t('browse.filters.labelSingle', 'Filter')}
              </span>
              {getActiveFiltersCount() > 0 && (
                <Badge variant='secondary' className='ml-1'>
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div
            className='bg-muted/50 rounded-lg p-4 sm:p-6 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200'
            role='region'
            aria-label={t('browse.filters.advancedAria', 'Advanced filters')}
          >
            <div className='flex items-center justify-between flex-wrap gap-2'>
              <h3 className='text-base sm:text-lg font-semibold'>
                {t('browse.filters.advancedTitle', 'Advanced Filters')}
              </h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={clearFilters}
                className='cursor-pointer min-h-[44px]'
                aria-label={t('browse.filters.clearAllAria', 'Clear all filters')}
              >
                <X className='w-4 h-4 mr-2' aria-hidden='true' />
                <span className='hidden sm:inline'>
                  {t('browse.filters.clearAll', 'Clear All')}
                </span>
                <span className='sm:hidden'>
                  {t('browse.filters.clear', 'Clear')}
                </span>
              </Button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {/* Make */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('browse.filters.make', 'Make')}
                </label>
                <Select
                  value={filters.make}
                  onValueChange={value => handleFilterChange('make', value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('browse.filters.allMakes', 'All Makes')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('browse.filters.allMakes', 'All Makes')}
                    </SelectItem>
                    {uniqueMakes.map(make => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('browse.filters.model', 'Model')}
                </label>
                <Select
                  value={filters.model}
                  onValueChange={value => handleFilterChange('model', value)}
                  disabled={!filters.make || filters.make === 'all'}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('browse.filters.allModels', 'All Models')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('browse.filters.allModels', 'All Models')}
                    </SelectItem>
                    {uniqueModels.map(model => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('browse.filters.yearRange', 'Year Range')}
                </label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    placeholder={t('browse.filters.from', 'From')}
                    value={filters.yearFrom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('yearFrom', e.target.value)
                    }
                    min='1900'
                    max='2030'
                  />
                  <Input
                    type='number'
                    placeholder={t('browse.filters.to', 'To')}
                    value={filters.yearTo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('yearTo', e.target.value)
                    }
                    min='1900'
                    max='2030'
                  />
                </div>
              </div>

              {/* Drivetrain */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('browse.filters.drivetrain', 'Drivetrain')}
                </label>
                <Select
                  value={filters.drivetrain}
                  onValueChange={value =>
                    handleFilterChange('drivetrain', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'browse.filters.allDrivetrains',
                        'All Drivetrains'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('browse.filters.allDrivetrains', 'All Drivetrains')}
                    </SelectItem>
                    {uniqueDrivetrains.map(drivetrain => (
                      <SelectItem key={drivetrain} value={drivetrain}>
                        {drivetrain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transmission */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('browse.filters.transmission', 'Transmission')}
                </label>
                <Select
                  value={filters.transmission}
                  onValueChange={value =>
                    handleFilterChange('transmission', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'browse.filters.allTransmissions',
                        'All Transmissions'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t(
                        'browse.filters.allTransmissions',
                        'All Transmissions'
                      )}
                    </SelectItem>
                    {uniqueTransmissions.map(transmission => (
                      <SelectItem key={transmission} value={transmission}>
                        {transmission}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('browse.filters.fuelType', 'Fuel Type')}
                </label>
                <Select
                  value={filters.fuelType}
                  onValueChange={value => handleFilterChange('fuelType', value)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'browse.filters.allFuelTypes',
                        'All Fuel Types'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('browse.filters.allFuelTypes', 'All Fuel Types')}
                    </SelectItem>
                    {uniqueFuelTypes.map(fuelType => (
                      <SelectItem key={fuelType} value={fuelType}>
                        {fuelType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Horsepower Range */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('browse.filters.horsepowerRange', 'Horsepower Range')}
                </label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    placeholder={t('browse.filters.minHp', 'Min HP')}
                    value={filters.minHorsepower}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('minHorsepower', e.target.value)
                    }
                    min='0'
                  />
                  <Input
                    type='number'
                    placeholder={t('browse.filters.maxHp', 'Max HP')}
                    value={filters.maxHorsepower}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('maxHorsepower', e.target.value)
                    }
                    min='0'
                  />
                </div>
              </div>

              {/* Engine Cylinders */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('browse.filters.engineCylinders', 'Engine Cylinders')}
                </label>
                <Select
                  value={filters.engineCylinders}
                  onValueChange={value =>
                    handleFilterChange('engineCylinders', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'browse.filters.allCylinders',
                        'All Cylinders'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('browse.filters.allCylinders', 'All Cylinders')}
                    </SelectItem>
                    {uniqueEngineCylinders.map(cylinders => (
                      <SelectItem key={cylinders} value={cylinders}>
                        {cylinders}{' '}
                        {t('browse.filters.cylinders', 'Cylinders')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Engine Displacement Range */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t(
                    'browse.filters.engineDisplacement',
                    'Engine Displacement (L)'
                  )}
                </label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    placeholder={t('browse.filters.minLiters', 'Min L')}
                    value={filters.minDisplacement}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('minDisplacement', e.target.value)
                    }
                    min='0'
                    step='0.1'
                  />
                  <Input
                    type='number'
                    placeholder={t('browse.filters.maxLiters', 'Max L')}
                    value={filters.maxDisplacement}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('maxDisplacement', e.target.value)
                    }
                    min='0'
                    step='0.1'
                  />
                </div>
              </div>

              {/* Torque Range */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Torque Range ({getUnitLabel('torque', unitPreference)})
                </label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    placeholder={t('browse.filters.min', 'Min')}
                    value={filters.minTorque}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('minTorque', e.target.value)
                    }
                    min='0'
                  />
                  <Input
                    type='number'
                    placeholder={t('browse.filters.max', 'Max')}
                    value={filters.maxTorque}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('maxTorque', e.target.value)
                    }
                    min='0'
                  />
                </div>
              </div>

              {/* 0-60 Range */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {unitPreference === 'metric'
                    ? t('browse.filters.zeroToHundred', '0-100 km/h')
                    : t('browse.filters.zeroToSixty', '0-60 mph')}{' '}
                  {t('browse.filters.seconds', '(seconds)')}
                </label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    placeholder={t('browse.filters.min', 'Min')}
                    value={filters.minZeroToSixty}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('minZeroToSixty', e.target.value)
                    }
                    min='0'
                    step='0.1'
                  />
                  <Input
                    type='number'
                    placeholder={t('browse.filters.max', 'Max')}
                    value={filters.maxZeroToSixty}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('maxZeroToSixty', e.target.value)
                    }
                    min='0'
                    step='0.1'
                  />
                </div>
              </div>

              {/* Top Speed Range */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Top Speed ({getUnitLabel('speed', unitPreference)})
                </label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    placeholder={t('browse.filters.min', 'Min')}
                    value={filters.minTopSpeed}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('minTopSpeed', e.target.value)
                    }
                    min='0'
                  />
                  <Input
                    type='number'
                    placeholder={t('browse.filters.max', 'Max')}
                    value={filters.maxTopSpeed}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('maxTopSpeed', e.target.value)
                    }
                    min='0'
                  />
                </div>
              </div>

              {/* Weight Range */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Weight ({getUnitLabel('weight', unitPreference)})
                </label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    placeholder={t('browse.filters.min', 'Min')}
                    value={filters.minWeight}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('minWeight', e.target.value)
                    }
                    min='0'
                  />
                  <Input
                    type='number'
                    placeholder={t('browse.filters.max', 'Max')}
                    value={filters.maxWeight}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('maxWeight', e.target.value)
                    }
                    min='0'
                  />
                </div>
              </div>

              {/* Engine Type */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  {t('browse.filters.engineType', 'Engine Type')}
                </label>
                <Select
                  value={filters.engineType}
                  onValueChange={value =>
                    handleFilterChange('engineType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'browse.filters.allEngineTypes',
                        'All Engine Types'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t(
                        'browse.filters.allEngineTypes',
                        'All Engine Types'
                      )}
                    </SelectItem>
                    {uniqueEngineTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className='flex items-center justify-between text-xs sm:text-sm text-muted-foreground'>
          <span aria-live='polite' aria-atomic='true'>
            {t('browse.results.showing', 'Showing')}{' '}
            <strong className='text-foreground'>{cars.length}</strong>{' '}
            {t('browse.results.of', 'of')}{' '}
            <strong className='text-foreground'>{totalCars}</strong>{' '}
            {t('browse.results.cars', 'cars')}
            {getActiveFiltersCount() > 0 && (
              <span className='hidden sm:inline'>
                {' '}
                {t('browse.results.filtered', '(filtered)')}
              </span>
            )}
          </span>
          <span className='hidden sm:inline'>
            {t('browse.results.page', 'Page')} {page}
          </span>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={loadCars} />
      ) : cars.length === 0 ? (
        <EmptyState
          icon={CarIcon}
          title={
            totalCars === 0
              ? t('browse.empty.none', 'No cars found')
              : t('browse.empty.filteredTitle', 'No cars match your filters')
          }
          description={
            totalCars === 0
              ? t(
                  'browse.empty.noneDescription',
                  'Be the first to add a car to the community!'
                )
              : t(
                  'browse.empty.filteredDescription',
                  'Try adjusting your search criteria'
                )
          }
        />
      ) : (
        <div className='space-y-6'>
          <Grid cols={3} mobileCols={1} gap='md' mobileGap='sm'>
            {cars.map(car => {
              // Extract profile from the joined data
              const carWithProfile = car as Car & { profiles?: Profile | null }
              const profileData = carWithProfile.profiles

              const profile: Profile = {
                id: car.user_id,
                username: profileData?.username || 'unknown',
                full_name: profileData?.full_name || null,
                avatar_url: profileData?.avatar_url || null,
                unit_preference: profileData?.unit_preference || 'metric',
                created_at: profileData?.created_at || '',
                updated_at: profileData?.updated_at || '',
                is_premium: profileData?.is_premium ?? false,
                premium_purchased_at: profileData?.premium_purchased_at || null,
                car_slots_purchased: profileData?.car_slots_purchased || 0,
                stripe_customer_id: profileData?.stripe_customer_id || null,
                stripe_subscription_id:
                  profileData?.stripe_subscription_id || null,
                total_supported_amount:
                  profileData?.total_supported_amount || 0,
                is_supporter: profileData?.is_supporter || false,
                bio: profileData?.bio || null,
                location: profileData?.location || null,
                nationality: profileData?.nationality || null,
                instagram_handle: profileData?.instagram_handle || null,
                youtube_channel: profileData?.youtube_channel || null,
                website_url: profileData?.website_url || null,
                garage_description: profileData?.garage_description || null,
              }
              const isOwner = user?.id === car.user_id

              return (
                <CarCard
                  key={car.id}
                  car={car}
                  profile={profile}
                  isOwner={isOwner}
                  showActions={true}
                  onLikeChange={handleLikeChange}
                />
              )
            })}
          </Grid>

          <div className='flex items-center justify-end gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(previous => Math.max(previous - 1, 1))}
              disabled={page <= 1 || loading}
              className='cursor-pointer'
            >
              {t('browse.pagination.previous', 'Previous')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(previous => previous + 1)}
              disabled={!hasNextPage || loading}
              className='cursor-pointer'
            >
              {t('browse.pagination.next', 'Next')}
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
