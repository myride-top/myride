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
  Edit,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import Navbar from '@/components/ui/navbar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import LoadingSpinner from '@/components/ui/loading-spinner'
import EmptyState from '@/components/ui/empty-state'
import ShareButton from '@/components/ui/share-button'
import PageHeader from '@/components/ui/page-header'
import CarSpecifications from '@/components/cars/car-specifications'

export default function CarDetailPage() {
  const params = useParams()
  const { user } = useAuth()

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
    return <LoadingSpinner fullScreen message='Loading car details...' />
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
            className='text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer'
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

      <PageHeader
        title={car.name}
        subtitle={`by @${profile?.username || params.username || 'Unknown'}`}
        backHref={user ? '/dashboard' : undefined}
        actions={
          <div className='flex items-center space-x-4'>
            <ShareButton
              url={window.location.href}
              title={`${car.name} by @${profile?.username || params.username}`}
              text={`Check out this ${car.year} ${car.make} ${car.model}!`}
              variant='outline'
            />
            {user && car && user.id === car.user_id && (
              <Link
                href={`/${profile?.username}/${car.id}/edit`}
                className='inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer'
              >
                <Edit className='w-4 h-4 mr-2' />
                Edit
              </Link>
            )}
          </div>
        }
      />

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Photos Section */}
            <div className='lg:col-span-2'>
              <h2 className='text-2xl font-bold text-foreground mb-6'>
                Photos
              </h2>

              {/* Category Filter */}
              {car.photos && car.photos.length > 0 && (
                <div className='mb-6'>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCategory === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
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
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
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
                            selectedPhoto === index ? 'ring-2 ring-primary' : ''
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
                <EmptyState
                  icon={Image}
                  title={
                    car.photos && car.photos.length > 0
                      ? 'Photos Corrupted'
                      : 'No photos yet'
                  }
                  description={
                    car.photos && car.photos.length > 0
                      ? 'The existing photos appear to be corrupted. Please re-upload them in the edit page.'
                      : selectedCategory === 'all'
                      ? 'No photos have been uploaded for this car.'
                      : `No photos in the ${selectedCategory} category.`
                  }
                  variant='muted'
                  action={
                    car.photos && car.photos.length > 0 ? (
                      <Link
                        href={`/${
                          profile?.username || params.username
                        }/${encodeURIComponent(car.name)}/edit`}
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring cursor-pointer'
                      >
                        Edit Car & Re-upload Photos
                      </Link>
                    ) : undefined
                  }
                />
              )}
            </div>

            {/* Specifications Section */}
            <div className='lg:col-span-1'>
              <CarSpecifications car={car} />
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
              className='absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer'
            >
              <X className='w-6 h-6' />
            </button>

            {/* Navigation Buttons */}
            {sortedPhotos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto('prev')}
                  className='absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer'
                >
                  <ChevronLeft className='w-8 h-8' />
                </button>
                <button
                  onClick={() => navigatePhoto('next')}
                  className='absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer'
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
