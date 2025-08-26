'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { getCarsByUserClient, setMainPhoto } from '@/lib/database/cars-client'
import { Profile, Car } from '@/lib/types/database'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/protected-route'
import { toast } from 'sonner'
import { User, Clock, Plus, Share2, CarIcon, Image } from 'lucide-react'
import Navbar from '@/components/ui/navbar'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading your dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        <Navbar showCreateButton={true} />

        {/* Main Content */}
        <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24'>
          {/* Stats Overview */}
          <div className='px-4 py-6 sm:px-0'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-card overflow-hidden shadow rounded-lg border border-border'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <CarIcon className='w-6 h-6 text-primary' />
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
                      <User className='w-6 h-6 text-primary' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-muted-foreground truncate'>
                          Profile Status
                        </dt>
                        <dd className='text-lg font-medium text-card-foreground'>
                          {profile ? 'Active' : 'Incomplete'}
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
                      <Clock className='w-6 h-6 text-primary' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-muted-foreground truncate'>
                          Member Since
                        </dt>
                        <dd className='text-lg font-medium text-card-foreground'>
                          {user?.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='mb-8'>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Link
                  href='/create'
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring'
                >
                  <Plus className='w-5 h-5 mr-2' />
                  Add New Car
                </Link>
                <Link
                  href='/profile'
                  className='inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring'
                >
                  <User className='w-5 h-5 mr-2' />
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Cars Grid */}
            <div>
              <h2 className='text-2xl font-bold text-foreground mb-6'>
                Your Cars
              </h2>
              {cars.length === 0 ? (
                <div className='text-center py-12'>
                  <CarIcon className='mx-auto h-12 w-12 text-muted-foreground' />
                  <h3 className='mt-2 text-sm font-medium text-foreground'>
                    No cars yet
                  </h3>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    Get started by adding your first car.
                  </p>
                  <div className='mt-6'>
                    <Link
                      href='/create'
                      className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring'
                    >
                      <Plus className='w-5 h-5 mr-2' />
                      Add Your First Car
                    </Link>
                  </div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {cars.map(car => (
                    <Link
                      key={car.id}
                      href={`/${profile?.username}/${car.url_slug}`}
                      className='bg-card overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200 block cursor-pointer border border-border'
                    >
                      <div className='p-6'>
                        <div className='flex items-center justify-between mb-4'>
                          <h3 className='text-lg font-medium text-card-foreground'>
                            {car.make} {car.model}
                          </h3>
                          <div className='flex items-center space-x-2'>
                            {car.photos && car.photos.length > 0 && (
                              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary'>
                                📸 {car.photos.length}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className='mb-4'>
                          {car.photos && car.photos.length > 0 ? (
                            <div className='relative'>
                              <img
                                src={
                                  car.main_photo_url ||
                                  car.photos.find(
                                    p => p.category === 'exterior'
                                  )?.url ||
                                  car.photos[0].url
                                }
                                alt={`${car.make} ${car.model}`}
                                className='w-full h-48 object-cover rounded-md'
                              />
                            </div>
                          ) : (
                            <div className='w-full h-48 bg-muted rounded-md flex items-center justify-center'>
                              <Image className='w-16 h-16 text-muted-foreground' />
                            </div>
                          )}
                        </div>

                        <div className='flex space-x-2'>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              router.push(
                                `/${profile?.username}/${car.url_slug}/edit`
                              )
                            }}
                            className='flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring text-center cursor-pointer'
                          >
                            Edit
                          </button>
                          <button
                            onClick={async e => {
                              e.stopPropagation()
                              const shareUrl = `${window.location.origin}/${profile?.username}/${car.url_slug}`
                              try {
                                await navigator.clipboard.writeText(shareUrl)
                                toast.success('Link copied to clipboard!')
                              } catch (error) {
                                toast.error('Failed to copy link')
                              }
                            }}
                            className='px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer'
                            title='Copy link to clipboard'
                          >
                            <Share2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </Link>
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
