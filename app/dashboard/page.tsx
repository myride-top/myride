'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { getCarsByUserClient } from '@/lib/database/cars-client'
import { Profile, Car } from '@/lib/types/database'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/protected-route'
import { toast } from 'sonner'

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

  const handleSignOut = async () => {
    await signOut()
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
        {/* Header */}
        <header className='bg-white shadow'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-6'>
              <div className='flex items-center'>
                <h1 className='text-3xl font-bold text-gray-900'>MyRide</h1>
              </div>
              <div className='flex items-center space-x-4'>
                <span className='text-gray-700'>
                  Welcome, {profile?.username || user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className='bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer'
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          {/* Stats Overview */}
          <div className='px-4 py-6 sm:px-0'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <svg
                        className='w-6 h-6 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
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
                      <svg
                        className='w-6 h-6 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
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
                      <svg
                        className='w-6 h-6 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
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
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  Add New Car
                </Link>
                <Link
                  href='/profile'
                  className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
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
                  <svg
                    className='mx-auto h-12 w-12 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
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
                      <svg
                        className='w-5 h-5 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                        />
                      </svg>
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
                                  car.photos.find(
                                    p => p.category === 'exterior'
                                  )?.url || car.photos[0].url
                                }
                                alt={`${car.make} ${car.model}`}
                                className='w-full h-48 object-cover rounded-md'
                              />
                              <div className='absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium'>
                                {car.photos.find(p => p.category === 'exterior')
                                  ? 'Exterior'
                                  : car.photos[0].category || 'Photo'}
                              </div>
                            </div>
                          ) : (
                            <div className='w-full h-48 bg-gray-200 rounded-md flex items-center justify-center'>
                              <svg
                                className='w-16 h-16 text-gray-400'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                />
                              </svg>
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
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                              />
                            </svg>
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
