'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getCarByUrlSlugAndUsernameClient } from '@/lib/database/cars-client'
import { getProfileByUsernameClient } from '@/lib/database/profiles-client'
import {
  Car,
  Profile,
  CarPhoto,
  PHOTO_CATEGORIES,
  PhotoCategory,
} from '@/lib/types/database'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { toast } from 'sonner'
import {
  Share2,
  Edit,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import Navbar from '@/components/ui/navbar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { convertToPreferredUnit } from '@/lib/utils'
import { useUnitPreference } from '@/lib/context/unit-context'

export default function CarDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { unitPreference } = useUnitPreference()
  const [car, setCar] = useState<Car | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  const [fullscreenPhotoIndex, setFullscreenPhotoIndex] = useState(0)

  useEffect(() => {
    const loadCarData = async () => {
      try {
        const [carData, profileData] = await Promise.all([
          getCarByUrlSlugAndUsernameClient(
            params.car as string,
            params.username as string
          ),
          getProfileByUsernameClient(params.username as string),
        ])

        if (carData) {
          setCar(carData)
        } else {
          setError('Car not found')
        }

        if (profileData) {
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error loading car data:', error)
        setError('Failed to load car data')
      } finally {
        setLoading(false)
      }
    }

    if (params.car && params.username) {
      loadCarData()
    }
  }, [params.car, params.username])

  const handleShare = async () => {
    const currentUrl = window.location.href

    try {
      // Always copy to clipboard first
      await navigator.clipboard.writeText(currentUrl)
      toast.success('Link copied to clipboard!')

      // Then try native sharing if available (mobile devices)
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${car?.name} by @${profile?.username || params.username}`,
            text: `Check out this ${car?.year} ${car?.make} ${car?.model}!`,
            url: currentUrl,
          })
        } catch (shareError) {
          // Native sharing failed, but clipboard copy already succeeded
          console.log(
            `Native sharing failed, but link copied to clipboard (${shareError})`
          )
        }
      }
    } catch (clipboardError) {
      console.error('Error copying to clipboard:', clipboardError)
      toast.error('Failed to copy link to clipboard')
      // Try native sharing as fallback
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${car?.name} by @${profile?.username || params.username}`,
            text: `Check out this ${car?.year} ${car?.make} ${car?.model}!`,
            url: currentUrl,
          })
        } catch (shareError) {
          console.error('Both clipboard and native sharing failed:', shareError)
          toast.error('Failed to share link')
        }
      }
    }
  }

  // Helper function to get photo URL and category
  const getPhotoInfo = (photo: string | CarPhoto) => {
    if (typeof photo === 'string') {
      // Handle old string format
      return { url: photo, category: 'other' as const }
    }

    // Handle normal photo objects
    if (photo && typeof photo === 'object' && photo.url) {
      return {
        url: photo.url,
        category:
          photo.category &&
          PHOTO_CATEGORIES.includes(photo.category as PhotoCategory)
            ? photo.category
            : ('other' as const),
      }
    }

    // Fallback
    return { url: '', category: 'other' as const }
  }

  // Filter photos by category and remove invalid photos
  const filteredPhotos =
    car?.photos?.filter(photo => {
      const { url, category } = getPhotoInfo(photo)
      // Only include photos with valid URLs
      return (
        url &&
        url.length > 0 &&
        (selectedCategory === 'all' || category === selectedCategory)
      )
    }) || []

  // Sort photos to show main photo first if it exists
  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    const aUrl = getPhotoInfo(a).url
    const bUrl = getPhotoInfo(b).url

    // If car has a main photo, prioritize it
    if (car?.main_photo_url) {
      if (aUrl === car.main_photo_url) return -1
      if (bUrl === car.main_photo_url) return 1
    }

    return 0
  })

  // Ensure selectedPhoto is valid for the current filtered photos
  useEffect(() => {
    if (sortedPhotos.length > 0 && selectedPhoto >= sortedPhotos.length) {
      setSelectedPhoto(0)
    }
  }, [sortedPhotos.length, selectedPhoto])

  const openFullscreenPhoto = (photoIndex: number) => {
    setFullscreenPhotoIndex(photoIndex)
    setIsPhotoDialogOpen(true)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (sortedPhotos.length === 0) return

    if (direction === 'prev') {
      setFullscreenPhotoIndex(prev =>
        prev === 0 ? sortedPhotos.length - 1 : prev - 1
      )
    } else {
      setFullscreenPhotoIndex(prev =>
        prev === sortedPhotos.length - 1 ? 0 : prev + 1
      )
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isPhotoDialogOpen) return

    if (e.key === 'ArrowLeft') {
      navigatePhoto('prev')
    } else if (e.key === 'ArrowRight') {
      navigatePhoto('next')
    } else if (e.key === 'Escape') {
      setIsPhotoDialogOpen(false)
    }
  }

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPhotoDialogOpen, sortedPhotos.length])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>Loading car details...</p>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-card-foreground mb-4'>
            Car Not Found
          </h1>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <Link
            href={user ? '/dashboard' : '/'}
            className='text-primary hover:text-primary/80 flex items-center gap-1'
          >
            <ArrowLeft className='w-5 h-5' />
            {user ? 'Dashboard' : 'Home'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      {/* Page Header */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            {user && (
              <Link href='/dashboard' className=' mr-4 flex items-center gap-1'>
                <ArrowLeft className='w-5 h-5' />
              </Link>
            )}
            <div>
              <h1 className='text-3xl font-bold text-foreground'>{car.name}</h1>
              <div className='text-sm text-gray-500'>
                by @{profile?.username || params.username || 'Unknown'}
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <button
              onClick={handleShare}
              className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer'
            >
              <Share2 className='w-4 h-4 mr-2' />
              Share
            </button>
            {user && car && user.id === car.user_id && (
              <Link
                href={`/${profile?.username}/${car.id}/edit`}
                className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer'
              >
                <Edit className='w-4 h-4 mr-2' />
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Photos Section */}
            <div className='lg:col-span-2'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>Photos</h2>

              {/* Category Filter */}
              {car.photos && car.photos.length > 0 && (
                <div className='mb-6'>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCategory === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } cursor-pointer`}
                    >
                      All ({car.photos.length})
                    </button>
                    {PHOTO_CATEGORIES.map(category => {
                      const count =
                        car.photos?.filter(p => {
                          const { url, category: photoCategory } =
                            getPhotoInfo(p)
                          return (
                            url && url.length > 0 && photoCategory === category
                          )
                        }).length || 0
                      if (count === 0) return null
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                            selectedCategory === category
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } cursor-pointer`}
                        >
                          {category} ({count})
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {sortedPhotos.length > 0 &&
              selectedPhoto < sortedPhotos.length ? (
                <div className='space-y-4'>
                  {/* Main Photo */}
                  <div className='aspect-w-16 aspect-h-9'>
                    <img
                      src={getPhotoInfo(sortedPhotos[selectedPhoto]).url}
                      alt={`${car.name} - ${
                        getPhotoInfo(sortedPhotos[selectedPhoto]).category
                      } ${selectedPhoto + 1}`}
                      className='w-full h-96 object-cover rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity'
                      onClick={() => openFullscreenPhoto(selectedPhoto)}
                    />
                  </div>

                  {/* Photo Thumbnails */}
                  {sortedPhotos.length > 1 && (
                    <div className='grid grid-cols-4 gap-2'>
                      {sortedPhotos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPhoto(index)}
                          className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden cursor-pointer ${
                            selectedPhoto === index
                              ? 'ring-2 ring-indigo-500'
                              : ''
                          }`}
                        >
                          <img
                            src={getPhotoInfo(photo).url}
                            alt={`${car.name} ${getPhotoInfo(photo).category} ${
                              index + 1
                            }`}
                            className='w-full h-20 object-cover'
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-center py-12 bg-gray-100 rounded-lg'>
                  <Image className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    {car.photos && car.photos.length > 0
                      ? 'Photos Corrupted'
                      : 'No photos yet'}
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    {car.photos && car.photos.length > 0
                      ? 'The existing photos appear to be corrupted. Please re-upload them in the edit page.'
                      : selectedCategory === 'all'
                      ? 'No photos have been uploaded for this car.'
                      : `No photos in the ${selectedCategory} category.`}
                  </p>
                  {car.photos && car.photos.length > 0 && (
                    <div className='mt-4'>
                      <Link
                        href={`/${
                          profile?.username || params.username
                        }/${encodeURIComponent(car.name)}/edit`}
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      >
                        Edit Car & Re-upload Photos
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Specifications Section */}
            <div className='lg:col-span-1'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                Specifications
              </h2>

              <div className='bg-white shadow rounded-lg divide-y divide-gray-200'>
                {/* Basic Info */}
                <div className='p-6'>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    Basic Information
                  </h3>
                  <dl className='space-y-3'>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        Make
                      </dt>
                      <dd className='text-sm text-gray-900'>{car.make}</dd>
                    </div>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        Model
                      </dt>
                      <dd className='text-sm text-gray-900'>{car.model}</dd>
                    </div>
                    <div>
                      <dt className='text-sm font-medium text-gray-500'>
                        Year
                      </dt>
                      <dd className='text-sm text-gray-900'>{car.year}</dd>
                    </div>
                    {car.description && (
                      <div>
                        <dt className='text-sm font-medium text-gray-500'>
                          Description
                        </dt>
                        <dd className='text-sm text-gray-900'>
                          {car.description}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Engine Specifications */}
                {(car.engine_displacement ||
                  car.engine_cylinders ||
                  car.engine_code ||
                  car.horsepower ||
                  car.torque ||
                  car.engine_type ||
                  car.fuel_type ||
                  car.transmission ||
                  car.drivetrain) && (
                  <div className='p-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Engine & Performance
                    </h3>
                    <dl className='space-y-3'>
                      {car.engine_displacement && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Engine Displacement
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.engine_displacement}L
                          </dd>
                        </div>
                      )}
                      {car.engine_cylinders && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Cylinders
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.engine_cylinders}
                          </dd>
                        </div>
                      )}
                      {car.engine_code && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Engine Code
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.engine_code}
                          </dd>
                        </div>
                      )}
                      {car.horsepower && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Horsepower
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.horsepower} HP
                          </dd>
                        </div>
                      )}
                      {car.torque && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Torque
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {convertToPreferredUnit(
                              car.torque,
                              'torque',
                              unitPreference
                            )}
                          </dd>
                        </div>
                      )}
                      {car.engine_type && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Engine Type
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.engine_type}
                          </dd>
                        </div>
                      )}
                      {car.fuel_type && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Fuel Type
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.fuel_type}
                          </dd>
                        </div>
                      )}
                      {car.transmission && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Transmission
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.transmission}
                          </dd>
                        </div>
                      )}
                      {car.drivetrain && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Drivetrain
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.drivetrain}
                          </dd>
                        </div>
                      )}
                      {car.zero_to_sixty && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            {unitPreference === 'metric'
                              ? '0-100 km/h'
                              : '0-60 mph'}
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.zero_to_sixty}s
                          </dd>
                        </div>
                      )}
                      {car.top_speed && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Top Speed
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {convertToPreferredUnit(
                              car.top_speed,
                              'speed',
                              unitPreference
                            )}
                          </dd>
                        </div>
                      )}
                      {car.quarter_mile && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            0-400m
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.quarter_mile}s
                          </dd>
                        </div>
                      )}
                      {car.weight && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Weight
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {convertToPreferredUnit(
                              car.weight,
                              'weight',
                              unitPreference
                            )}
                          </dd>
                        </div>
                      )}
                      {car.power_to_weight && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Power to Weight Ratio
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.power_to_weight}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Wheels & Tires */}
                {(car.wheel_size ||
                  car.wheel_brand ||
                  car.wheel_material ||
                  car.wheel_offset ||
                  car.front_tire_size ||
                  car.front_tire_brand ||
                  car.front_tire_model ||
                  car.rear_tire_size ||
                  car.rear_tire_brand ||
                  car.rear_tire_model ||
                  car.front_tire_pressure ||
                  car.rear_tire_pressure) && (
                  <div className='p-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Wheels & Tires
                    </h3>
                    <dl className='space-y-3'>
                      {car.wheel_size && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Wheel Size
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.wheel_size}
                          </dd>
                        </div>
                      )}
                      {car.wheel_brand && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Wheel Brand
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.wheel_brand}
                          </dd>
                        </div>
                      )}
                      {car.wheel_material && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Wheel Material
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.wheel_material}
                          </dd>
                        </div>
                      )}
                      {car.wheel_offset && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Wheel Offset
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.wheel_offset}
                          </dd>
                        </div>
                      )}
                      {car.front_tire_size && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Front Tire Size
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.front_tire_size}
                          </dd>
                        </div>
                      )}
                      {car.front_tire_brand && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Front Tire Brand
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.front_tire_brand}
                          </dd>
                        </div>
                      )}
                      {car.front_tire_model && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Front Tire Model
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.front_tire_model}
                          </dd>
                        </div>
                      )}
                      {car.rear_tire_size && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Rear Tire Size
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.rear_tire_size}
                          </dd>
                        </div>
                      )}
                      {car.rear_tire_brand && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Rear Tire Brand
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.rear_tire_brand}
                          </dd>
                        </div>
                      )}
                      {car.rear_tire_model && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Rear Tire Model
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.rear_tire_model}
                          </dd>
                        </div>
                      )}
                      {car.front_tire_pressure && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Front Tire Pressure
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {convertToPreferredUnit(
                              car.front_tire_pressure,
                              'pressure',
                              unitPreference
                            )}
                          </dd>
                        </div>
                      )}
                      {car.rear_tire_pressure && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Rear Tire Pressure
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {convertToPreferredUnit(
                              car.rear_tire_pressure,
                              'pressure',
                              unitPreference
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Brakes */}
                {(car.front_brakes ||
                  car.rear_brakes ||
                  car.brake_rotors ||
                  car.brake_caliper_brand ||
                  car.brake_lines) && (
                  <div className='p-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Brake System
                    </h3>
                    <dl className='space-y-3'>
                      {car.front_brakes && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Front Brakes
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.front_brakes}
                          </dd>
                        </div>
                      )}
                      {car.rear_brakes && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Rear Brakes
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.rear_brakes}
                          </dd>
                        </div>
                      )}
                      {car.brake_rotors && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Rotors
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.brake_rotors}
                          </dd>
                        </div>
                      )}
                      {car.brake_caliper_brand && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Caliper Brand
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.brake_caliper_brand}
                          </dd>
                        </div>
                      )}
                      {car.brake_lines && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Brake Lines
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.brake_lines}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Suspension */}
                {(car.front_suspension ||
                  car.rear_suspension ||
                  car.suspension_type ||
                  car.ride_height ||
                  car.coilovers ||
                  car.sway_bars) && (
                  <div className='p-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Suspension
                    </h3>
                    <dl className='space-y-3'>
                      {car.front_suspension && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Front Suspension
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.front_suspension}
                          </dd>
                        </div>
                      )}
                      {car.rear_suspension && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Rear Suspension
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.rear_suspension}
                          </dd>
                        </div>
                      )}
                      {car.suspension_type && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Suspension Type
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.suspension_type}
                          </dd>
                        </div>
                      )}
                      {car.ride_height && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Ride Height
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.ride_height}
                          </dd>
                        </div>
                      )}
                      {car.coilovers && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Coilovers
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.coilovers}
                          </dd>
                        </div>
                      )}
                      {car.sway_bars && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Sway Bars
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.sway_bars}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Exterior */}
                {(car.body_kit ||
                  car.paint_color ||
                  car.paint_type ||
                  car.wrap_color ||
                  car.carbon_fiber_parts ||
                  car.lighting) && (
                  <div className='p-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Exterior
                    </h3>
                    <dl className='space-y-3'>
                      {car.body_kit && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Body Kit
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.body_kit}
                          </dd>
                        </div>
                      )}
                      {car.paint_color && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Paint Color
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.paint_color}
                          </dd>
                        </div>
                      )}
                      {car.paint_type && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Paint Type
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.paint_type}
                          </dd>
                        </div>
                      )}
                      {car.wrap_color && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Wrap Color
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.wrap_color}
                          </dd>
                        </div>
                      )}
                      {car.carbon_fiber_parts && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Carbon Fiber Parts
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.carbon_fiber_parts}
                          </dd>
                        </div>
                      )}
                      {car.lighting && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Lighting
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.lighting}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Interior */}
                {(car.interior_color ||
                  car.interior_material ||
                  car.seats ||
                  car.steering_wheel ||
                  car.shift_knob ||
                  car.gauges) && (
                  <div className='p-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Interior
                    </h3>
                    <dl className='space-y-3'>
                      {car.interior_color && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Interior Color
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.interior_color}
                          </dd>
                        </div>
                      )}
                      {car.interior_material && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Interior Material
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.interior_material}
                          </dd>
                        </div>
                      )}
                      {car.seats && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Seats
                          </dt>
                          <dd className='text-sm text-gray-900'>{car.seats}</dd>
                        </div>
                      )}
                      {car.steering_wheel && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Steering Wheel
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.steering_wheel}
                          </dd>
                        </div>
                      )}
                      {car.shift_knob && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Shift Knob
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.shift_knob}
                          </dd>
                        </div>
                      )}
                      {car.gauges && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Gauges
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.gauges}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Modifications */}
                {car.modifications && car.modifications.length > 0 && (
                  <div className='p-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Modifications
                    </h3>
                    <ul className='space-y-2'>
                      {car.modifications.map((mod, index) => (
                        <li key={index} className='text-sm text-gray-900'>
                          • {mod}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Details */}
                {(car.mileage ||
                  car.fuel_economy ||
                  car.vin ||
                  car.maintenance_history) && (
                  <div className='p-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Additional Details
                    </h3>
                    <dl className='space-y-3'>
                      {car.mileage && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Mileage
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {convertToPreferredUnit(
                              car.mileage,
                              'distance',
                              unitPreference
                            )}
                          </dd>
                        </div>
                      )}
                      {car.fuel_economy && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Fuel Economy
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.fuel_economy}
                          </dd>
                        </div>
                      )}
                      {car.vin && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            VIN
                          </dt>
                          <dd className='text-sm text-gray-900'>{car.vin}</dd>
                        </div>
                      )}
                      {car.maintenance_history && (
                        <div>
                          <dt className='text-sm font-medium text-gray-500'>
                            Maintenance History
                          </dt>
                          <dd className='text-sm text-gray-900'>
                            {car.maintenance_history}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Dyno Results */}
                {car.dyno_results && (
                  <div className='p-6'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Dyno Results
                    </h3>
                    <p className='text-sm text-gray-900'>{car.dyno_results}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Photo Viewer */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className='max-w-none w-screen h-screen p-0 bg-black/95 border-0 rounded-none'>
          <DialogTitle className='sr-only'>
            {car.name} - Photo {fullscreenPhotoIndex + 1} of{' '}
            {sortedPhotos.length}
          </DialogTitle>
          <div className='relative w-full h-full flex items-center justify-center'>
            {/* Close Button */}
            <button
              onClick={() => setIsPhotoDialogOpen(false)}
              className='absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors'
            >
              <X className='w-6 h-6' />
            </button>

            {/* Navigation Buttons */}
            {sortedPhotos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto('prev')}
                  className='absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors'
                >
                  <ChevronLeft className='w-8 h-8' />
                </button>
                <button
                  onClick={() => navigatePhoto('next')}
                  className='absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors'
                >
                  <ChevronRight className='w-8 h-8' />
                </button>
              </>
            )}

            {/* Photo Counter */}
            {sortedPhotos.length > 1 && (
              <div className='absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 text-white text-sm rounded-full'>
                {fullscreenPhotoIndex + 1} / {sortedPhotos.length}
              </div>
            )}

            {/* Main Photo */}
            {sortedPhotos[fullscreenPhotoIndex] && (
              <img
                src={getPhotoInfo(sortedPhotos[fullscreenPhotoIndex]).url}
                alt={`${car.name} - ${
                  getPhotoInfo(sortedPhotos[fullscreenPhotoIndex]).category
                } ${fullscreenPhotoIndex + 1}`}
                className='max-w-full max-h-full object-contain'
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
