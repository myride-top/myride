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
import { Loader2, AlertTriangle } from 'lucide-react'
import { MainNavbar } from '@/components/navbar'
import { unitConversions } from '@/lib/utils'
import { useUnitPreference } from '@/lib/context/unit-context'
import LoadingSpinner from '@/components/common/loading-spinner'
import CarForm from '@/components/forms/car-form'
import PageHeaderWithBack from '@/components/layout/page-header-with-back'
import ErrorAlert from '@/components/common/error-alert'
import Container from '@/components/common/container'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
                console.warn(
                  'Failed to save migrated photos to database:',
                  error
                )
              }
            }

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

  const handleSubmit = async (formData: any) => {
    if (!car || !user) return

    setSaving(true)
    setError(null)

    try {
      // Convert form data to match database schema
      const updateData = {
        ...formData,
        year: parseInt(formData.year),
        engine_displacement: formData.engine_displacement
          ? parseFloat(formData.engine_displacement)
          : null,
        engine_cylinders: formData.engine_cylinders
          ? parseInt(formData.engine_cylinders)
          : null,
        horsepower: formData.horsepower ? parseInt(formData.horsepower) : null,
        torque: formData.torque ? parseFloat(formData.torque) : null,
        zero_to_sixty: formData.zero_to_sixty
          ? parseFloat(formData.zero_to_sixty)
          : null,
        top_speed: formData.top_speed ? parseFloat(formData.top_speed) : null,
        quarter_mile: formData.quarter_mile
          ? parseFloat(formData.quarter_mile)
          : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        power_to_weight: formData.power_to_weight
          ? parseFloat(formData.power_to_weight)
          : null,
      }

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

  const handlePhotoUploadComplete = async (photo: CarPhoto) => {
    if (!car) return

    const updatedPhotos = [...(car.photos || []), photo]
    setCar({ ...car, photos: updatedPhotos })

    try {
      await updateCarClient(car.id, { photos: updatedPhotos })
    } catch (error) {
      console.error('Error saving photo:', error)
      toast.error('Failed to save photo')
    }
  }

  const handleBatchUploadComplete = async (newPhotos: CarPhoto[]) => {
    if (!car) return

    const updatedPhotos = [...(car.photos || []), ...newPhotos]
    setCar({ ...car, photos: updatedPhotos })

    try {
      await updateCarClient(car.id, { photos: updatedPhotos })
    } catch (error) {
      console.error('Error saving photos:', error)
      toast.error('Failed to save photos')
    }
  }

  const handlePhotoCategoryChange = async (
    photoIndex: number,
    newCategory: PhotoCategory
  ) => {
    if (!car) return

    const updatedPhotos = [...(car.photos || [])]
    updatedPhotos[photoIndex] = {
      ...updatedPhotos[photoIndex],
      category: newCategory,
    }
    setCar({ ...car, photos: updatedPhotos })

    try {
      await updateCarClient(car.id, { photos: updatedPhotos })
    } catch (error) {
      console.error('Error updating photo category:', error)
      toast.error('Failed to update photo category')
    }
  }

  const handleSetMainPhoto = async (photoUrl: string) => {
    if (!car) return

    try {
      const updatedCar = await setMainPhoto(car.id, photoUrl)
      if (updatedCar) {
        setCar(updatedCar)
        toast.success('Main photo updated!')
      }
    } catch (error) {
      console.error('Error setting main photo:', error)
      toast.error('Failed to set main photo')
    }
  }

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!car) return

    try {
      // Remove photo from storage
      await deleteCarPhoto(photoUrl)

      // Remove photo from car
      const updatedCar = await removePhotoFromCar(car.id, photoUrl)
      if (updatedCar) {
        setCar(updatedCar)
        toast.success('Photo deleted!')
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('Failed to delete photo')
    }
  }

  const handlePhotoDescriptionChange = async (
    photoIndex: number,
    newDescription: string
  ) => {
    if (!car) return

    // Clear existing timeout
    if (descriptionTimeoutRef.current) {
      clearTimeout(descriptionTimeoutRef.current)
    }

    // Store the pending change
    pendingDescriptionChanges.current.set(photoIndex, newDescription)

    // Update local state immediately
    const updatedPhotos = [...(car.photos || [])]
    updatedPhotos[photoIndex] = {
      ...updatedPhotos[photoIndex],
      description: newDescription,
    }
    setCar({ ...car, photos: updatedPhotos })

    // Debounce the database update
    descriptionTimeoutRef.current = setTimeout(async () => {
      try {
        const pendingChanges = pendingDescriptionChanges.current
        pendingDescriptionChanges.current.clear()

        // Get the latest car data to ensure we don't overwrite other changes
        const currentCar = await getCarByUrlSlugAndUsernameClient(
          carId,
          params.username as string
        )

        if (currentCar) {
          const finalPhotos = currentCar.photos?.map((photo, index) => {
            const pendingChange = pendingChanges.get(index)
            return pendingChange !== undefined
              ? { ...photo, description: pendingChange }
              : photo
          })

          if (finalPhotos) {
            await updateCarClient(car.id, { photos: finalPhotos })
            setCar({ ...currentCar, photos: finalPhotos })
          }
        }
      } catch (error) {
        console.error('Error updating photo description:', error)
        toast.error('Failed to update photo description')
      }
    }, 1000) // 1 second debounce
  }

  const handlePhotoReorder = async (reorderedPhotos: CarPhoto[]) => {
    if (!car) return

    setCar({ ...car, photos: reorderedPhotos })

    try {
      await updateCarClient(car.id, { photos: reorderedPhotos })
    } catch (error) {
      console.error('Error reordering photos:', error)
      toast.error('Failed to reorder photos')
    }

    return Promise.resolve()
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

        <PageHeaderWithBack
          title='Edit Your Car'
          description="Update your car's information and photos"
          backHref={`/${params.username}/${car.url_slug}`}
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
            mode='edit'
            initialData={car}
            onSubmit={handleSubmit}
            onPhotoUploadComplete={handlePhotoUploadComplete}
            onBatchUploadComplete={handleBatchUploadComplete}
            onPhotoCategoryChange={handlePhotoCategoryChange}
            onSetMainPhoto={handleSetMainPhoto}
            onDeletePhoto={handleDeletePhoto}
            onPhotoDescriptionChange={handlePhotoDescriptionChange}
            onPhotoReorder={handlePhotoReorder}
            unitPreference={unitPreference}
            saving={saving}
            existingPhotos={car.photos || []}
            mainPhotoUrl={car.main_photo_url || undefined}
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
                car "{car.name}" and all of its photos.
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
