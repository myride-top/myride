'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { getAllCarsClient } from '@/lib/database/cars-client'
import { Car, Profile } from '@/lib/types/database'
import PageLayout from '@/components/layout/page-layout'
import PageHeader from '@/components/layout/page-header'
import LoadingState from '@/components/common/loading-state'
import ErrorState from '@/components/common/error-state'
import EmptyState from '@/components/common/empty-state'
import CarCard from '@/components/cars/car-card'
import Grid from '@/components/common/grid'
import Button from '@/components/common/button'
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

export default function BrowsePage() {
  const { user } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filters, setFilters] = useState<FilterState>({
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
  })

  // Get unique values for filter options
  const uniqueMakes = useMemo(() => {
    const makes = cars.map(car => car.make).filter(Boolean)
    return Array.from(new Set(makes)).sort()
  }, [cars])

  const uniqueModels = useMemo(() => {
    if (!filters.make) return []
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

  const uniqueTransmissions = useMemo(() => {
    const transmissions = cars
      .map(car => car.transmission)
      .filter((transmission): transmission is string => Boolean(transmission))
    return Array.from(new Set(transmissions)).sort()
  }, [cars])

  const uniqueFuelTypes = useMemo(() => {
    const fuelTypes = cars
      .map(car => car.fuel_type)
      .filter((fuelType): fuelType is string => Boolean(fuelType))
    return Array.from(new Set(fuelTypes)).sort()
  }, [cars])

  // Filter and sort cars
  const filteredAndSortedCars = useMemo(() => {
    const filtered = cars.filter(car => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableText =
          `${car.name} ${car.make} ${car.model} ${car.year}`.toLowerCase()
        if (!searchableText.includes(searchTerm)) return false
      }

      // Make filter
      if (filters.make && filters.make !== 'all' && car.make !== filters.make)
        return false

      // Model filter
      if (
        filters.model &&
        filters.model !== 'all' &&
        car.model !== filters.model
      )
        return false

      // Year range filter
      if (filters.yearFrom && car.year < parseInt(filters.yearFrom))
        return false
      if (filters.yearTo && car.year > parseInt(filters.yearTo)) return false

      // Drivetrain filter
      if (
        filters.drivetrain &&
        filters.drivetrain !== 'all' &&
        car.drivetrain !== filters.drivetrain
      )
        return false

      // Transmission filter
      if (
        filters.transmission &&
        filters.transmission !== 'all' &&
        car.transmission !== filters.transmission
      )
        return false

      // Fuel type filter
      if (
        filters.fuelType &&
        filters.fuelType !== 'all' &&
        car.fuel_type !== filters.fuelType
      )
        return false

      // Horsepower range filter
      if (
        filters.minHorsepower &&
        car.horsepower &&
        car.horsepower < parseInt(filters.minHorsepower)
      )
        return false
      if (
        filters.maxHorsepower &&
        car.horsepower &&
        car.horsepower > parseInt(filters.maxHorsepower)
      )
        return false

      return true
    })

    // Sort cars
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        case 'oldest':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        case 'most_liked':
          return b.like_count - a.like_count
        case 'most_viewed':
          return b.view_count - a.view_count
        case 'most_shared':
          return b.share_count - a.share_count
        case 'most_commented':
          return b.comment_count - a.comment_count
        case 'year_asc':
          return a.year - b.year
        case 'year_desc':
          return b.year - a.year
        case 'horsepower_asc':
          return (a.horsepower || 0) - (b.horsepower || 0)
        case 'horsepower_desc':
          return (b.horsepower || 0) - (a.horsepower || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [cars, filters, sortBy])

  // Handle like changes
  const handleLikeChange = async (carId: string, newLikeCount: number) => {
    // Update local state immediately for UI responsiveness
    setCars(prevCars => {
      const updatedCars = prevCars.map(car =>
        car.id === carId ? { ...car, like_count: newLikeCount } : car
      )
      return updatedCars
    })

    // Refresh car data from database to ensure accuracy
    try {
      const refreshedCars = await getAllCarsClient()
      if (refreshedCars) {
        setCars(refreshedCars)
      }
    } catch {}
  }

  const loadCars = async () => {
    try {
      setLoading(true)
      setError(null)
      const allCars = await getAllCarsClient()
      setCars(allCars || [])
    } catch {
      setError('Failed to load cars. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
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
    setFilters({
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
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length
  }

  useEffect(() => {
    loadCars()
  }, [])

  if (loading) {
    return (
      <PageLayout
        user={user ? { ...user, email: user.email || '' } : undefined}
        showCreateButton={true}
      >
        <LoadingState message='Loading cars...' />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      user={user ? { ...user, email: user.email || '' } : undefined}
      showCreateButton={true}
    >
      <PageHeader
        title='Browse Cars'
        description='Discover amazing cars from the community'
      />

      {/* Filters and Sorting */}
      <div className='mb-8 space-y-4'>
        {/* Search and Sort Bar */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='flex-1 max-w-md'>
            <Input
              placeholder='Search cars by name, make, model, or year...'
              value={filters.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange('search', e.target.value)
              }
              className='w-full'
            />
          </div>

          <div className='flex gap-2 items-center'>
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className='w-48 cursor-pointer'>
                <SelectValue placeholder='Sort by...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest' className='cursor-pointer'>
                  Newest First
                </SelectItem>
                <SelectItem value='oldest' className='cursor-pointer'>
                  Oldest First
                </SelectItem>
                <SelectItem value='most_liked' className='cursor-pointer'>
                  Most Liked
                </SelectItem>
                <SelectItem value='most_viewed' className='cursor-pointer'>
                  Most Viewed
                </SelectItem>
                <SelectItem value='most_shared' className='cursor-pointer'>
                  Most Shared
                </SelectItem>
                <SelectItem value='most_commented' className='cursor-pointer'>
                  Most Commented
                </SelectItem>
                <SelectItem value='year_asc' className='cursor-pointer'>
                  Year (Oldest)
                </SelectItem>
                <SelectItem value='year_desc' className='cursor-pointer'>
                  Year (Newest)
                </SelectItem>
                <SelectItem value='horsepower_asc' className='cursor-pointer'>
                  Horsepower (Low)
                </SelectItem>
                <SelectItem value='horsepower_desc' className='cursor-pointer'>
                  Horsepower (High)
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant='outline'
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2 cursor-pointer'
            >
              <Filter className='w-4 h-4' />
              Filters
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
          <div className='bg-muted/50 rounded-lg p-6 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Advanced Filters</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={clearFilters}
                className='cursor-pointer'
              >
                <X className='w-4 h-4 mr-2' />
                Clear All
              </Button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {/* Make */}
              <div>
                <label className='text-sm font-medium mb-2 block'>Make</label>
                <Select
                  value={filters.make}
                  onValueChange={value => handleFilterChange('make', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Makes' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Makes</SelectItem>
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
                <label className='text-sm font-medium mb-2 block'>Model</label>
                <Select
                  value={filters.model}
                  onValueChange={value => handleFilterChange('model', value)}
                  disabled={!filters.make}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Models' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Models</SelectItem>
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
                  Year Range
                </label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    placeholder='From'
                    value={filters.yearFrom}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('yearFrom', e.target.value)
                    }
                    min='1900'
                    max='2030'
                  />
                  <Input
                    type='number'
                    placeholder='To'
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
                  Drivetrain
                </label>
                <Select
                  value={filters.drivetrain}
                  onValueChange={value =>
                    handleFilterChange('drivetrain', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Drivetrains' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Drivetrains</SelectItem>
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
                  Transmission
                </label>
                <Select
                  value={filters.transmission}
                  onValueChange={value =>
                    handleFilterChange('transmission', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Transmissions' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Transmissions</SelectItem>
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
                  Fuel Type
                </label>
                <Select
                  value={filters.fuelType}
                  onValueChange={value => handleFilterChange('fuelType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Fuel Types' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Fuel Types</SelectItem>
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
                  Horsepower Range
                </label>
                <div className='flex gap-2'>
                  <Input
                    type='number'
                    placeholder='Min HP'
                    value={filters.minHorsepower}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('minHorsepower', e.target.value)
                    }
                    min='0'
                  />
                  <Input
                    type='number'
                    placeholder='Max HP'
                    value={filters.maxHorsepower}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFilterChange('maxHorsepower', e.target.value)
                    }
                    min='0'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            Showing {filteredAndSortedCars.length} of {cars.length} cars
            {getActiveFiltersCount() > 0 && ' (filtered)'}
          </span>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={loadCars} />
      ) : filteredAndSortedCars.length === 0 ? (
        <EmptyState
          icon={CarIcon}
          title={
            cars.length === 0 ? 'No cars found' : 'No cars match your filters'
          }
          description={
            cars.length === 0
              ? 'Be the first to add a car to the community!'
              : 'Try adjusting your search criteria'
          }
        />
      ) : (
        <Grid cols={3} gap='md'>
          {filteredAndSortedCars.map(car => {
            // Extract profile from the joined data
            const profile: Profile = {
              id: car.user_id,
              username:
                (car as { profiles?: { username: string } }).profiles
                  ?.username || 'unknown',
              full_name:
                (car as { profiles?: { full_name: string | null } }).profiles
                  ?.full_name || null,
              avatar_url:
                (car as { profiles?: { avatar_url: string | null } }).profiles
                  ?.avatar_url || null,
              unit_preference: 'metric',
              created_at: '',
              updated_at: '',
              is_premium: false,
              premium_purchased_at: null,
              car_slots_purchased: 0,
              stripe_customer_id: null,
              stripe_subscription_id: null,
              total_supported_amount: 0,
              is_supporter: false,
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
      )}
    </PageLayout>
  )
}
