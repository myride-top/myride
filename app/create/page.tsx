'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import {
  createCarClient,
  canUserCreateCarClient,
} from '@/lib/database/cars-client'
import { getUserCarSlots } from '@/lib/database/premium-client'
import ProtectedRoute from '@/components/auth/protected-route'
import { MainNavbar } from '@/components/navbar'
import { useUnitPreference } from '@/lib/context/unit-context'
import LoadingSpinner from '@/components/common/loading-spinner'
import CarForm from '@/components/forms/car-form'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { CarPhoto, PhotoCategory } from '@/lib/types/database'
import PageHeaderWithBack from '@/components/layout/page-header-with-back'
import CarLimitChecker from '@/components/create/car-limit-checker'
import ErrorAlert from '@/components/common/error-alert'
import Container from '@/components/common/container'

export default function CreateCarPage() {
  const { user } = useAuth()
  const { unitPreference, isLoading: unitLoading } = useUnitPreference()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [carSlots, setCarSlots] = useState<{
    currentCars: number
    maxAllowedCars: number
    purchasedSlots: number
    isPremium: boolean
  } | null>(null)
  const [photos, setPhotos] = useState<CarPhoto[]>([])
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null)

  // Photo handling functions
  const handlePhotoUploadComplete = async (photo: CarPhoto) => {
    setPhotos(prev => [...prev, photo])
    if (!mainPhotoUrl) {
      setMainPhotoUrl(photo.url)
    }
  }

  const handleBatchUploadComplete = async (newPhotos: CarPhoto[]) => {
    setPhotos(prev => [...prev, ...newPhotos])
    if (!mainPhotoUrl && newPhotos.length > 0) {
      setMainPhotoUrl(newPhotos[0].url)
    }
  }

  const handlePhotoCategoryChange = async (
    photoIndex: number,
    newCategory: PhotoCategory
  ) => {
    setPhotos(prev =>
      prev.map((photo, index) =>
        index === photoIndex ? { ...photo, category: newCategory } : photo
      )
    )
  }

  const handleSetMainPhoto = async (photoUrl: string) => {
    setMainPhotoUrl(photoUrl)
  }

  const handleDeletePhoto = async (photoUrl: string) => {
    setPhotos(prev => prev.filter(photo => photo.url !== photoUrl))
    if (mainPhotoUrl === photoUrl) {
      setMainPhotoUrl(
        photos.length > 1
          ? photos.find(p => p.url !== photoUrl)?.url || null
          : null
      )
    }
  }

  const handlePhotoDescriptionChange = async (
    photoIndex: number,
    newDescription: string
  ) => {
    setPhotos(prev =>
      prev.map((photo, index) =>
        index === photoIndex ? { ...photo, description: newDescription } : photo
      )
    )
  }

  const handlePhotoReorder = (reorderedPhotos: CarPhoto[]) => {
    setPhotos(reorderedPhotos)
    return Promise.resolve()
  }

  useEffect(() => {
    const checkCarLimit = async () => {
      if (user) {
        try {
          const canCreateCar = await canUserCreateCarClient(user.id)
          const slots = await getUserCarSlots(user.id)

          setCanCreate(canCreateCar)
          setCarSlots(slots)
        } catch (error) {
          setError('Failed to check car limit')
        } finally {
          setLoading(false)
        }
      }
    }

    checkCarLimit()
  }, [user])

  const handleSubmit = async (formData: {
    name: string
    url_slug?: string
    make: string
    model: string
    year: string
    description?: string
    build_story?: string
    build_start_date?: string
    total_build_cost?: string
    build_goals?: string[]
    inspiration?: string
    engine_displacement?: string
    engine_cylinders?: string
    engine_code?: string
    horsepower?: string
    torque?: string
    engine_type?: string
    fuel_type?: string
    transmission?: string
    drivetrain?: string
    zero_to_sixty?: string
    top_speed?: string
    quarter_mile?: string
    weight?: string
    power_to_weight?: string
    front_brakes?: string
    rear_brakes?: string
    wheel_size?: string
    wheel_brand?: string
    front_tire_size?: string
    rear_tire_size?: string
    front_suspension?: string
    rear_suspension?: string
    coilovers?: string
    sway_bars?: string
    paint_color?: string
    body_kit?: string
    interior_color?: string
    seats?: string
    instagram_handle?: string
    youtube_channel?: string
    website_url?: string
  }) => {
    if (!user) {
      setError('User not found')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const newCar = await createCarClient(
        {
          user_id: user.id,
          name: formData.name,
          url_slug: formData.url_slug || '',
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          description: formData.description || null,
          build_story: formData.build_story || null,
          project_status: 'completed',
          build_start_date: formData.build_start_date || null,
          total_build_cost: formData.total_build_cost
            ? parseFloat(formData.total_build_cost)
            : null,
          build_goals:
            formData.build_goals && formData.build_goals.length > 0
              ? formData.build_goals
              : null,
          inspiration: formData.inspiration || null,
          engine_displacement: formData.engine_displacement
            ? parseFloat(formData.engine_displacement)
            : null,
          engine_cylinders: formData.engine_cylinders
            ? parseInt(formData.engine_cylinders)
            : null,
          engine_code: formData.engine_code || null,
          horsepower: formData.horsepower
            ? parseInt(formData.horsepower)
            : null,
          torque: formData.torque ? parseFloat(formData.torque) : null,
          engine_type: formData.engine_type || null,
          fuel_type: formData.fuel_type || null,
          transmission: formData.transmission || null,
          drivetrain: formData.drivetrain || null,
          zero_to_sixty: formData.zero_to_sixty
            ? parseFloat(formData.zero_to_sixty)
            : null,
          top_speed: formData.top_speed
            ? parseFloat(formData.top_speed)
            : null,
          quarter_mile: formData.quarter_mile
            ? parseFloat(formData.quarter_mile)
            : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          power_to_weight: formData.power_to_weight
            ? parseFloat(formData.power_to_weight)
            : null,
          front_brakes: formData.front_brakes || null,
          rear_brakes: formData.rear_brakes || null,
          wheel_size: formData.wheel_size || null,
          wheel_brand: formData.wheel_brand || null,
          front_tire_size: formData.front_tire_size || null,
          rear_tire_size: formData.rear_tire_size || null,
          front_suspension: formData.front_suspension || null,
          rear_suspension: formData.rear_suspension || null,
          coilovers: formData.coilovers || null,
          sway_bars: formData.sway_bars || null,
          paint_color: formData.paint_color || null,
          body_kit: formData.body_kit || null,
          interior_color: formData.interior_color || null,
          seats: formData.seats || null,
          instagram_handle: formData.instagram_handle || null,
          youtube_channel: formData.youtube_channel || null,
          website_url: formData.website_url || null,
          photos: photos,
          main_photo_url: mainPhotoUrl,
        },
        supabase
      )

      if (newCar) {
        toast.success('Car created successfully!')
        router.push(`/${user.user_metadata?.username || 'user'}/${newCar.url_slug}`)
      } else {
        setError('Failed to create car')
      }
    } catch (error) {
      console.error('Error creating car:', error)
      setError('Failed to create car. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (loading || unitLoading) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-background'>
          <MainNavbar showCreateButton={true} />
          <div className='flex items-center justify-center min-h-screen'>
            <LoadingSpinner message='Loading...' />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!canCreate && carSlots) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-background'>
          <MainNavbar showCreateButton={true} />
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
            <CarLimitChecker
              currentCars={carSlots.currentCars}
              maxAllowedCars={carSlots.maxAllowedCars}
              isPremium={carSlots.isPremium}
              onUpgradeClick={() => router.push('/support')}
            />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        <MainNavbar showCreateButton={true} />

        <PageHeaderWithBack
          title="Create Your Car"
          description="Add a new car to your collection"
        />

        {/* Main Content */}
        <Container maxWidth="4xl" className="py-6">
          {/* Error Messages */}
          {error && (
            <ErrorAlert
              message={error}
              className="mb-6"
              onDismiss={() => setError(null)}
            />
          )}

          {/* Car Form */}
          <CarForm
            mode='create'
            onSubmit={handleSubmit}
            onPhotoUploadComplete={handlePhotoUploadComplete}
            onBatchUploadComplete={handleBatchUploadComplete}
            onPhotoCategoryChange={handlePhotoCategoryChange}
            onSetMainPhoto={handleSetMainPhoto}
            onDeletePhoto={handleDeletePhoto}
            onPhotoDescriptionChange={handlePhotoDescriptionChange}
            onPhotoReorder={handlePhotoReorder}
            unitPreference={unitPreference}
            saving={creating}
            existingPhotos={photos}
            mainPhotoUrl={mainPhotoUrl || undefined}
          />
        </Container>
      </div>
    </ProtectedRoute>
  )
}
