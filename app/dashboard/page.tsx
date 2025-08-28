'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { getCarsByUserClient } from '@/lib/database/cars-client'
import { Profile, Car } from '@/lib/types/database'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/protected-route'
import { Plus, CarIcon, Info, Heart, Calendar, Image } from 'lucide-react'
import Navbar from '@/components/layout/navbar'
import LoadingSpinner from '@/components/common/loading-spinner'
import EmptyState from '@/components/common/empty-state'
import CarCard from '@/components/cars/car-card'

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
  const handleLikeChange = (carId: string, newLikeCount: number) => {
    setCars(prevCars => {
      const updatedCars = prevCars.map(car =>
        car.id === carId ? { ...car, like_count: newLikeCount } : car
      )
      return updatedCars
    })
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
          const [userProfile, userCars] = await Promise.all([
            getProfileByUserIdClient(user.id),
            getCarsByUserClient(user.id),
          ])
          setProfile(userProfile)

          setCars(userCars || [])

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
        <Navbar showCreateButton={true} />

        {/* Main Content */}
        <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24'>
          <div className='px-4 py-6 sm:px-0'>
            {/* Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
              <div className='bg-card overflow-hidden shadow rounded-lg border border-border'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <CarIcon className='w-6 h-6 text-muted-foreground' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-muted-foreground truncate'>
                          Total Cars
                        </dt>
                        <dd className='text-lg font-medium text-card-foreground'>
                          {cars.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-card overflow-hidden shadow rounded-lg border border-border'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Heart className='w-6 h-6 text-red-500' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-muted-foreground truncate'>
                          Total Likes
                        </dt>
                        <dd className='text-lg font-medium text-card-foreground'>
                          {stats.totalLikes}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-card overflow-hidden shadow rounded-lg border border-border'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Image className='w-6 h-6 text-muted-foreground' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-muted-foreground truncate'>
                          Total Photos
                        </dt>
                        <dd className='text-lg font-medium text-card-foreground'>
                          {stats.totalPhotos}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-card overflow-hidden shadow rounded-lg border border-border'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Calendar className='w-6 h-6 text-muted-foreground' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-muted-foreground truncate'>
                          Member Since
                        </dt>
                        <dd className='text-lg font-medium text-card-foreground'>
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
              ) : cars.length === 1 ? (
                <div className='space-y-6'>
                  <div className='bg-blue-50 dark:bg-blue-50/10 border border-blue-200 dark:border-blue-200/50 rounded-lg p-4'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>
                        <Info className='h-5 w-5 text-blue-400' />
                      </div>
                      <div className='ml-3'>
                        <p className='text-sm text-blue-700 dark:text-blue-300'>
                          You have reached the maximum limit of 1 car per user.
                          To add a new car, you&apos;ll need to delete your
                          existing car first.
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
                        onShare={car =>
                          router.push(`/${profile?.username}/${car.url_slug}`)
                        }
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
                      onShare={car =>
                        router.push(`/${profile?.username}/${car.url_slug}`)
                      }
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
