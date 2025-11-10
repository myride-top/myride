'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import {
  getCarByUrlSlugAndUsernameClient,
  updateCarClient,
  deleteCarClient,
  setMainPhoto,
  fixCarUrlSlug,
} from '@/lib/database/cars-client'
import { Car, CarPhoto, PhotoCategory } from '@/lib/types/database'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { deleteCarPhoto } from '@/lib/storage/photos'
import { Loader2, AlertTriangle } from 'lucide-react'
import { MainNavbar } from '@/components/navbar/main-navbar'
import { useUnitPreference } from '@/lib/context/unit-context'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { CarForm } from '@/components/forms/car-form'
import { PageHeader } from '@/components/layout/page-header'
import { ErrorAlert } from '@/components/common/error-alert'
import { Container } from '@/components/common/container'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { unitConversions } from '@/lib/utils'

export default function EditCarPage() {
  const { user } = useAuth()
  const { unitPreference, isLoading: unitLoading } = useUnitPreference()
  const router = useRouter()
  const params = useParams()
  const carId = params.car as string

  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const loadCar = async () => {
      if (carId && user) {
        try {
          const carData = await getCarByUrlSlugAndUsernameClient(
            carId,
            params.username as string
          )
          if (carData) {
            // Check if the car belongs to the current user
            if (carData.user_id !== user.id) {
              setError('You do not have permission to edit this car')
              setLoading(false)
              return
            }

            // Check if the URL slug is a UUID and fix it if needed
            if (
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                carData.url_slug
              )
            ) {
              const fixedCar = await fixCarUrlSlug(carData.id)
              if (fixedCar) {
                // Redirect to the new URL
                router.replace(`/${params.username}/${fixedCar.url_slug}/edit`)
                return
              }
            }

            // Migrate old photo format to new format if needed
            if (carData.photos && carData.photos.length > 0) {
              const migratedPhotos = carData.photos.map((photo, index) => {
                if (typeof photo === 'string') {
                  // Convert old string format to new CarPhoto format
                  return {
                    url: photo,
                    category: 'other' as PhotoCategory,
                    description: '',
                    order: index,
                  }
                }
                return photo
              })

              // Update the car data with migrated photos
              carData.photos = migratedPhotos

              // Save migrated photos to database
              try {
                const updatedCar = await updateCarClient(carData.id, {
                  photos: migratedPhotos,
                })
                if (updatedCar) {
                  carData.photos = updatedCar.photos
                }
              } catch (error) {
                // Continue with local migration even if database update fails
                console.warn(
                  'Failed to save migrated photos to database:',
                  error
                )
              }
            }

            // Don't modify the original car data - handle deduplication in UI only
            setCar(carData)
          } else {
            setError('Car not found')
          }
        } catch (error) {
          console.error('Error loading car:', error)
          setError('Failed to load car data')
        } finally {
          setLoading(false)
        }
      }
    }

    loadCar()
  }, [carId, user, params.username, router])

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
    if (!car || !user) return

    setSaving(true)
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

      const updateData = {
        ...formData,
        year:
          typeof formData.year === 'string'
            ? parseInt(formData.year)
            : formData.year,
        total_build_cost: formData.total_build_cost
          ? parseFloat(String(formData.total_build_cost))
          : null,
        engine_displacement: formData.engine_displacement
          ? parseFloat(String(formData.engine_displacement))
          : null,
        engine_cylinders: formData.engine_cylinders
          ? parseInt(String(formData.engine_cylinders))
          : null,
        horsepower: formData.horsepower
          ? parseInt(String(formData.horsepower))
          : null,
        torque: torqueData.imperial,
        torque_metric: torqueData.metric,
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
        front_tire_pressure: frontTirePressureData.imperial,
        front_tire_pressure_metric: frontTirePressureData.metric,
        rear_tire_pressure: rearTirePressureData.imperial,
        rear_tire_pressure_metric: rearTirePressureData.metric,
        mileage: mileageData.imperial,
        mileage_metric: mileageData.metric,
        power_to_weight: formData.power_to_weight || null,
        // Preserve the current photos to prevent them from being overwritten
        photos: car.photos,
      }

      console.log('Form submission - preserving photos:', car.photos)
      console.log('Update data being sent:', updateData)

      const updatedCar = await updateCarClient(car.id, updateData)

      if (updatedCar) {
        setCar(updatedCar)
        toast.success('Car updated successfully!')
        router.push(`/${params.username}/${updatedCar.url_slug}`)
      } else {
        setError('Failed to update car')
      }
    } catch (error) {
      console.error('Error updating car:', error)
      setError('Failed to update car. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!car) return

    setDeleting(true)
    setError(null)

    try {
      // Delete all photos from storage first
      if (car.photos && car.photos.length > 0) {
        for (const photo of car.photos) {
          try {
            await deleteCarPhoto(photo.url)
          } catch (error) {
            console.warn('Failed to delete photo from storage:', error)
          }
        }
      }

      // Delete the car from database
      const success = await deleteCarClient(car.id)

      if (success) {
        toast.success('Car deleted successfully!')
        router.push('/dashboard')
      } else {
        setError('Failed to delete car')
      }
    } catch (error) {
      console.error('Error deleting car:', error)
      setError('Failed to delete car. Please try again.')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading || unitLoading) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-background'>
          <MainNavbar showCreateButton={true} />
          <div className='flex items-center justify-center min-h-screen'>
            <LoadingSpinner message='Loading car...' />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error && !car) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-background'>
          <MainNavbar showCreateButton={true} />
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
            <ErrorAlert message={error} className='text-center' />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!car) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-background'>
          <MainNavbar showCreateButton={true} />
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24'>
            <ErrorAlert message='Car not found' className='text-center' />
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
          title='Edit Your Car'
          description="Update your car's information and photos"
          backHref={`/${params.username}/${car.url_slug}`}
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
            key={`edit-${car.id}-${unitPreference}`}
            mode='edit'
            initialData={
              unitPreference === 'metric'
                ? {
                    ...car,
                    // Use metric columns directly, fallback to converting imperial if metric not available
                    torque:
                      car.torque_metric ??
                      (car.torque
                        ? unitConversions.torque.imperialToMetric(car.torque)
                        : null),
                    top_speed:
                      car.top_speed_metric ??
                      (car.top_speed
                        ? unitConversions.speed.imperialToMetric(car.top_speed)
                        : null),
                    weight:
                      car.weight_metric ??
                      (car.weight
                        ? unitConversions.weight.imperialToMetric(car.weight)
                        : null),
                    front_tire_pressure:
                      car.front_tire_pressure_metric ??
                      (car.front_tire_pressure
                        ? unitConversions.pressure.imperialToMetric(
                            car.front_tire_pressure
                          )
                        : null),
                    rear_tire_pressure:
                      car.rear_tire_pressure_metric ??
                      (car.rear_tire_pressure
                        ? unitConversions.pressure.imperialToMetric(
                            car.rear_tire_pressure
                          )
                        : null),
                    mileage:
                      car.mileage_metric ??
                      (car.mileage
                        ? unitConversions.distance.imperialToMetric(car.mileage)
                        : null),
                  }
                : {
                    ...car,
                    // Use imperial columns directly, fallback to converting metric if imperial not available
                    torque:
                      car.torque ??
                      (car.torque_metric
                        ? unitConversions.torque.metricToImperial(
                            car.torque_metric
                          )
                        : null),
                    top_speed:
                      car.top_speed ??
                      (car.top_speed_metric
                        ? unitConversions.speed.metricToImperial(
                            car.top_speed_metric
                          )
                        : null),
                    weight:
                      car.weight ??
                      (car.weight_metric
                        ? unitConversions.weight.metricToImperial(
                            car.weight_metric
                          )
                        : null),
                    front_tire_pressure:
                      car.front_tire_pressure ??
                      (car.front_tire_pressure_metric
                        ? unitConversions.pressure.metricToImperial(
                            car.front_tire_pressure_metric
                          )
                        : null),
                    rear_tire_pressure:
                      car.rear_tire_pressure ??
                      (car.rear_tire_pressure_metric
                        ? unitConversions.pressure.metricToImperial(
                            car.rear_tire_pressure_metric
                          )
                        : null),
                    mileage:
                      car.mileage ??
                      (car.mileage_metric
                        ? unitConversions.distance.metricToImperial(
                            car.mileage_metric
                          )
                        : null),
                  }
            }
            onSubmit={handleSubmit}
            unitPreference={unitPreference}
            saving={saving}
            existingPhotos={car.photos || []}
            onPhotoUploadComplete={async (photo: CarPhoto) => {
              // Add photo to car's photos array, avoiding duplicates
              const existingUrls = new Set((car.photos || []).map(p => p.url))
              if (!existingUrls.has(photo.url)) {
                const updatedPhotos = [...(car.photos || []), photo]
                const updatedCar = {
                  ...car,
                  photos: updatedPhotos,
                }
                setCar(updatedCar)

                // Save to database
                try {
                  const savedCar = await updateCarClient(car.id, {
                    photos: updatedPhotos,
                  })
                  if (savedCar) {
                    setCar(savedCar)
                    toast.success('Photo added successfully!')
                  }
                } catch (error) {
                  console.error('Error saving photo:', error)
                  toast.error('Failed to save photo')
                }
              }
            }}
            onBatchUploadComplete={async (photos: CarPhoto[]) => {
              // Add photos to car's photos array, avoiding duplicates
              const existingUrls = new Set((car.photos || []).map(p => p.url))
              const newPhotos = photos.filter(
                photo => !existingUrls.has(photo.url)
              )
              if (newPhotos.length > 0) {
                const updatedPhotos = [...(car.photos || []), ...newPhotos]
                const updatedCar = {
                  ...car,
                  photos: updatedPhotos,
                }
                setCar(updatedCar)

                // Save to database
                try {
                  const savedCar = await updateCarClient(car.id, {
                    photos: updatedPhotos,
                  })
                  if (savedCar) {
                    setCar(savedCar)
                    toast.success(
                      `${newPhotos.length} photos added successfully!`
                    )
                  }
                } catch (error) {
                  console.error('Error saving photos:', error)
                  toast.error('Failed to save photos')
                }
              }
            }}
            onPhotoCategoryChange={async (
              photoUrl: string,
              category: PhotoCategory
            ) => {
              // Update photo category using direct database function
              const { updatePhotoCategoryDirect } = await import(
                '@/lib/database/photos-client'
              )
              const result = await updatePhotoCategoryDirect(
                car.id,
                photoUrl,
                category
              )
              if (result) {
                setCar(result)
                toast.success('Photo category updated!')
              }
            }}
            onPhotoDescriptionChange={async (
              photoIndex: number,
              description: string
            ) => {
              // Update photo description using direct database function
              const photo = car.photos?.[photoIndex]
              if (photo) {
                const { updatePhotoDescriptionDirect } = await import(
                  '@/lib/database/photos-client'
                )
                const result = await updatePhotoDescriptionDirect(
                  car.id,
                  photo.url,
                  description
                )
                if (result) {
                  setCar(result)
                  toast.success('Photo description updated!')
                }
              }
            }}
            onSetMainPhoto={async (photoUrl: string) => {
              // Set main photo
              const updatedCar = await setMainPhoto(car.id, photoUrl)
              if (updatedCar) {
                setCar(updatedCar)
                toast.success('Main photo updated!')
              }
            }}
            onDeletePhoto={async (photoUrl: string) => {
              // Delete photo using direct database function
              const { deletePhotoDirect } = await import(
                '@/lib/database/photos-client'
              )
              const result = await deletePhotoDirect(car.id, photoUrl)
              if (result) {
                setCar(result)
                toast.success('Photo deleted!')
              }
            }}
            onPhotoReorder={async (photos: CarPhoto[]) => {
              // Reorder photos using direct database function
              const { reorderPhotosDirect } = await import(
                '@/lib/database/photos-client'
              )
              const result = await reorderPhotosDirect(car.id, photos)
              if (result) {
                setCar(result)
                toast.success('Photo order updated!')
              }
            }}
          />

          {/* Delete Car Section */}
          <div className='mt-12 pt-8 border-t border-border'>
            <div className='bg-destructive/5 border border-destructive/20 rounded-lg p-6'>
              <div className='flex items-center mb-4'>
                <AlertTriangle className='w-5 h-5 text-destructive mr-2' />
                <h3 className='text-lg font-semibold text-destructive'>
                  Danger Zone
                </h3>
              </div>
              <p className='text-muted-foreground mb-4'>
                Once you delete a car, there is no going back. Please be
                certain.
              </p>
              <Button
                variant='destructive'
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  'Delete Car'
                )}
              </Button>
            </div>
          </div>
        </Container>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                car &quot;{car.name}&quot; and all of its photos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  'Delete Car'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
