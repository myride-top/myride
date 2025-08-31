'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { getCarsByUserClient } from '@/lib/database/cars-client'
import { getUserCarSlots } from '@/lib/database/premium-client'
import { Profile, Car } from '@/lib/types/database'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/protected-route'
import { Plus, CarIcon, Info, Heart, Calendar, Image } from 'lucide-react'
import { MainNavbar } from '@/components/navbar'
import LoadingSpinner from '@/components/common/loading-spinner'
import EmptyState from '@/components/common/empty-state'
import CarCard from '@/components/cars/car-card'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalPhotos: 0,
    memberSince: '',
  })
  const [carSlots, setCarSlots] = useState({
    currentCars: 0,
    maxAllowedCars: 1,
    purchasedSlots: 0,
    isPremium: false,
  })

  // Function to recalculate stats
  const recalculateStats = (currentCars: Car[]) => {
    const totalLikes = currentCars.reduce(
      (sum, car) => sum + (car.like_count || 0),
      0
    )
    const totalPhotos = currentCars.reduce(
      (sum, car) => sum + (car.photos?.length || 0),
      0
    )
    const memberSince = user?.created_at
      ? new Date(user.created_at).toLocaleDateString()
      : 'N/A'

    setStats({
      totalLikes,
      totalPhotos,
      memberSince,
    })
  }

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
    if (user) {
      try {
        const refreshedCars = await getCarsByUserClient(user.id)
        if (refreshedCars) {
          setCars(refreshedCars)
          // Recalculate stats with fresh data
          recalculateStats(refreshedCars)
        }
      } catch (error) {
        console.error('Error refreshing car data after like change:', error)
      }
    }
  }

  // Handle sharing cars
  const handleShare = async (car: Car) => {
    const carUrl = `${window.location.origin}/${profile?.username}/${car.url_slug}`

    try {
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: `${car.name} - ${car.make} ${car.model}`,
          text: `Check out my ${car.make} ${car.model} on MyRide!`,
          url: carUrl,
        })
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(carUrl)
        toast.success('Car URL copied to clipboard!')
      }
    } catch (error) {
      // Fallback to clipboard copy if native sharing fails
      try {
        await navigator.clipboard.writeText(carUrl)
        toast.success('Car URL copied to clipboard!')
      } catch (clipboardError) {
        toast.error('Failed to share car')
      }
    }
  }

  useEffect(() => {
    const loadUserData = async () => {
      console.log('Loading user data for user:', user)

      if (user) {
        console.log('User details:', {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        })

        try {
          const [userProfile, userCars, userCarSlots] = await Promise.all([
            getProfileByUserIdClient(user.id),
            getCarsByUserClient(user.id),
            getUserCarSlots(user.id),
          ])
          setProfile(userProfile)
          setCars(userCars || [])
          setCarSlots(userCarSlots)

          // Calculate stats
          recalculateStats(userCars || [])
        } catch (error) {
          console.error('Error loading user data:', error)
        } finally {
          setLoading(false)
        }
      } else {
        console.log('No user found')
        setLoading(false)
      }
    }

    loadUserData()
  }, [user])

  // Recalculate stats when cars change
  useEffect(() => {
    if (cars.length > 0) {
      recalculateStats(cars)
    }
  }, [cars])

  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner fullScreen message='Loading your dashboard...' />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        <MainNavbar showCreateButton={true} />

        {/* Main Content */}
        <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24'>
          <div className='px-4 py-6 sm:px-0'>
            {/* Stats Overview */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8'>
              <div className='bg-card overflow-hidden shadow rounded-lg border border-border'>
                <div className='p-3 md:p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <CarIcon className='w-5 h-5 md:w-6 md:h-6 text-muted-foreground' />
                    </div>
                    <div className='ml-3 md:ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-xs md:text-sm font-medium text-muted-foreground truncate'>
                          Total Cars
                        </dt>
                        <dd className='text-base md:text-lg font-medium text-card-foreground'>
                          {cars.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-card overflow-hidden shadow rounded-lg border border-border'>
                <div className='p-3 md:p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Heart className='w-5 h-5 md:w-6 md:h-6 text-red-500' />
                    </div>
                    <div className='ml-3 md:ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-xs md:text-sm font-medium text-muted-foreground truncate'>
                          Total Likes
                        </dt>
                        <dd className='text-base md:text-lg font-medium text-card-foreground'>
                          {stats.totalLikes}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-card overflow-hidden shadow rounded-lg border border-border'>
                <div className='p-3 md:p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Image className='w-5 h-5 md:w-6 md:h-6 text-muted-foreground' />
                    </div>
                    <div className='ml-3 md:ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-xs md:text-sm font-medium text-muted-foreground truncate'>
                          Total Photos
                        </dt>
                        <dd className='text-base md:text-lg font-medium text-card-foreground'>
                          {stats.totalPhotos}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-card overflow-hidden shadow rounded-lg border border-border'>
                <div className='p-3 md:p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Calendar className='w-5 h-5 md:w-6 md:h-6 text-muted-foreground' />
                    </div>
                    <div className='ml-3 md:ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-xs md:text-sm font-medium text-muted-foreground truncate'>
                          Member Since
                        </dt>
                        <dd className='text-base md:text-lg font-medium text-card-foreground'>
                          {stats.memberSince}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cars Grid */}
            <div>
              <h2 className='text-2xl font-bold text-foreground mb-6'>
                Your Cars
              </h2>
              {cars.length === 0 ? (
                <EmptyState
                  icon={CarIcon}
                  title='No cars yet'
                  description='Get started by adding your first car.'
                  action={
                    <Link
                      href='/create'
                      className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring cursor-pointer'
                    >
                      <Plus className='w-5 h-5 mr-2' />
                      Add Your First Car
                    </Link>
                  }
                />
              ) : cars.length === 1 &&
                !carSlots.isPremium &&
                carSlots.currentCars >= carSlots.maxAllowedCars ? (
                <div className='space-y-6'>
                  <div className='bg-blue-50 dark:bg-blue-50/10 border border-blue-200 dark:border-blue-200/50 rounded-lg p-4'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>
                        <Info className='h-5 w-5 text-blue-400' />
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm text-blue-700 dark:text-blue-300'>
                          {carSlots.purchasedSlots > 0
                            ? `You have reached your car limit (${carSlots.currentCars}/${carSlots.maxAllowedCars}). Purchase more car slots to add additional cars.`
                            : 'You have reached the maximum limit of 1 car per user. Upgrade to premium or purchase additional car slots to add more cars.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {cars.map(car => (
                      <CarCard
                        key={car.id}
                        car={car}
                        profile={profile}
                        isOwner={true}
                        onEdit={car =>
                          router.push(
                            `/${profile?.username}/${car.url_slug}/edit`
                          )
                        }
                        onShare={car => handleShare(car)}
                        onLikeChange={handleLikeChange}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {cars.map(car => (
                    <CarCard
                      key={car.id}
                      car={car}
                      profile={profile}
                      isOwner={true}
                      onEdit={car =>
                        router.push(
                          `/${profile?.username}/${car.url_slug}/edit`
                        )
                      }
                      onShare={car => handleShare(car)}
                      onLikeChange={handleLikeChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
