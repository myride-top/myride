'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProfileByUsernameClient } from '@/lib/database/profiles-client'
import { getCarsByUserClient } from '@/lib/database/cars-client'
import { Profile, Car } from '@/lib/types/database'
import { useAuth } from '@/lib/context/auth-context'
import { MainNavbar } from '@/components/navbar/main-navbar'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { EmptyState } from '@/components/common/empty-state'
import { CarCard } from '@/components/cars/car-card'
import { Grid } from '@/components/common/grid'
import { UserAvatar } from '@/components/common/user-avatar'
import { QRCodeModal } from '@/components/common/qr-code-modal'
import { generateQRCodeWithLogo } from '@/lib/utils/qr-code-with-logo'
import { Crown, Share2, MapPin, Instagram, Youtube, Globe, Lock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NationalityFlag } from '@/components/common/nationality-flag'
export default function ProfileGaragePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showQRCode, setShowQRCode] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  const username = params.username as string
  const isOwner = user?.id === profile?.id
  const isPremium = profile?.is_premium || false

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get profile by username
        const profileData = await getProfileByUsernameClient(username)

        if (!profileData) {
          setError('Profile not found')
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Get all cars for this user
        const carsData = await getCarsByUserClient(profileData.id)

        if (carsData === null) {
          setError('Failed to load cars')
        } else {
          setCars(carsData)
        }
      } catch (err) {
        console.error('Error loading profile data:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      loadProfileData()
    }
  }, [username])

  const handleLikeChange = async (carId: string, newLikeCount: number) => {
    // Update local state immediately for UI responsiveness
    setCars(prevCars =>
      prevCars.map(car =>
        car.id === carId ? { ...car, like_count: newLikeCount } : car
      )
    )

    // Refresh car data from database to ensure accuracy
    if (profile) {
      try {
        const refreshedCars = await getCarsByUserClient(profile.id)
        if (refreshedCars) {
          setCars(refreshedCars)
        }
      } catch {}
    }
  }

  const handleShareGarage = async () => {
    if (!isPremium) {
      toast.error('Premium feature: Upgrade to share your entire garage')
      return
    }

    if (!qrCodeDataUrl) {
      setIsGeneratingQR(true)
      try {
        const shareUrl = `${window.location.origin}/u/${username}`
        // Use user's avatar if available, otherwise fall back to icon
        const logoUrl = profile?.avatar_url || '/icon.jpg'
        const dataUrl = await generateQRCodeWithLogo(shareUrl, logoUrl, {
          width: 300,
          margin: 2,
          logoSize: 80,
        })
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
    return (
      <>
        <MainNavbar showCreateButton={false} />
        <div className='flex items-center justify-center min-h-[calc(100vh-6rem)]'>
          <LoadingSpinner message='Loading garage...' />
        </div>
      </>
    )
  }

  if (error || !profile) {
    return (
      <>
        <MainNavbar showCreateButton={false} />
        <div className='min-h-screen flex items-center justify-center bg-background'>
          <EmptyState
            title='Profile not found'
            description={error || 'The requested profile could not be found.'}
          />
        </div>
      </>
    )
  }

  // Block access to non-premium profiles - only premium users can have public profiles
  if (!isPremium) {
    return (
      <>
        <MainNavbar showCreateButton={false} />
        <div className='min-h-screen flex items-center justify-center bg-background'>
          <div className='max-w-md mx-auto px-4'>
            <div className='text-center py-12'>
              <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6'>
                <Lock className='h-8 w-8 text-primary' />
              </div>
              <h2 className='text-3xl font-bold mb-2 text-foreground'>
                Profile Not Available
              </h2>
              <p className='text-lg text-muted-foreground mb-6'>
                {isOwner
                  ? "This profile is private. Upgrade to premium to make your profile public and shareable."
                  : "This profile is only available to premium members. This user needs to upgrade to premium to make their profile public."}
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                {isOwner ? (
                  <Link
                    href='/premium'
                    className='inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
                  >
                    <Crown className='w-4 h-4 mr-2' />
                    Upgrade to Premium
                  </Link>
                ) : (
                  <button
                    onClick={() => router.push('/browse')}
                    className='inline-flex items-center justify-center px-4 py-2 border border-border rounded-md text-foreground bg-card hover:bg-accent transition-colors'
                  >
                    Browse Cars
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const shareUrl = `${window.location.origin}/u/${username}`

  return (
    <>
      <MainNavbar showCreateButton={false} />
      <div className='min-h-screen bg-background'>
        {/* Profile Header */}
        <div className='bg-card border-b border-border'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-4 mb-3'>
                  <UserAvatar
                    avatarUrl={profile.avatar_url}
                    username={profile.username}
                    size='lg'
                    className='w-20 h-20 sm:w-24 sm:h-24'
                  />
                  <div>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
                        {profile.full_name || `@${profile.username}`}
                      </h1>
                      {isPremium && (
                        <Crown className='w-5 h-5 sm:w-6 sm:h-6 text-yellow-500' />
                      )}
                      {profile.nationality && (
                        <NationalityFlag
                          nationality={profile.nationality}
                          size='lg'
                        />
                      )}
                    </div>
                    <p className='text-muted-foreground mt-1'>
                      @{profile.username}
                    </p>
                    <div className='flex items-center gap-3 mt-2'>
                      {profile.location && isPremium && (
                        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                          <MapPin className='w-4 h-4' />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {cars.length > 0 && (
                        <p className='text-sm text-muted-foreground'>
                          {cars.length} {cars.length === 1 ? 'car' : 'cars'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Compact Bio and Garage Description */}
                {isPremium && (profile.garage_description || profile.bio) && (
                  <div className='mt-4 space-y-2'>
                    {profile.garage_description && (
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {profile.garage_description}
                      </p>
                    )}
                    {profile.bio && (
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {profile.bio}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Share Button and Social Links - Only show if user is premium */}
              {isPremium && (
                <div className='flex items-center gap-2'>
                  {/* Social Links */}
                  {(profile.instagram_handle ||
                    profile.website_url ||
                    profile.youtube_channel) && (
                    <div className='flex items-center gap-2'>
                      {profile.instagram_handle && (
                        <Link
                          href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity cursor-pointer'
                          title={`@${profile.instagram_handle.replace('@', '')}`}
                        >
                          <Instagram className='w-4 h-4' />
                        </Link>
                      )}
                      {profile.youtube_channel && (
                        <Link
                          href={
                            profile.youtube_channel.startsWith('http')
                              ? profile.youtube_channel
                              : `https://youtube.com/${profile.youtube_channel}`
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer'
                          title='YouTube'
                        >
                          <Youtube className='w-4 h-4' />
                        </Link>
                      )}
                      {profile.website_url && (
                        <Link
                          href={profile.website_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border text-foreground hover:bg-accent transition-colors cursor-pointer'
                          title='Website'
                        >
                          <Globe className='w-4 h-4' />
                        </Link>
                      )}
                    </div>
                  )}
                  {/* Share Button */}
                  <button
                    onClick={handleShareGarage}
                    disabled={isGeneratingQR}
                    className='inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Share garage'
                  >
                    {isGeneratingQR ? (
                      <>
                        <div className='w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Share2 className='w-4 h-4 mr-2' />
                        Share
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          {cars.length === 0 ? (
            <EmptyState
              title='No cars yet'
              description={`${profile.full_name || profile.username} hasn't added any cars to their garage yet.`}
            />
          ) : (
            <Grid cols={3} gap='md'>
              {cars.map(car => (
                <CarCard
                  key={car.id}
                  car={car}
                  profile={profile}
                  isOwner={isOwner}
                  showActions={true}
                  onLikeChange={handleLikeChange}
                />
              ))}
            </Grid>
          )}
        </main>
      </div>

      {/* QR Code Modal for Garage Sharing */}
      {isPremium && (
        <QRCodeModal
          isOpen={showQRCode}
          onClose={() => setShowQRCode(false)}
          qrCodeDataUrl={qrCodeDataUrl}
          car={{
            name: `${profile.full_name || profile.username}'s Garage`,
            year: new Date().getFullYear(),
            make: 'MyRide',
            model: 'Garage Collection',
          }}
          profile={{
            username: profile.username,
            avatar_url: profile.avatar_url,
            full_name: profile.full_name,
          }}
          currentUrl={shareUrl}
        />
      )}
    </>
  )
}

