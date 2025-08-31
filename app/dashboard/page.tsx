'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { getCarsByUserClient } from '@/lib/database/cars-client'
import { getUserCarSlots } from '@/lib/database/premium-client'
import { canUserCreateCarSimpleClient } from '@/lib/database/cars-client'
import { Profile, Car } from '@/lib/types/database'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/protected-route'
import {
  Plus,
  Info,
  Heart,
  Crown,
  Eye,
  Share2,
  MessageCircle,
  AlertCircle,
} from 'lucide-react'
import { MainNavbar } from '@/components/navbar'
import LoadingSpinner from '@/components/common/loading-spinner'
import EmptyState from '@/components/common/empty-state'
import CarCard from '@/components/cars/car-card'
import { toast } from 'sonner'
import { syncCarCommentCount } from '@/lib/database/cars-client'
import StatsCard, { DashboardStat } from '@/components/dashboard/stats-card'
import PremiumUpgradeBanner from '@/components/dashboard/premium-upgrade-banner'
import Grid from '@/components/common/grid'
import PageLayout from '@/components/layout/page-layout'
import PageHeader from '@/components/layout/page-header'

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

  // Function to recalculate stats
  const recalculateStats = (currentCars: Car[]) => {
    const totalLikes = currentCars.reduce(
      (sum, car) => sum + (car.like_count || 0),
      0
    )
    const totalViews = currentCars.reduce(
      (sum, car) => sum + (car.view_count || 0),
      0
    )
    const totalShares = currentCars.reduce(
      (sum, car) => sum + (car.share_count || 0),
      0
    )
    const totalComments = currentCars.reduce(
      (sum, car) => sum + (car.comment_count || 0),
      0
    )

    setStats({
      totalLikes,
      totalViews,
      totalShares,
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
          recalculateStats(refreshedCars)
        }
      } catch (error) {}
    }
  }

  // Handle sharing cars
  const handleShare = async (car: Car) => {
    const carUrl = `${window.location.origin}/${profile?.username}/${car.url_slug}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${car.name} by ${profile?.username}`,
          text: `Check out this amazing car: ${car.name}`,
          url: carUrl,
        })
      } else {
        await navigator.clipboard.writeText(carUrl)
        toast.success('Car link copied to clipboard!')
      }
    } catch (error) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(carUrl)
        toast.success('Car link copied to clipboard!')
      } catch (clipboardError) {
        toast.error('Failed to copy link')
      }
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
          recalculateStats(carsData)
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

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLayout user={user} showCreateButton={false}>
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
      <PageLayout user={user} showCreateButton={false}>
        <PageHeader
          title='Dashboard'
          description='Manage your cars and track your performance'
        />

        {/* Stats Overview */}
        <Grid
          mobileCols={2}
          cols={4}
          mobileGap='sm'
          gap='md'
          className='mb-6 md:mb-8'
        >
          {dashboardStats.map((stat, index) => (
            <StatsCard key={stat.label} stat={stat} />
          ))}
        </Grid>

        {/* Buy More Slots Section for Non-Premium Users */}
        {!carSlots.isPremium && cars.length >= carSlots.maxAllowedCars && (
          <PremiumUpgradeBanner
            currentCars={cars.length}
            maxAllowedCars={carSlots.maxAllowedCars}
            className='mb-6'
          />
        )}

        {/* Cars Grid */}
        <div>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-foreground'>Your Cars</h2>
            {canCreateCar ? (
              <Link
                href='/create'
                className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring cursor-pointer'
              >
                <Plus className='w-5 h-5 mr-2' />
                Add New Car
              </Link>
            ) : (
              <Link
                href='/buy-car-slot'
                className='inline-flex items-center px-4 py-2 border border-orange-200 dark:border-orange-800 text-sm font-medium rounded-md shadow-sm text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors cursor-pointer'
              >
                <AlertCircle className='w-4 h-4 mr-2' />
                Car Limit Reached
              </Link>
            )}
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
                    router.push(`/${profile?.username}/${car.url_slug}/edit`)
                  }
                  onShare={car => handleShare(car)}
                  onLikeChange={handleLikeChange}
                />
              ))}
            </Grid>
          )}
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
