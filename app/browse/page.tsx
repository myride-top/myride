'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { getAllCarsClient } from '@/lib/database/cars-client'
import { Car, Profile } from '@/lib/types/database'
import Navbar from '@/components/ui/navbar'
import LoadingSpinner from '@/components/ui/loading-spinner'
import EmptyState from '@/components/ui/empty-state'
import CarCard from '@/components/cars/car-card'
import { CarIcon } from 'lucide-react'

export default function BrowsePage() {
  const { user } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCars = async () => {
      try {
        console.log('Loading cars...')
        const allCars = await getAllCarsClient()
        console.log('Cars loaded:', allCars?.length || 0)
        setCars(allCars || [])
      } catch (error) {
        console.error('Error loading cars:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCars()
  }, [])

  if (loading) {
    return <LoadingSpinner fullScreen message='Loading cars...' />
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

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

            {cars.length === 0 ? (
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
                    username: (car as any).profiles?.username || 'unknown',
                    full_name: (car as any).profiles?.full_name || null,
                    avatar_url: (car as any).profiles?.avatar_url || null,
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
