'use client'

import { useEffect, useState } from 'react'
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
    } catch (error) {}
  }

  const loadCars = async () => {
    try {
      setLoading(true)
      setError(null)
      const allCars = await getAllCarsClient()
      setCars(allCars || [])
    } catch (error) {
      setError('Failed to load cars. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCars()
  }, [])

  if (loading) {
    return (
      <PageLayout user={user} showCreateButton={true}>
        <LoadingState message='Loading cars...' />
      </PageLayout>
    )
  }

  return (
    <PageLayout user={user} showCreateButton={true}>
      <PageHeader
        title='Browse Cars'
        description='Discover amazing cars from the community'
      />

      {error ? (
        <ErrorState message={error} onRetry={loadCars} />
      ) : cars.length === 0 ? (
        <EmptyState
          icon={CarIcon}
          title='No cars found'
          description='Be the first to add a car to the community!'
        />
      ) : (
        <Grid cols={3} gap='md'>
          {cars.map(car => {
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
