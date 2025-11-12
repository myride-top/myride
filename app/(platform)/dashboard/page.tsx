'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { getCarsByUserClient } from '@/lib/database/cars-client'
import { getUserCarSlots } from '@/lib/database/premium-client'
import { canUserCreateCarSimpleClient } from '@/lib/database/cars-client'
import { getUserEventStatsClient } from '@/lib/database/events-client'
import { Profile, Car } from '@/lib/types/database'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/auth/protected-route'
import {
  Plus,
  Info,
  Heart,
  Eye,
  Share2,
  MessageCircle,
  AlertCircle,
  BarChart3,
  Lock,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { EmptyState } from '@/components/common/empty-state'
import { CarCard } from '@/components/cars/car-card'
import { toast } from 'sonner'
import { StatsCard } from '@/components/common/stats-card'
import { DashboardStat } from '@/components/common/stats-card'
import { PremiumUpgradeBanner } from '@/components/dashboard/premium-upgrade-banner'
import { Grid } from '@/components/common/grid'
import { PageLayout } from '@/components/layout/page-layout'
import { PageHeader } from '@/components/layout/page-header'
import { QRCodeModal } from '@/components/common/qr-code-modal'
import { generateQRCodeWithLogo } from '@/lib/utils/qr-code-with-logo'
import { cn } from '@/lib/utils'
import { PremiumButton } from '@/components/common/premium-button'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalViews: 0,
    totalShares: 0,
    totalComments: 0,
  })
  const [carSlots, setCarSlots] = useState({
    currentCars: 0,
    maxAllowedCars: 1,
    purchasedSlots: 0,
    isPremium: false,
  })
  const [canCreateCar, setCanCreateCar] = useState(true)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showQRCode, setShowQRCode] = useState(false)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  // Function to recalculate stats
  const recalculateStats = async (currentCars: Car[], userId?: string) => {
    const totalLikes = currentCars.reduce(
      (sum, car) => sum + (car.like_count || 0),
      0
    )
    const totalCarViews = currentCars.reduce(
      (sum, car) => sum + (car.view_count || 0),
      0
    )
    const totalCarShares = currentCars.reduce(
      (sum, car) => sum + (car.share_count || 0),
      0
    )
    const totalComments = currentCars.reduce(
      (sum, car) => sum + (car.comment_count || 0),
      0
    )

    // Get event stats if userId is provided
    let eventViews = 0
    let eventShares = 0
    if (userId) {
      try {
        const eventStats = await getUserEventStatsClient(userId)
        eventViews = eventStats.views
        eventShares = eventStats.shares
      } catch (error) {
        console.error('Error fetching event stats:', error)
      }
    }

    setStats({
      totalLikes,
      totalViews: totalCarViews + eventViews,
      totalShares: totalCarShares + eventShares,
      totalComments,
    })
  }

  // Handle like changes
  const handleLikeChange = async (carId: string, newLikeCount: number) => {
    // Update local state immediately for UI responsiveness
    setCars(prevCars => {
      const updatedCars = prevCars.map(car =>
        car.id === carId ? { ...car, like_count: newLikeCount } : car
      )
      return updatedCars
    })

    // Refresh car data from database to ensure accuracy
    if (user) {
      try {
        const refreshedCars = await getCarsByUserClient(user.id)
        if (refreshedCars) {
          setCars(refreshedCars)
          // Recalculate stats with fresh data
          recalculateStats(refreshedCars, user.id)
        }
      } catch {}
    }
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Load profile and cars in parallel
        const [profileData, carsData, slotsData, canCreate] = await Promise.all(
          [
            getProfileByUserIdClient(user.id),
            getCarsByUserClient(user.id),
            getUserCarSlots(user.id),
            canUserCreateCarSimpleClient(user.id),
          ]
        )

        if (profileData) {
          setProfile(profileData)
        }

        if (carsData) {
          setCars(carsData)
          await recalculateStats(carsData, user.id)
        }

        if (slotsData) {
          setCarSlots(slotsData)
        }

        setCanCreateCar(canCreate)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const handleShareProfile = async () => {
    if (!carSlots.isPremium) {
      return
    }

    if (!profile?.username) {
      toast.error('Username not found')
      return
    }

    if (!qrCodeDataUrl) {
      setIsGeneratingQR(true)
      try {
        const shareUrl = `${window.location.origin}/u/${profile.username}`
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
      <ProtectedRoute>
        <PageLayout showCreateButton={false}>
          <div className='flex items-center justify-center min-h-[calc(100vh-6rem)]'>
            <LoadingSpinner message='Loading dashboard...' />
          </div>
        </PageLayout>
      </ProtectedRoute>
    )
  }

  // Prepare stats data
  const dashboardStats: DashboardStat[] = [
    {
      icon: Heart,
      label: 'Total Likes',
      value: stats.totalLikes,
      isPremium: true,
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: stats.totalViews,
      isPremium: carSlots.isPremium,
      premiumUpgradeHref: '/premium',
    },
    {
      icon: Share2,
      label: 'Total Shares',
      value: stats.totalShares,
      isPremium: carSlots.isPremium,
      premiumUpgradeHref: '/premium',
    },
    {
      icon: MessageCircle,
      label: 'Total Comments',
      value: stats.totalComments,
      isPremium: true,
    },
  ]

  return (
    <ProtectedRoute>
      <PageLayout showCreateButton={false}>
        <PageHeader
          title='Dashboard'
          description='Manage your cars and track your performance'
        />

        {/* Stats Overview - Only show if user has cars */}
        {cars.length > 0 && (
          <div className='mb-6 md:mb-8'>
            <div className='flex items-center justify-between mb-3 md:mb-4'>
              <h2 className='text-lg md:text-xl font-semibold text-foreground'>
                Performance Overview
              </h2>
              {carSlots.isPremium && (
                <Link
                  href='/analytics'
                  className='inline-flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors'
                >
                  <BarChart3 className='h-3 w-3 md:h-4 md:w-4' />
                  <span>Analytics</span>
                </Link>
              )}
            </div>
            <Grid mobileCols={4} cols={4} mobileGap='sm' gap='md'>
              {dashboardStats.map(stat => (
                <StatsCard key={stat.label} stat={stat} />
              ))}
            </Grid>
          </div>
        )}

        {/* Buy More Slots Section for Non-Premium Users */}
        {!carSlots.isPremium && cars.length >= carSlots.maxAllowedCars && (
          <PremiumUpgradeBanner
            currentCars={cars.length}
            maxAllowedCars={carSlots.maxAllowedCars}
            className='mb-6'
            variant={carSlots.maxAllowedCars - cars.length === 0 ? 'compact' : 'default'}
          />
        )}

        {/* Cars Grid */}
        <div>
          <div className='flex items-center justify-between gap-2 mb-6'>
            <h2 className='text-lg md:text-2xl font-bold text-foreground flex-shrink-0'>
              Your Cars
            </h2>
            <div className='flex items-center gap-2 flex-wrap'>
              {/* Share Profile Button - Only show if user has cars, locked for non-premium */}
              {profile?.username && cars.length > 0 && (
                <>
                  {carSlots.isPremium ? (
                    <button
                      onClick={handleShareProfile}
                      disabled={isGeneratingQR}
                      className={cn(
                        'inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 border border-border shadow-sm text-xs md:text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
                        isGeneratingQR && 'opacity-50 cursor-not-allowed'
                      )}
                      title='Share your garage'
                    >
                      {isGeneratingQR ? (
                        <>
                          <div className='w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                          <span className='hidden sm:inline'>Generating...</span>
                          <span className='sm:hidden'>...</span>
                        </>
                      ) : (
                        <>
                          <Share2 className='w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0' />
                          <span className='truncate'>Share Garage</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <PremiumButton
                      featureName='Share Garage'
                      featureDescription='Share your entire garage with a custom URL and QR code. Make your profile public and shareable.'
                    >
                      Share Garage
                    </PremiumButton>
                  )}
                </>
              )}
              {canCreateCar && (
                <Link
                  href='/create'
                  className='inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 border border-transparent shadow-sm text-xs md:text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring cursor-pointer whitespace-nowrap'
                >
                  <Plus className='w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 flex-shrink-0' />
                  <span className='truncate'>Add New Car</span>
                </Link>
              )}
            </div>
          </div>

          {cars.length === 0 ? (
            <EmptyState
              icon={Info}
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
          ) : (
            <Grid cols={3} gap='md'>
              {cars.map(car => (
                <CarCard
                  key={car.id}
                  car={car}
                  profile={profile}
                  isOwner={true}
                  onEdit={car =>
                    router.push(`/u/${profile?.username}/${car.url_slug}/edit`)
                  }
                  onLikeChange={handleLikeChange}
                />
              ))}
            </Grid>
          )}
        </div>

        {/* QR Code Modal for Garage Sharing */}
        {carSlots.isPremium && profile && (
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
            currentUrl={
              profile.username
                ? `${window.location.origin}/${profile.username}`
                : undefined
            }
          />
        )}
      </PageLayout>
    </ProtectedRoute>
  )
}
