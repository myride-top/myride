'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { getAllCarsClient } from '@/lib/database/cars-client'
import { Car, Profile } from '@/lib/types/database'
import { MainNavbar, LandingNavbar } from '@/components/navbar'
import LoadingSpinner from '@/components/common/loading-spinner'
import EmptyState from '@/components/common/empty-state'
import CarCard from '@/components/cars/car-card'
import { CarIcon } from 'lucide-react'

export default function BrowsePage() {
  const { user } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    } catch (error) {
      console.error('Error refreshing car data after like change:', error)
    }
  }

  useEffect(() => {
    const loadCars = async () => {
      try {
        console.log('Loading cars...')
        const allCars = await getAllCarsClient()
        console.log('Cars loaded:', allCars?.length || 0)
        setCars(allCars || [])
        setError(null)
      } catch (error) {
        console.error('Error loading cars:', error)
        setError('Failed to load cars. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadCars()
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen bg-background'>
        {user ? <MainNavbar /> : <LandingNavbar />}
        <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24'>
          <div className='px-4 py-6 sm:px-0'>
            <LoadingSpinner message='Loading cars...' />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      {user ? <MainNavbar /> : <LandingNavbar />}

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24'>
        <div className='px-4 py-6 sm:px-0'>
          <div>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              Browse Cars
            </h1>
            <p className='text-muted-foreground mb-6'>
              Discover amazing cars from the community
            </p>

            {error ? (
              <div className='text-center py-12'>
                <p className='text-red-500 mb-4'>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
                >
                  Try Again
                </button>
              </div>
            ) : cars.length === 0 ? (
              <EmptyState
                icon={CarIcon}
                title='No cars found'
                description='Be the first to add a car to the community!'
              />
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {cars.map(car => {
                  // Extract profile from the joined data
                  const profile: Profile = {
                    id: car.user_id,
                    username:
                      (car as { profiles?: { username: string } }).profiles
                        ?.username || 'unknown',
                    full_name:
                      (car as { profiles?: { full_name: string | null } })
                        .profiles?.full_name || null,
                    avatar_url:
                      (car as { profiles?: { avatar_url: string | null } })
                        .profiles?.avatar_url || null,
                    unit_preference: 'metric',
                    created_at: '',
                    updated_at: '',
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
