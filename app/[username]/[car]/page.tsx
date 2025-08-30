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
import { Edit, Image, ArrowLeft, Heart, User, Star } from 'lucide-react'
import {
  likeCarClient,
  unlikeCarClient,
  hasUserLikedCarClient,
} from '@/lib/database/cars-client'
import { MainNavbar, LandingNavbar } from '@/components/navbar'
import PageHeader from '@/components/layout/page-header'
import LoadingSpinner from '@/components/common/loading-spinner'
import EmptyState from '@/components/common/empty-state'
import ShareButton from '@/components/common/share-button'
import CarSpecifications from '@/components/cars/car-specifications'
import { FullscreenPhotoViewer } from '@/components/photos/fullscreen-photo-viewer'
import { hasUserSupportedCreator } from '@/lib/database/support-client'

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
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [hasSupported, setHasSupported] = useState(false)

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
          setLikeCount(carData.like_count || 0)
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

  // Check if current user has liked this car
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user && car && user.id !== car.user_id) {
        try {
          const liked = await hasUserLikedCarClient(car.id, user.id)
          setIsLiked(liked)
        } catch (error) {
          console.error('Error checking like status:', error)
        }
      }
    }

    checkLikeStatus()
  }, [user, car])

  // Check if current user has supported the creator
  useEffect(() => {
    const checkSupportStatus = async () => {
      if (user && profile && user.id !== profile.id) {
        try {
          const supported = await hasUserSupportedCreator(user.id, profile.id)
          setHasSupported(supported)
        } catch (error) {
          console.error('Error checking support status:', error)
        }
      }
    }

    checkSupportStatus()
  }, [user, profile])

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

  const handleLike = async () => {
    if (!user || !car) return

    if (user.id === car.user_id) {
      toast.error('You cannot like your own car')
      return
    }

    if (isLikeLoading) return

    setIsLikeLoading(true)
    try {
      if (isLiked) {
        await unlikeCarClient(car.id, user.id)
        setLikeCount(prev => prev - 1)
        setIsLiked(false)
        toast.success('Car unliked')
      } else {
        await likeCarClient(car.id, user.id)
        setLikeCount(prev => prev + 1)
        setIsLiked(true)
        toast.success('Car liked!')
      }
    } catch (error) {
      toast.error('Failed to update like status')
      console.error('Error updating like:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

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
      {user ? <MainNavbar /> : <LandingNavbar />}

      <PageHeader
        title={car.name}
        subtitle={
          <div className='flex items-center gap-0'>
            <span>by</span>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.username}'s avatar`}
                className='w-5 h-5 rounded-full object-cover ml-2.5 mr-1'
              />
            ) : (
              <div className='w-5 h-5 rounded-full bg-muted flex items-center justify-center ml-2.5 mr-1'>
                <User className='w-3 h-3 text-muted-foreground' />
              </div>
            )}
            <span>@{profile?.username || params.username || 'Unknown'}</span>
            {user && profile && user.id !== profile.id && hasSupported && (
              <div className='ml-2 flex items-center'>
                <div className='bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1'>
                  <Star className='w-3 h-3 fill-current' />
                  <span>Supporter</span>
                </div>
              </div>
            )}
          </div>
        }
        backHref={user ? '/dashboard' : undefined}
        actions={
          <div className='flex items-center space-x-4'>
            {/* Show like count for all users */}
            {likeCount > 0 && (
              <div className='flex items-center space-x-2 px-3 py-2 bg-muted rounded-md text-sm font-medium text-muted-foreground'>
                <Heart className='w-4 h-4' />
                <span>
                  {likeCount} like{likeCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Interactive like button for signed-in users who don't own the car */}
            {user && car && user.id !== car.user_id && (
              <button
                onClick={handleLike}
                disabled={isLikeLoading}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer ${
                  isLiked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                title={isLiked ? 'Unlike car' : 'Like car'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>
            )}

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
      <main className='max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8'>
        <div className='py-4 sm:py-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
            {/* Photos Section */}
            <div className='lg:col-span-2 order-first'>
              <h2 className='text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6'>
                Photos
              </h2>

              {/* Category Filter */}
              {car.photos && car.photos.length > 0 && (
                <div className='mb-4 sm:mb-6'>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
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
                          className={`px-3 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
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
                  <div className='relative'>
                    <img
                      src={getPhotoInfo(sortedPhotos[selectedPhoto]).url}
                      alt={`${car.name} - ${
                        getPhotoInfo(sortedPhotos[selectedPhoto]).category
                      } ${selectedPhoto + 1}`}
                      className='w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity'
                      onClick={() => openFullscreenPhoto(selectedPhoto)}
                    />
                  </div>

                  {/* Photo Thumbnails */}
                  {sortedPhotos.length > 1 && (
                    <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3'>
                      {sortedPhotos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPhoto(index)}
                          className={`aspect-square rounded-md overflow-hidden cursor-pointer transition-all ${
                            selectedPhoto === index
                              ? 'ring-2 ring-primary ring-offset-2'
                              : 'hover:opacity-80'
                          }`}
                        >
                          <img
                            src={getPhotoInfo(photo).url}
                            alt={`${car.name} ${getPhotoInfo(photo).category} ${
                              index + 1
                            }`}
                            className='w-full h-full object-cover'
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
            <div className='lg:col-span-1 order-last'>
              <CarSpecifications car={car} />
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Photo Viewer */}
      <FullscreenPhotoViewer
        isOpen={isPhotoDialogOpen}
        onClose={() => setIsPhotoDialogOpen(false)}
        photos={sortedPhotos.map(photo => getPhotoInfo(photo))}
        initialIndex={fullscreenPhotoIndex}
        carName={car.name}
      />
    </div>
  )
}
