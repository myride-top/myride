'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProfileByUsernameClient } from '@/lib/database/profiles-client'
import { getCarsByUserClient } from '@/lib/database/cars-client'
import { Profile, Car } from '@/lib/types/database'
import { useAuth } from '@/lib/context/auth-context'
import { PageLayout } from '@/components/layout/page-layout'
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
import { Button } from '@/components/ui/button'
import { NationalityFlag } from '@/components/common/nationality-flag'
import { useI18n } from '@/lib/i18n/provider'
export default function ProfileGaragePage() {
  const { t } = useI18n()
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
          setError(t('garage.error.profileNotFound', 'Profile not found'))
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Get all cars for this user
        const carsData = await getCarsByUserClient(profileData.id)

        if (carsData === null) {
          setError(t('browse.error.loadFailed', 'Failed to load cars. Please try again later.'))
        } else {
          setCars(carsData)
        }
      } catch (err) {
        console.error('Error loading profile data:', err)
        setError(t('garage.error.loadFailed', 'Failed to load profile'))
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      loadProfileData()
    }
  }, [t, username])

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
      toast.error(
        t(
          'garage.toast.premiumRequired',
          'Premium feature: Upgrade to share your entire garage'
        )
      )
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
        toast.error(t('map.toast.qrFailed', 'Failed to generate QR code'))
      } finally {
        setIsGeneratingQR(false)
      }
    } else {
      setShowQRCode(true)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className='flex items-center justify-center min-h-[50vh]'>
          <LoadingSpinner message={t('garage.loading', 'Loading garage...')} />
        </div>
      </PageLayout>
    )
  }

  if (error || !profile) {
    return (
      <PageLayout>
        <EmptyState
          title={t('garage.profileNotFound', 'Profile not found')}
          description={
            error ||
            t(
              'garage.profileNotFoundDescription',
              'The requested profile could not be found.'
            )
          }
        />
      </PageLayout>
    )
  }

  // Block access to non-premium profiles - only premium users can have public profiles
  if (!isPremium) {
    return (
      <PageLayout>
        <div className='max-w-md mx-auto'>
          <EmptyState
            size='lg'
            icon={Lock}
            title={t('garage.private.title', 'Profile Not Available')}
            description={
              isOwner
                ? t(
                    'garage.private.owner',
                    'This profile is private. Upgrade to premium to make your profile public and shareable.'
                  )
                : t(
                    'garage.private.visitor',
                    'This profile is only available to premium members. This user needs to upgrade to premium to make their profile public.'
                  )
            }
            action={
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                {isOwner ? (
                  <Button asChild>
                    <Link href='/premium'>
                      <Crown className='w-4 h-4' />
                      {t('garage.private.upgrade', 'Upgrade to Premium')}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant='outline'
                    onClick={() => router.push('/browse')}
                  >
                    {t('nav.browseCars', 'Browse Cars')}
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </PageLayout>
    )
  }

  const shareUrl = `${window.location.origin}/u/${username}`

  return (
    <PageLayout bare animate={false} maxWidth='full'>
      <div className='min-h-screen bg-background'>
        {/* Profile Header */}
        <div className='bg-card border-b border-border'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-8 sm:pt-10'>
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
                          {cars.length}{' '}
                          {cars.length === 1
                            ? t('garage.carSingular', 'car')
                            : t('garage.carPlural', 'cars')}
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
          className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-chart-4 to-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer'
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
                          title={t('garage.social.youtube', 'YouTube')}
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
                          title={t('garage.social.website', 'Website')}
                        >
                          <Globe className='w-4 h-4' />
                        </Link>
                      )}
                    </div>
                  )}
                  {/* Share Button */}
                  <Button
                    onClick={handleShareGarage}
                    disabled={isGeneratingQR}
                    variant='outline'
                    size='sm'
                    title={t('dashboard.shareGarage', 'Share garage')}
                  >
                    {isGeneratingQR ? (
                      <>
                        <div className='w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                        {t('common.generating', 'Generating...')}
                      </>
                    ) : (
                      <>
                        <Share2 className='w-4 h-4' />
                        {t('common.share', 'Share')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          {cars.length === 0 ? (
            <EmptyState
              title={t('garage.empty.title', 'No cars yet')}
              description={t(
                'garage.empty.description',
                `${profile.full_name || profile.username} hasn't added any cars to their garage yet.`
              )}
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
    </PageLayout>
  )
}
