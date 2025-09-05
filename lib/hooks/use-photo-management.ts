import { useState, useCallback } from 'react'
import { Car, CarPhoto, PhotoCategory } from '@/lib/types/database'
import {
  updatePhotoDescriptionDirect,
  updatePhotoCategoryDirect,
  deletePhotoDirect,
  reorderPhotosDirect,
  testCarAccess,
} from '@/lib/database/photos-client'
import { toast } from 'sonner'

interface UsePhotoManagementProps {
  car: Car
  onCarUpdate: (updatedCar: Car) => void
}

export function usePhotoManagement({
  car,
  onCarUpdate,
}: UsePhotoManagementProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const updatePhotoDescription = useCallback(
    async (photoUrl: string, description: string) => {
      if (!car) return

      setIsUpdating(true)
      try {
        // Test car access first
        console.log('Testing car access before update...')
        const canAccess = await testCarAccess(car.id)
        if (!canAccess) {
          toast.error('Cannot access car data')
          return
        }

        // Find the photo to get its current category
        const photo = car.photos?.find(p => p.url === photoUrl)
        if (!photo) {
          toast.error('Photo not found')
          return
        }

        // Use the direct photo update function
        const result = await updatePhotoDescriptionDirect(
          car.id,
          photoUrl,
          description
        )

        if (result) {
          onCarUpdate(result)
          toast.success('Photo description updated!')
        } else {
          toast.error('Failed to update photo description')
        }
      } catch (error) {
        console.error('Error updating photo description:', error)
        toast.error('Failed to update photo description')
      } finally {
        setIsUpdating(false)
      }
    },
    [car, onCarUpdate]
  )

  const updatePhotoCategoryHandler = useCallback(
    async (photoUrl: string, category: PhotoCategory) => {
      if (!car) return

      setIsUpdating(true)
      try {
        // Find the photo to get its current description
        const photo = car.photos?.find(p => p.url === photoUrl)
        if (!photo) {
          toast.error('Photo not found')
          return
        }

        // Use the direct photo update function
        const result = await updatePhotoCategoryDirect(
          car.id,
          photoUrl,
          category
        )

        if (result) {
          onCarUpdate(result)
          toast.success('Photo category updated!')
        } else {
          toast.error('Failed to update photo category')
        }
      } catch (error) {
        console.error('Error updating photo category:', error)
        toast.error('Failed to update photo category')
      } finally {
        setIsUpdating(false)
      }
    },
    [car, onCarUpdate]
  )

  const deletePhoto = useCallback(
    async (photoUrl: string) => {
      if (!car) return

      setIsUpdating(true)
      try {
        const result = await deletePhotoDirect(car.id, photoUrl)

        if (result) {
          onCarUpdate(result)
          toast.success('Photo deleted!')
        } else {
          toast.error('Failed to delete photo')
        }
      } catch (error) {
        console.error('Error deleting photo:', error)
        toast.error('Failed to delete photo')
      } finally {
        setIsUpdating(false)
      }
    },
    [car, onCarUpdate]
  )

  const reorderPhotos = useCallback(
    async (reorderedPhotos: CarPhoto[]) => {
      if (!car) return

      console.log('Hook reorderPhotos called with:', reorderedPhotos)
      setIsUpdating(true)
      try {
        const result = await reorderPhotosDirect(car.id, reorderedPhotos)
        console.log('Reorder result from database:', result)

        if (result) {
          onCarUpdate(result)
          toast.success('Photo order updated!')
        } else {
          console.error('Reorder failed - no result from database')
          toast.error('Failed to update photo order')
        }
      } catch (error) {
        console.error('Error reordering photos:', error)
        toast.error('Failed to reorder photos')
      } finally {
        setIsUpdating(false)
      }
    },
    [car, onCarUpdate]
  )

  return {
    updatePhotoDescription,
    updatePhotoCategory: updatePhotoCategoryHandler,
    deletePhoto,
    reorderPhotos,
    isUpdating,
  }
}
