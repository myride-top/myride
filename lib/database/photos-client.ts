import { createBrowserClient } from '@supabase/ssr'
import { Car, CarPhoto, PhotoCategory } from '@/lib/types/database'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test function to check if we can read car data
export async function testCarAccess(carId: string): Promise<boolean> {
  try {
    console.log('Testing car access for:', carId)
    const { data, error } = await supabase
      .from('cars')
      .select('id, name, photos')
      .eq('id', carId)
      .single()

    if (error) {
      console.error('Test car access error:', error)
      return false
    }

    console.log('Test car access success:', data)
    return true
  } catch (error) {
    console.error('Test car access exception:', error)
    return false
  }
}

// Direct photo update functions that bypass updateCarClient
export async function updatePhotoDescriptionDirect(
  carId: string,
  photoUrl: string,
  description: string
): Promise<Car | null> {
  try {
    console.log('Updating photo description directly:', {
      carId,
      photoUrl,
      description,
    })

    // First get the current car
    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single()

    if (fetchError || !currentCar) {
      console.error('Error fetching car:', fetchError)
      return null
    }

    // Update the photos array directly
    const currentPhotos = currentCar.photos || []
    const updatedPhotos = currentPhotos.map((photo: CarPhoto) =>
      photo.url === photoUrl ? { ...photo, description } : photo
    )

    console.log('Updated photos array:', updatedPhotos)

    // Update the photos field directly
    const { data, error } = await supabase
      .from('cars')
      .update({ photos: updatedPhotos })
      .eq('id', carId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating photos description:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return null
    }

    console.log('Direct update result for description:', data)
    console.log('Photos in result:', data?.photos)
    return data
  } catch (error) {
    console.error('Error in updatePhotoDescriptionDirect:', error)
    return null
  }
}

export async function updatePhotoCategoryDirect(
  carId: string,
  photoUrl: string,
  category: PhotoCategory
): Promise<Car | null> {
  try {
    console.log('Updating photo category directly:', {
      carId,
      photoUrl,
      category,
    })

    // First get the current car
    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single()

    if (fetchError || !currentCar) {
      console.error('Error fetching car:', fetchError)
      return null
    }

    // Update the photos array directly
    const currentPhotos = currentCar.photos || []
    const updatedPhotos = currentPhotos.map((photo: CarPhoto) =>
      photo.url === photoUrl ? { ...photo, category } : photo
    )

    console.log('Updated photos array:', updatedPhotos)

    // Update the photos field directly
    const { data, error } = await supabase
      .from('cars')
      .update({ photos: updatedPhotos })
      .eq('id', carId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating photos:', error)
      return null
    }

    console.log('Direct update result:', data)
    return data
  } catch (error) {
    console.error('Error in updatePhotoCategoryDirect:', error)
    return null
  }
}

export async function deletePhotoDirect(
  carId: string,
  photoUrl: string
): Promise<Car | null> {
  try {
    console.log('Deleting photo directly:', { carId, photoUrl })

    // First get the current car
    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single()

    if (fetchError || !currentCar) {
      console.error('Error fetching car:', fetchError)
      return null
    }

    // Remove the photo from the array
    const currentPhotos = currentCar.photos || []
    const updatedPhotos = currentPhotos.filter(
      (photo: CarPhoto) => photo.url !== photoUrl
    )

    console.log('Updated photos array after deletion:', updatedPhotos)

    // Update the photos field directly
    const { data, error } = await supabase
      .from('cars')
      .update({ photos: updatedPhotos })
      .eq('id', carId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating photos:', error)
      return null
    }

    console.log('Direct delete result:', data)
    return data
  } catch (error) {
    console.error('Error in deletePhotoDirect:', error)
    return null
  }
}

export async function reorderPhotosDirect(
  carId: string,
  reorderedPhotos: CarPhoto[]
): Promise<Car | null> {
  try {
    console.log('Reordering photos directly:', { carId, reorderedPhotos })

    // First get the current car
    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single()

    if (fetchError || !currentCar) {
      console.error('Error fetching car:', fetchError)
      return null
    }

    // Use the reordered photos directly instead of trying to map
    const updatedPhotos = reorderedPhotos

    console.log('Updated photos array with new order:', updatedPhotos)

    // Update the photos field directly
    const { data, error } = await supabase
      .from('cars')
      .update({ photos: updatedPhotos })
      .eq('id', carId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating photos order:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return null
    }

    console.log('Direct reorder result:', data)
    console.log('Photos in result:', data?.photos)
    return data
  } catch (error) {
    console.error('Error in reorderPhotosDirect:', error)
    return null
  }
}
