'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import {
  getCarByUrlSlugAndUsernameClient,
  updateCarClient,
  deleteCarClient,
  setMainPhoto,
  fixCarUrlSlug,
  removePhotoFromCar,
} from '@/lib/database/cars-client'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { Car, CarPhoto, PhotoCategory } from '@/lib/types/database'
import ProtectedRoute from '@/components/auth/protected-route'
import { toast } from 'sonner'
import { deleteCarPhoto } from '@/lib/storage/photos'
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'
import { MainNavbar } from '@/components/navbar'
import { unitConversions } from '@/lib/utils'
import { useUnitPreference } from '@/lib/context/unit-context'
import LoadingSpinner from '@/components/common/loading-spinner'
import CarForm from '@/components/forms/car-form'

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

  // Debounced photo description change
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingDescriptionChanges = useRef<Map<number, string>>(new Map())

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
              }
            }

            setCar(carData)
          } else {
            setError('Car not found')
          }
        } catch (error) {
          setError('Failed to load car')
        } finally {
          setLoading(false)
        }
      }
    }

    loadCar()
  }, [carId, user, params.username, router])

  const handlePhotoUploadComplete = async (photo: CarPhoto) => {
    if (car) {
      const updatedPhotos = [...(car.photos || []), photo]

      // Immediately save to database to ensure persistence
      try {
        const updatedCar = await updateCarClient(car.id, {
          photos: updatedPhotos,
        })

        if (updatedCar) {
          setCar(updatedCar)
          toast.success('Photo uploaded and saved!')
        } else {
          setError('Failed to save photo to database')
        }
      } catch (error) {
        setError('Failed to save photo to database')
      }
    }
  }

  const handleBatchUploadComplete = async (photos: CarPhoto[]) => {
    if (car) {
      const updatedPhotos = [...(car.photos || []), ...photos]

      // Save all photos to the database at once
      try {
        const updatedCar = await updateCarClient(car.id, {
          photos: updatedPhotos,
        })

        if (updatedCar) {
          setCar(updatedCar)
          toast.success(`${photos.length} photo(s) saved successfully!`)
        } else {
          setError('Failed to save photos to database')
        }
      } catch (error) {
        setError('Failed to save photos to database')
      }
    }
  }

  const handlePhotoCategoryChange = async (
    photoIndex: number,
    newCategory: PhotoCategory
  ) => {
    if (car && car.photos) {
      const updatedPhotos = [...car.photos]
      if (typeof updatedPhotos[photoIndex] === 'object') {
        ;(updatedPhotos[photoIndex] as CarPhoto).category = newCategory

        try {
          const updatedCar = await updateCarClient(car.id, {
            photos: updatedPhotos,
          })

          if (updatedCar) {
            setCar(updatedCar)
            toast.success('Photo category updated!')
          }
        } catch (error) {
          toast.error('Failed to update photo category')
        }
      }
    }
  }

  const handlePhotoDescriptionChange = async (
    photoIndex: number,
    newDescription: string
  ) => {
    if (car && car.photos) {
      // Store the pending change
      pendingDescriptionChanges.current.set(photoIndex, newDescription)

      // Update local state immediately for responsive UI
      const updatedPhotos = [...car.photos]
      if (typeof updatedPhotos[photoIndex] === 'object') {
        ;(updatedPhotos[photoIndex] as CarPhoto).description = newDescription
        setCar({ ...car, photos: updatedPhotos })
      }

      // Clear existing timeout
      if (descriptionTimeoutRef.current) {
        clearTimeout(descriptionTimeoutRef.current)
      }

      // Set new timeout to save after 1 second of no typing
      descriptionTimeoutRef.current = setTimeout(async () => {
        const pendingDescription =
          pendingDescriptionChanges.current.get(photoIndex)
        if (pendingDescription !== undefined && car && car.photos) {
          try {
            const updatedCar = await updateCarClient(car.id, {
              photos: updatedPhotos,
            })

            if (updatedCar) {
              setCar(updatedCar)
              // Only show success toast if there was an actual change
              if (pendingDescription !== car.photos[photoIndex]?.description) {
                toast.success('Photo description updated!')
              }
            }
          } catch (error) {
            toast.error('Failed to update photo description')
          }

          // Clear the pending change
          pendingDescriptionChanges.current.delete(photoIndex)
        }
      }, 1000)
    }
  }

  const handleSetMainPhoto = async (photoUrl: string) => {
    if (!car) return

    try {
      const updatedCar = await setMainPhoto(car.id, photoUrl)
      if (updatedCar) {
        setCar(updatedCar)
        toast.success('Main photo set successfully!')
      } else {
        toast.error('Failed to set main photo')
      }
    } catch (error) {
      toast.error('Failed to set main photo')
    }
  }

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!car) return

    try {
      // First, delete the photo from storage
      const storageDeleted = await deleteCarPhoto(photoUrl)
      if (!storageDeleted) {
        toast.error('Failed to delete photo from storage')
        return
      }

      // Then, remove the photo from the car's photos array
      const updatedCar = await removePhotoFromCar(car.id, photoUrl)
      if (updatedCar) {
        setCar(updatedCar)
        toast.success('Photo deleted successfully!')
      } else {
        toast.error('Failed to remove photo from car')
      }
    } catch (error) {
      toast.error('Failed to delete photo')
    }
  }

  const handlePhotoReorder = async (reorderedPhotos: CarPhoto[]) => {
    if (!car) return

    try {
      // Update the car's photos with the new order
      const updatedCar = await updateCarClient(car.id, {
        photos: reorderedPhotos,
      })

      if (updatedCar) {
        setCar(updatedCar)
        toast.success('Photo order updated successfully!')
      } else {
        toast.error('Failed to update photo order')
      }
    } catch (error) {
      toast.error('Failed to update photo order')
    }
  }

  const handleSubmit = async (formData: any) => {
    if (!car || !user) {
      setError('Car or user not found')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const updatedCar = await updateCarClient(car.id, {
        name: formData.name,
        url_slug: formData.url_slug || '',
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        description: formData.description || null,
        build_story: formData.build_story || null,
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
        horsepower: formData.horsepower ? parseInt(formData.horsepower) : null,
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
        brake_rotors: formData.brake_rotors || null,
        brake_caliper_brand: formData.brake_caliper_brand || null,
        brake_lines: formData.brake_lines || null,
        wheel_size: formData.wheel_size || null,
        wheel_material: formData.wheel_material || null,
        wheel_brand: formData.wheel_brand || null,
        wheel_offset: formData.wheel_offset || null,
        front_tire_size: formData.front_tire_size || null,
        front_tire_brand: formData.front_tire_brand || null,
        front_tire_model: formData.front_tire_model || null,
        front_tire_pressure: formData.front_tire_pressure
          ? parseFloat(formData.front_tire_pressure)
          : null,
        rear_tire_size: formData.rear_tire_size || null,
        rear_tire_brand: formData.rear_tire_brand || null,
        rear_tire_model: formData.rear_tire_model || null,
        rear_tire_pressure: formData.rear_tire_pressure
          ? parseFloat(formData.rear_tire_pressure)
          : null,
        front_suspension: formData.front_suspension || null,
        rear_suspension: formData.rear_suspension || null,
        suspension_type: formData.suspension_type || null,
        ride_height: formData.ride_height || null,
        coilovers: formData.coilovers || null,
        sway_bars: formData.sway_bars || null,
        paint_color: formData.paint_color || null,
        paint_type: formData.paint_type || null,
        wrap_color: formData.wrap_color || null,
        carbon_fiber_parts: formData.carbon_fiber_parts || null,
        lighting: formData.lighting || null,
        body_kit: formData.body_kit || null,
        interior_color: formData.interior_color || null,
        interior_material: formData.interior_material || null,
        seats: formData.seats || null,
        steering_wheel: formData.steering_wheel || null,
        shift_knob: formData.shift_knob || null,
        gauges: formData.gauges || null,
        modifications: formData.modifications || null,
        dyno_results: formData.dyno_results || null,
        vin: formData.vin || null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        fuel_economy: formData.fuel_economy || null,
        maintenance_history: formData.maintenance_history || null,
        instagram_handle: formData.instagram_handle || null,
        youtube_channel: formData.youtube_channel || null,
        build_thread_url: formData.build_thread_url || null,
        website_url: formData.website_url || null,
      })

      if (updatedCar) {
        setCar(updatedCar)
        toast.success('Car updated successfully!')
        router.push(`/${params.username}/${updatedCar.url_slug}`)
      } else {
        setError('Failed to update car')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!car || !user) return

    if (
      !confirm(
        'Are you sure you want to delete this car? This action cannot be undone.'
      )
    ) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      await deleteCarClient(car.id)
      toast.success('Car deleted successfully!')
      router.push('/dashboard')
    } catch (error) {
      setError('Failed to delete car')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || unitLoading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner fullScreen message='Loading your car...' />
      </ProtectedRoute>
    )
  }

  if (error && !car) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen flex items-center justify-center bg-background'>
          <div className='text-center'>
            <div className='text-destructive mb-4'>
              <AlertTriangle className='w-16 h-16 mx-auto' />
            </div>
            <h2 className='text-xl font-semibold text-foreground mb-2'>
              Error
            </h2>
            <p className='text-muted-foreground mb-4'>{error}</p>
            <button
              onClick={() => router.back()}
              className='bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors cursor-pointer'
            >
              Go Back
            </button>
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
          <div className='flex justify-between items-center'>
            <div className='flex items-center'>
              <button
                onClick={() => router.back()}
                className='mr-4 text-foreground hover:text-foreground/80 cursor-pointer'
              >
                <ArrowLeft className='w-6 h-6' />
              </button>
              <h1 className='text-3xl font-bold text-foreground'>Edit Car</h1>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className='bg-red-500 text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer'
            >
              {deleting ? 'Deleting...' : 'Delete Car'}
            </button>
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
                    <AlertTriangle className='h-5 w-5 text-destructive' />
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-destructive'>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Car Form */}
            <CarForm
              mode='edit'
              initialData={car || {}}
              onSubmit={handleSubmit}
              onPhotoUploadComplete={handlePhotoUploadComplete}
              onBatchUploadComplete={handleBatchUploadComplete}
              onPhotoCategoryChange={handlePhotoCategoryChange}
              onPhotoDescriptionChange={handlePhotoDescriptionChange}
              onSetMainPhoto={handleSetMainPhoto}
              onDeletePhoto={handleDeletePhoto}
              onPhotoReorder={handlePhotoReorder}
              unitPreference={unitPreference}
              saving={saving}
              existingPhotos={car?.photos || []}
              mainPhotoUrl={car?.main_photo_url || undefined}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
