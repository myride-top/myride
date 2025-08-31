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
    console.log('Photo uploaded:', photo)
    setPhotos(prev => [...prev, photo])
    if (!mainPhotoUrl) {
      setMainPhotoUrl(photo.url)
    }
  }

  const handleBatchUploadComplete = async (newPhotos: CarPhoto[]) => {
    console.log('Batch photos uploaded:', newPhotos)
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
          console.error('Error checking car limit:', error)
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
          top_speed: formData.top_speed ? parseFloat(formData.top_speed) : null,
          quarter_mile: formData.quarter_mile
            ? parseFloat(formData.quarter_mile)
            : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          power_to_weight: formData.power_to_weight || null,
          front_brakes: formData.front_brakes || null,
          rear_brakes: formData.rear_brakes || null,
          brake_rotors: null,
          brake_caliper_brand: null,
          brake_lines: null,
          wheel_size: formData.wheel_size || null,
          wheel_material: null,
          wheel_brand: formData.wheel_brand || null,
          wheel_offset: null,
          front_tire_size: formData.front_tire_size || null,
          front_tire_brand: null,
          front_tire_model: null,
          front_tire_pressure: null,
          rear_tire_size: formData.rear_tire_size || null,
          rear_tire_brand: null,
          rear_tire_model: null,
          rear_tire_pressure: null,
          front_suspension: formData.front_suspension || null,
          rear_suspension: formData.rear_suspension || null,
          suspension_type: null,
          ride_height: null,
          coilovers: formData.coilovers || null,
          sway_bars: formData.sway_bars || null,
          paint_color: formData.paint_color || null,
          paint_type: null,
          wrap_color: null,
          carbon_fiber_parts: null,
          lighting: null,
          body_kit: formData.body_kit || null,
          interior_color: formData.interior_color || null,
          interior_material: null,
          seats: formData.seats || null,
          steering_wheel: null,
          shift_knob: null,
          gauges: null,
          modifications: null,
          dyno_results: null,
          vin: null,
          mileage: null,
          fuel_economy: null,
          maintenance_history: null,
          instagram_handle: formData.instagram_handle || null,
          youtube_channel: formData.youtube_channel || null,
          build_thread_url: null,
          website_url: formData.website_url || null,
          photos: [],
          main_photo_url: null,
          like_count: 0,
        },
        unitPreference
      )

      if (newCar) {
        toast.success('Car created successfully!')
        // Redirect to dashboard after successful car creation
        router.push('/dashboard')
      } else {
        setError('Failed to create car')
      }
    } catch (error) {
      console.error('Error creating car:', error)
      setError('An unexpected error occurred')
    } finally {
      setCreating(false)
    }
  }

  if (loading || unitLoading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner fullScreen message='Checking car limit...' />
      </ProtectedRoute>
    )
  }

  if (!canCreate) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-background'>
          <MainNavbar showCreateButton={true} />
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
            <div className='text-center'>
              <h1 className='text-3xl font-bold text-foreground mb-4'>
                Car Limit Reached
              </h1>
              <p className='text-muted-foreground mb-6'>
                You have reached your car limit ({carSlots?.currentCars || 0}{' '}
                cars). Upgrade to premium to create more cars.
              </p>
              <button
                onClick={() => router.push('/support')}
                className='bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors'
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        <MainNavbar showCreateButton={true} />

        {/* Page Header */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
          <div className='flex items-center'>
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
            <h1 className='text-3xl font-bold text-foreground'>
              Create Your Car
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <main className='max-w-4xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>
            {/* Error Messages */}
            {error && (
              <div className='mb-6 rounded-md bg-destructive/10 p-4 border border-destructive/20'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-destructive'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-destructive'>{error}</p>
                  </div>
                </div>
              </div>
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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
