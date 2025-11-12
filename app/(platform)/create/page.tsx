'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import {
  createCarClient,
  canUserCreateCarClient,
} from '@/lib/database/cars-client'
import { getUserCarSlots } from '@/lib/database/premium-client'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { MainNavbar } from '@/components/navbar/main-navbar'
import { useUnitPreference } from '@/lib/context/unit-context'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { CarForm } from '@/components/forms/car-form'
import { toast } from 'sonner'
import { CarPhoto, PhotoCategory } from '@/lib/types/database'
import { PageHeader } from '@/components/layout/page-header'
import { CarLimitChecker } from '@/components/create/car-limit-checker'
import { ErrorAlert } from '@/components/common/error-alert'
import { Container } from '@/components/common/container'
import { unitConversions } from '@/lib/utils'

export default function CreateCarPage() {
  const { user } = useAuth()
  const { unitPreference, isLoading: unitLoading } = useUnitPreference()
  const router = useRouter()

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
    photoUrl: string,
    newCategory: PhotoCategory
  ) => {
    setPhotos(prev =>
      prev.map(photo =>
        photo.url === photoUrl ? { ...photo, category: newCategory } : photo
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
        } catch {
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
    year: string | number
    description?: string | null
    build_story?: string | null
    build_start_date?: string | null
    total_build_cost?: string | number | null
    build_goals?: string[] | null
    inspiration?: string | null
    engine_displacement?: string | number | null
    engine_cylinders?: string | number | null
    engine_code?: string | null
    horsepower?: string | number | null
    torque?: string | number | null
    engine_type?: string | null
    fuel_type?: string | null
    transmission?: string | null
    drivetrain?: string | null
    zero_to_sixty?: string | number | null
    top_speed?: string | number | null
    quarter_mile?: string | number | null
    weight?: string | number | null
    power_to_weight?: string | null
    front_brakes?: string | null
    rear_brakes?: string | null
    wheel_size?: string | null
    wheel_brand?: string | null
    front_tire_size?: string | null
    rear_tire_size?: string | null
    front_tire_pressure?: string | number | null
    rear_tire_pressure?: string | number | null
    front_suspension?: string | null
    rear_suspension?: string | null
    coilovers?: string | null
    sway_bars?: string | null
    paint_color?: string | null
    body_kit?: string | null
    interior_color?: string | null
    seats?: string | null
    instagram_handle?: string | null
    youtube_channel?: string | null
    website_url?: string | null
    mileage?: string | number | null
  }) => {
    if (!user) {
      setError('User not found')
      return
    }

    setCreating(true)
    setError(null)

    try {
      // Helper to parse and validate numeric values
      const parseNumber = (
        value: string | number | null | undefined
      ): number | null => {
        if (value === null || value === undefined || value === '') return null
        const num = typeof value === 'string' ? parseFloat(value) : value
        return isNaN(num) ? null : num
      }

      // Helper to save both imperial and metric values
      const saveWithConversion = (
        value: string | number | null | undefined,
        metricToImperialConverter: (n: number) => number,
        imperialToMetricConverter: (n: number) => number
      ): { imperial: number | null; metric: number | null } => {
        const num = parseNumber(value)
        if (num === null) return { imperial: null, metric: null }

        if (unitPreference === 'metric') {
          // User entered metric value - save to metric column, convert to imperial
          return {
            imperial: metricToImperialConverter(num),
            metric: num,
          }
        } else {
          // User entered imperial value - save to imperial column, convert to metric
          return {
            imperial: num,
            metric: imperialToMetricConverter(num),
          }
        }
      }

      // Save all values with both imperial and metric
      const torqueData = saveWithConversion(
        formData.torque,
        n => unitConversions.torque.metricToImperial(n),
        n => unitConversions.torque.imperialToMetric(n)
      )
      const topSpeedData = saveWithConversion(
        formData.top_speed,
        n => unitConversions.speed.metricToImperial(n),
        n => unitConversions.speed.imperialToMetric(n)
      )
      const weightData = saveWithConversion(
        formData.weight,
        n => unitConversions.weight.metricToImperial(n),
        n => unitConversions.weight.imperialToMetric(n)
      )
      const frontTirePressureData = saveWithConversion(
        formData.front_tire_pressure,
        n => unitConversions.pressure.metricToImperial(n),
        n => unitConversions.pressure.imperialToMetric(n)
      )
      const rearTirePressureData = saveWithConversion(
        formData.rear_tire_pressure,
        n => unitConversions.pressure.metricToImperial(n),
        n => unitConversions.pressure.imperialToMetric(n)
      )
      const mileageData = saveWithConversion(
        formData.mileage,
        n => unitConversions.distance.metricToImperial(n),
        n => unitConversions.distance.imperialToMetric(n)
      )

      const newCar = await createCarClient(
        {
          user_id: user.id,
          name: formData.name,
          url_slug: formData.url_slug || '',
          make: formData.make,
          model: formData.model,
          year:
            typeof formData.year === 'string'
              ? parseInt(formData.year)
              : formData.year,
          description: formData.description || null,
          build_story: formData.build_story || null,
          project_status: 'completed',
          build_start_date: formData.build_start_date || null,
          total_build_cost: formData.total_build_cost
            ? parseFloat(String(formData.total_build_cost))
            : null,
          build_goals:
            formData.build_goals && formData.build_goals.length > 0
              ? formData.build_goals
              : null,
          inspiration: formData.inspiration || null,
          engine_displacement: formData.engine_displacement
            ? parseFloat(String(formData.engine_displacement))
            : null,
          engine_cylinders: formData.engine_cylinders
            ? parseInt(String(formData.engine_cylinders))
            : null,
          engine_code: formData.engine_code || null,
          horsepower: formData.horsepower
            ? parseInt(String(formData.horsepower))
            : null,
          torque: torqueData.imperial,
          torque_metric: torqueData.metric,
          engine_type: formData.engine_type || null,
          fuel_type: formData.fuel_type || null,
          transmission: formData.transmission || null,
          drivetrain: formData.drivetrain || null,
          zero_to_sixty: formData.zero_to_sixty
            ? parseFloat(String(formData.zero_to_sixty))
            : null,
          top_speed: topSpeedData.imperial,
          top_speed_metric: topSpeedData.metric,
          quarter_mile: formData.quarter_mile
            ? parseFloat(String(formData.quarter_mile))
            : null,
          weight: weightData.imperial,
          weight_metric: weightData.metric,
          power_to_weight: formData.power_to_weight || null,
          front_brakes: formData.front_brakes || null,
          rear_brakes: formData.rear_brakes || null,
          brake_rotors: null,
          brake_caliper_brand: null,
          brake_lines: null,
          wheel_size: formData.wheel_size || null,
          wheel_brand: formData.wheel_brand || null,
          wheel_material: null,
          wheel_offset: null,
          front_tire_size: formData.front_tire_size || null,
          front_tire_brand: null,
          front_tire_model: null,
          front_tire_pressure: frontTirePressureData.imperial,
          front_tire_pressure_metric: frontTirePressureData.metric,
          rear_tire_size: formData.rear_tire_size || null,
          rear_tire_brand: null,
          rear_tire_model: null,
          rear_tire_pressure: rearTirePressureData.imperial,
          rear_tire_pressure_metric: rearTirePressureData.metric,
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
          mileage: mileageData.imperial,
          mileage_metric: mileageData.metric,
          fuel_economy: null,
          maintenance_history: null,
          build_thread_url: null,
          like_count: 0,
          view_count: 0,
          share_count: 0,
          comment_count: 0,
          instagram_handle: formData.instagram_handle || null,
          youtube_channel: formData.youtube_channel || null,
          website_url: formData.website_url || null,
          photos: photos,
          main_photo_url: mainPhotoUrl,
        },
        unitPreference
      )

      if (newCar) {
        toast.success('Car created successfully!')
        router.push(
          `/u/${user.user_metadata?.username || 'user'}/${newCar.url_slug}`
        )
      } else {
        setError('Failed to create car')
      }
    } catch {
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
              onUpgradeClick={() => router.push('/premium')}
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

        <PageHeader
          backHref='/dashboard'
          title='Create Your Car'
          description='Add a new car to your collection'
          showBackButton={true}
        />

        {/* Main Content */}
        <Container maxWidth='4xl' className='py-6'>
          {/* Error Messages */}
          {error && (
            <ErrorAlert
              message={error}
              className='mb-6'
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
