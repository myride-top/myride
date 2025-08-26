'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { getCarsByUserClient, setMainPhoto } from '@/lib/database/cars-client'
import { Profile, Car } from '@/lib/types/database'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/protected-route'
import { toast } from 'sonner'
import {
  Trash2,
  User,
  Clock,
  Plus,
  Edit,
  Eye,
  Share2,
  Star,
  Car as CarIcon,
  Image,
} from 'lucide-react'
import Navbar from '@/components/ui/navbar'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
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

  const handleSetMainPhoto = async (car: Car, photoUrl: string) => {
    try {
      const updatedCar = await setMainPhoto(car.id, photoUrl)
      if (updatedCar) {
        // Update the car in the local state
        setCars(prevCars =>
          prevCars.map(c => (c.id === car.id ? updatedCar : c))
        )
        toast.success('Main photo set successfully!')
      } else {
        toast.error('Failed to set main photo')
      }
    } catch (error) {
      console.error('Error setting main photo:', error)
      toast.error('Failed to set main photo')
    }
  }

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
      <div className='min-h-screen bg-gray-50'>
        <Navbar showCreateButton={true} />

        {/* Main Content */}
        <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          {/* Stats Overview */}
          <div className='px-4 py-6 sm:px-0'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <CarIcon className='w-6 h-6 text-gray-400' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Total Cars
                        </dt>
                        <dd className='text-lg font-medium text-gray-900'>
                          {cars.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <User className='w-6 h-6 text-gray-400' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Profile Status
                        </dt>
                        <dd className='text-lg font-medium text-gray-900'>
                          {profile ? 'Active' : 'Incomplete'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <Clock className='w-6 h-6 text-gray-400' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Member Since
                        </dt>
                        <dd className='text-lg font-medium text-gray-900'>
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
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  <Plus className='w-5 h-5 mr-2' />
                  Add New Car
                </Link>
                <Link
                  href='/profile'
                  className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  <User className='w-5 h-5 mr-2' />
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Cars Grid */}
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                Your Cars
              </h2>
              {cars.length === 0 ? (
                <div className='text-center py-12'>
                  <CarIcon className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No cars yet
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    Get started by adding your first car.
                  </p>
                  <div className='mt-6'>
                    <Link
                      href='/create'
                      className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    >
                      <Plus className='w-5 h-5 mr-2' />
                      Add Your First Car
                    </Link>
                  </div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {cars.map(car => (
                    <div
                      key={car.id}
                      className='bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200'
                    >
                      <div className='p-6'>
                        <div className='flex items-center justify-between mb-4'>
                          <h3 className='text-lg font-medium text-gray-900'>
                            {car.make} {car.model}
                          </h3>
                          <div className='flex items-center space-x-2'>
                            {car.photos && car.photos.length > 0 && (
                              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                📸 {car.photos.length}
                              </span>
                            )}
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                              {car.year}
                            </span>
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
                            <div className='w-full h-48 bg-gray-200 rounded-md flex items-center justify-center'>
                              <Image className='w-16 h-16 text-gray-400' />
                            </div>
                          )}
                        </div>

                        <div className='flex space-x-2'>
                          <Link
                            href={`/${profile?.username}/${car.url_slug}/edit`}
                            className='flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center'
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/${profile?.username}/${car.url_slug}`}
                            className='flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center'
                          >
                            View
                          </Link>
                          <button
                            onClick={async () => {
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
                    </div>
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
