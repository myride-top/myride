'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getCarByUrlSlugClient } from '@/lib/database/cars-client'
import {
  getProfileByUsernameClient,
  getProfileByUserIdClient,
} from '@/lib/database/profiles-client'
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
  Heart,
  Share,
  Share2,
  ChevronLeft,
  ChevronRight,
  Crown,
} from 'lucide-react'
import {
  likeCarClient,
  unlikeCarClient,
  hasUserLikedCarClient,
  getCarLikeCountClient,
} from '@/lib/database/cars-client'
import { MainNavbar } from '@/components/navbar/main-navbar'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { EmptyState } from '@/components/common/empty-state'
import { CarSpecifications } from '@/components/cars/car-specifications'
import { QRCodeModal } from '@/components/common/qr-code-modal'
import { FullscreenPhotoViewer } from '@/components/photos/fullscreen-photo-viewer'
import { UserAvatar } from '@/components/common/user-avatar'
import { useRouter } from 'next/navigation'
import { useCarAnalytics } from '@/lib/hooks/use-car-analytics'
import { CarComments } from '@/components/cars/car-comments'
import { BackButton } from '@/components/common/back-button'

export default function CarDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const router = useRouter()

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
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  // Track car analytics (views, shares) - always call hook to maintain order
  const { trackShare } = useCarAnalytics(car?.id || '', car?.user_id || '')

  useEffect(() => {
    const loadCarData = async () => {
      try {
        // First, get the car by URL slug (public access)
        const carData = await getCarByUrlSlugClient(params.car as string)

        if (!carData) {
          setError('Car not found')
          setLoading(false)
          return
        }

        // Set the car data immediately
        setCar(carData)

        // Get the real-time like count from car_likes table
        try {
          const realLikeCount = await getCarLikeCountClient(carData.id)
          setLikeCount(realLikeCount)
        } catch {
          // Fallback to the like_count field from cars table
          setLikeCount(carData.like_count || 0)
        }

        // Load profile - prioritize current user's profile if they own this car
        try {
          let loadedProfile: Profile | null = null

          // If signed in user owns this car, try to fetch their profile first
          if (user && user.id === carData.user_id) {
            loadedProfile = await getProfileByUserIdClient(user.id)
          }

          // If not found yet, try by car owner's user_id
          if (!loadedProfile) {
            loadedProfile = await getProfileByUserIdClient(carData.user_id)
          }

          // If still not found, try by username
          if (!loadedProfile) {
            loadedProfile = await getProfileByUsernameClient(
              params.username as string
            )
          }

          // If we have a profile, use it
          if (loadedProfile) {
            setProfile(loadedProfile)
          } else {
            // Only create fallback if we really couldn't find anything
            setProfile({
              id: carData.user_id,
              username: params.username as string,
              full_name: null,
              avatar_url: null,
              unit_preference: 'metric' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_premium: false,
              premium_purchased_at: null,
              car_slots_purchased: 0,
              stripe_customer_id: null,
              stripe_subscription_id: null,
              total_supported_amount: 0,
              is_supporter: false,
            })
          }
        } catch {
          // If profile fetch fails, create a fallback
          setProfile({
            id: carData.user_id,
            username: params.username as string,
            full_name: null,
            avatar_url: null,
            unit_preference: 'metric' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_premium: false,
            premium_purchased_at: null,
            car_slots_purchased: 0,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            total_supported_amount: 0,
            is_supporter: false,
          })
        }
      } catch {
        setError('Failed to load car data')
      } finally {
        setLoading(false)
      }
    }

    if (params.car && params.username) {
      loadCarData()
    }
  }, [params.car, params.username, user])

  // Check if current user has liked this car
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user && car && user.id !== car.user_id) {
        try {
          const liked = await hasUserLikedCarClient(car.id, user.id)
          setIsLiked(liked)
        } catch {}
      }
    }

    checkLikeStatus()
  }, [user, car])

  // Helper function to get photo URL and category
  const getPhotoInfo = (photo: string | CarPhoto) => {
    if (typeof photo === 'string') {
      // Handle old string format
      return { url: photo, category: 'other' as const, description: '' }
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
        description: photo.description || '',
      }
    }

    // Fallback
    return { url: '', category: 'other' as const, description: '' }
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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sortedPhotos.length <= 1) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setSelectedPhoto(prev =>
          prev === 0 ? sortedPhotos.length - 1 : prev - 1
        )
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setSelectedPhoto(prev =>
          prev === sortedPhotos.length - 1 ? 0 : prev + 1
        )
      }
    }

    // Add event listener when component mounts
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [sortedPhotos.length])

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
        setIsLiked(false)
        toast.success('Car unliked')
      } else {
        await likeCarClient(car.id, user.id)
        setIsLiked(true)
        toast.success('Car liked!')
      }

      // Get the real-time like count from car_likes table immediately
      try {
        const newLikeCount = await getCarLikeCountClient(car.id)
        setLikeCount(newLikeCount)
      } catch {
        // Fallback to local state update
        if (isLiked) {
          setLikeCount(prev => Math.max(0, prev - 1))
        } else {
          setLikeCount(prev => prev + 1)
        }
      }
    } catch {
      toast.error('Failed to update like status')
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleQRCode = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!qrCodeDataUrl) {
      setIsGeneratingQR(true)
      try {
        // Dynamic import to avoid SSR issues
        const { generateQRCodeWithLogo } = await import(
          '@/lib/utils/qr-code-with-logo'
        )
        const dataUrl = await generateQRCodeWithLogo(
          window.location.href,
          '/icon.jpg',
          {
            width: 300,
            margin: 2,
            logoSize: 80,
          }
        )
        setQrCodeDataUrl(dataUrl)
        setShowQRCode(true)
      } catch {
        toast.error('Failed to generate QR code')
      } finally {
        setIsGeneratingQR(false)
      }
    } else {
      setShowQRCode(true)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message='Loading car details...' />
  }

  if (error || !car) {
    return (
      <div className='min-h-screen bg-background'>
        <MainNavbar showCreateButton={true} />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
          <div className='flex items-center mb-6'>
            <button
              onClick={() => router.back()}
              className='mr-4 text-foreground hover:text-foreground/80 cursor-pointer'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>
          </div>

          <div className='max-w-2xl mx-auto text-center'>
            <div className='mb-8'>
              <div className='w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center'>
                <svg
                  className='w-12 h-12 text-muted-foreground'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33M15 9.75a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </div>

              <h1 className='text-4xl font-bold text-foreground mb-4'>
                Car Not Found
              </h1>

              <p className='text-lg text-muted-foreground mb-8 max-w-md mx-auto'>
                {error === 'Car not found'
                  ? "We couldn't find the car you're looking for. It might have been moved, deleted, or you entered the wrong URL."
                  : error ||
                    'Something went wrong while loading the car details.'}
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href={user ? '/dashboard' : '/'}
                className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer'
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
                    d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                  />
                </svg>
                {user ? 'Go to Dashboard' : 'Go Home'}
              </Link>

              <Link
                href='/browse'
                className='inline-flex items-center px-6 py-3 border border-input text-base font-medium rounded-md shadow-sm text-foreground bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer'
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
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                Browse Cars
              </Link>
            </div>

            {error === 'Car not found' && (
              <div className='mt-8 p-4 bg-muted/50 rounded-lg'>
                <p className='text-sm text-muted-foreground'>
                  <strong>Tip:</strong> Make sure the URL is correct and the car
                  hasn&apos;t been deleted by its owner.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <MainNavbar showCreateButton={true} />

      {/* Custom Header with Back Button and Actions - Matching PageHeaderWithBack Style */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='mr-4'>
              <BackButton
                onClick={() => router.back()}
                variant='ghost'
                size='sm'
                showText={false}
              />
            </div>

            <div className='flex-1'>
              <h1 className='text-3xl md:text-4xl font-bold text-foreground'>
                {car.name}
              </h1>
              <div className='flex items-center gap-2 mt-2 text-lg text-muted-foreground'>
                <span>by</span>
                <UserAvatar
                  avatarUrl={profile?.avatar_url || undefined}
                  username={profile?.username || (params.username as string)}
                  size='sm'
                />
                <span className='flex items-center gap-1'>
                  {profile?.is_premium && (
                    <Crown className='w-4 h-4 text-yellow-500' />
                  )}
                  @{profile?.username || params.username || 'Unknown'}
                </span>
              </div>

              {/* Mobile Action Buttons - Under profile name */}
              <div className='flex items-center space-x-2 mt-4 lg:hidden'>
                {/* Show like count for all users - clickable if user is signed in and doesn't own the car */}
                {user && car && user.id !== car.user_id ? (
                  <button
                    onClick={handleLike}
                    disabled={isLikeLoading}
                    className='flex items-center space-x-2 px-3 py-2 bg-muted rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer'
                    title={isLiked ? 'Unlike car' : 'Like car'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isLiked ? 'fill-current text-red-500' : ''
                      }`}
                    />
                    <span>
                      {likeCount > 0
                        ? `${likeCount} like${likeCount !== 1 ? 's' : ''}`
                        : 'Like'}
                    </span>
                  </button>
                ) : (
                  likeCount > 0 && (
                    <div className='flex items-center space-x-2 px-3 py-2 bg-muted rounded-md text-sm font-medium text-muted-foreground'>
                      <Heart className='w-4 h-4' />
                      <span>
                        {likeCount} like{likeCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )
                )}

                <button
                  onClick={handleQRCode}
                  disabled={isGeneratingQR}
                  className='inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                  title={`Share ${car.name} via QR Code`}
                >
                  {isGeneratingQR ? (
                    <div className='w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  ) : (
                    <Share2 className='w-4 h-4 mr-2' />
                  )}
                  {isGeneratingQR ? 'Generating...' : 'Share'}
                </button>
                {user && car && user.id === car.user_id && (
                  <Link
                    href={`/${profile?.username}/${car.url_slug}/edit`}
                    className='inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer'
                  >
                    <Edit className='w-4 h-4 mr-2' />
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Action Buttons - Right side (unchanged) */}
          <div className='hidden lg:flex items-center space-x-4'>
            {/* Show like count for all users - clickable if user is signed in and doesn't own the car */}
            {user && car && user.id !== car.user_id ? (
              <button
                onClick={handleLike}
                disabled={isLikeLoading}
                className='flex items-center space-x-2 px-3 py-2 bg-muted rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer'
                title={isLiked ? 'Unlike car' : 'Like car'}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked ? 'fill-current text-red-500' : ''
                  }`}
                />
                <span>
                  {likeCount > 0
                    ? `${likeCount} like${likeCount !== 1 ? 's' : ''}`
                    : 'Like'}
                </span>
              </button>
            ) : (
              likeCount > 0 && (
                <div className='flex items-center space-x-2 px-3 py-2 bg-muted rounded-md text-sm font-medium text-muted-foreground'>
                  <Heart className='w-4 h-4' />
                  <span>
                    {likeCount} like{likeCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )
            )}

            <button
              onClick={handleQRCode}
              disabled={isGeneratingQR}
              className='inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              title={`Share ${car.name} via QR Code`}
            >
              {isGeneratingQR ? (
                <div className='w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
              ) : (
                <Share2 className='w-4 h-4 mr-2' />
              )}
              {isGeneratingQR ? 'Generating...' : 'Share'}
            </button>
            {user && car && user.id === car.user_id && (
              <Link
                href={`/${profile?.username}/${car.url_slug}/edit`}
                className='inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer'
              >
                <Edit className='w-4 h-4 mr-2' />
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>

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
                    <div className='relative'>
                      <img
                        src={getPhotoInfo(sortedPhotos[selectedPhoto]).url}
                        alt={`${car.name} - ${
                          getPhotoInfo(sortedPhotos[selectedPhoto]).category
                        } ${selectedPhoto + 1}`}
                        className='w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity'
                        onClick={() => openFullscreenPhoto(selectedPhoto)}
                      />

                      {/* Navigation Arrows */}
                      {sortedPhotos.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setSelectedPhoto(prev =>
                                prev > 0 ? prev - 1 : sortedPhotos.length - 1
                              )
                            }
                            className='absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors cursor-pointer'
                          >
                            <ChevronLeft className='w-5 h-5' />
                          </button>

                          <button
                            onClick={() =>
                              setSelectedPhoto(prev =>
                                prev < sortedPhotos.length - 1 ? prev + 1 : 0
                              )
                            }
                            className='absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors cursor-pointer'
                          >
                            <ChevronRight className='w-5 h-5' />
                          </button>

                          {/* Photo Counter - Overlay on bottom right of image */}
                          <div className='absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm'>
                            {selectedPhoto + 1} / {sortedPhotos.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Photo Description */}
                    {getPhotoInfo(sortedPhotos[selectedPhoto]).description && (
                      <div className='mt-3 p-3 bg-muted rounded-lg'>
                        <p className='text-sm text-muted-foreground'>
                          {
                            getPhotoInfo(sortedPhotos[selectedPhoto])
                              .description
                          }
                        </p>
                      </div>
                    )}
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
                  icon={Share}
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

              {/* Comments Section - Desktop: Under photos in left column */}
              <div className='hidden lg:block mt-8'>
                <CarComments
                  carId={car.id}
                  carOwnerId={car.user_id}
                  ownerProfile={profile}
                />
              </div>
            </div>

            {/* Specifications Section */}
            <div className='lg:col-span-1 order-last'>
              <CarSpecifications car={car} />
            </div>
          </div>

          {/* Comments Section - Mobile: Full width below everything */}
          <div className='lg:hidden mt-8'>
            <CarComments
              carId={car.id}
              carOwnerId={car.user_id}
              ownerProfile={profile}
            />
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

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        qrCodeDataUrl={qrCodeDataUrl}
        car={car}
        profile={profile}
        currentUrl={window.location.href}
        onShare={() => {
          // Track share analytics when QR code modal opens
          trackShare('other')
        }}
      />
    </div>
  )
}
