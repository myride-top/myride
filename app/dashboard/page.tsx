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
import {
  Plus,
  Info,
  Heart,
  Crown,
  Eye,
  Share2,
  MessageCircle,
} from 'lucide-react'
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
    totalViews: 0,
    totalShares: 0,
    totalComments: 0,
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
    const totalViews = currentCars.reduce(
      (sum, car) => sum + (car.view_count || 0),
      0
    )
    const totalShares = currentCars.reduce(
      (sum, car) => sum + (car.share_count || 0),
      0
    )
    const totalComments = currentCars.reduce(
      (sum, car) => sum + (car.comment_count || 0),
      0
    )

    setStats({
      totalLikes,
      totalViews,
      totalShares,
      totalComments,
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
            {/* Stats Overview - 4 stats: Total Likes + 3 Premium Stats */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8'>
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

              {/* Premium Stats - Blurred for non-premium users */}
              <div className='bg-card overflow-hidden shadow rounded-lg border border-border group relative'>
                <div className='p-3 md:p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Eye className='w-5 h-5 md:w-6 md:h-6 text-muted-foreground' />
                    </div>
                    <div className='ml-3 md:ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-xs md:text-sm font-medium text-muted-foreground truncate flex items-center gap-1'>
                          Total Views
                          {!carSlots.isPremium && (
                            <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
                              PREMIUM
                            </span>
                          )}
                        </dt>
                        <dd
                          className={`text-base md:text-lg font-medium text-card-foreground ${
                            !carSlots.isPremium ? 'blur-sm' : ''
                          }`}
                        >
                          {stats.totalViews}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                {/* Premium upgrade overlay */}
                {!carSlots.isPremium && (
                  <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'>
                    <Link
                      href='/premium'
                      className='bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors'
                    >
                      Upgrade to Premium
                    </Link>
                  </div>
                )}
              </div>

              <div className='bg-card overflow-hidden shadow rounded-lg border border-border group relative'>
                <div className='p-3 md:p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Share2 className='w-5 h-5 md:w-6 md:h-6 text-muted-foreground' />
                    </div>
                    <div className='ml-3 md:ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-xs md:text-sm font-medium text-muted-foreground truncate flex items-center gap-1'>
                          Total Shares
                          {!carSlots.isPremium && (
                            <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
                              PREMIUM
                            </span>
                          )}
                        </dt>
                        <dd
                          className={`text-base md:text-lg font-medium text-card-foreground ${
                            !carSlots.isPremium ? 'blur-sm' : ''
                          }`}
                        >
                          {stats.totalShares}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                {/* Premium upgrade overlay */}
                {!carSlots.isPremium && (
                  <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'>
                    <Link
                      href='/premium'
                      className='bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors'
                    >
                      Upgrade to Premium
                    </Link>
                  </div>
                )}
              </div>

              <div className='bg-card overflow-hidden shadow rounded-lg border border-border group relative'>
                <div className='p-3 md:p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <MessageCircle className='w-5 h-5 md:w-6 md:h-6 text-muted-foreground' />
                    </div>
                    <div className='ml-3 md:ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-xs md:text-sm font-medium text-muted-foreground truncate flex items-center gap-1'>
                          Total Comments
                          {!carSlots.isPremium && (
                            <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
                              PREMIUM
                            </span>
                          )}
                        </dt>
                        <dd
                          className={`text-base md:text-lg font-medium text-card-foreground ${
                            !carSlots.isPremium ? 'blur-sm' : ''
                          }`}
                        >
                          {stats.totalComments}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                {/* Premium upgrade overlay */}
                {!carSlots.isPremium && (
                  <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'>
                    <Link
                      href='/premium'
                      className='bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors'
                    >
                      Upgrade to Premium
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Buy More Slots Section for Non-Premium Users */}
            {!carSlots.isPremium && cars.length >= carSlots.maxAllowedCars && (
              <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1'>
                      Need More Car Slots?
                    </h3>
                    <p className='text-blue-700 dark:text-blue-300 text-sm'>
                      Currently {cars.length}/{carSlots.maxAllowedCars} cars •{' '}
                      {carSlots.maxAllowedCars - cars.length} slot
                      {carSlots.maxAllowedCars - cars.length !== 1
                        ? 's'
                        : ''}{' '}
                      remaining
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <Link
                      href='/buy-car-slot'
                      className='inline-flex items-center px-4 py-2 border border-blue-600 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/50 rounded-md text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Buy More Slots
                    </Link>
                    <Link
                      href='/premium'
                      className='inline-flex items-center px-4 py-2 border border-amber-600 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/50 rounded-md text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors'
                    >
                      <Crown className='w-4 h-4 mr-2' />
                      Go Premium
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Cars Grid */}
            <div>
              <h2 className='text-2xl font-bold text-foreground mb-6'>
                Your Cars
              </h2>
              {cars.length === 0 ? (
                <EmptyState
                  icon={Info}
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
