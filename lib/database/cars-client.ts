import { createBrowserClient } from '@supabase/ssr'
import { Car, CarPhoto } from '@/lib/types/database'
import { unitConversions } from '@/lib/utils'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getCarsByUserClient(
  userId: string
): Promise<Car[] | null> {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cars:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching cars:', error)
    return null
  }
}

export async function getUserCarCountClient(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error counting user cars:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error counting user cars:', error)
    return 0
  }
}

export async function canUserCreateCarClient(userId: string): Promise<boolean> {
  try {
    const carCount = await getUserCarCountClient(userId)
    return carCount < 1 // Limit to 1 car per user
  } catch (error) {
    console.error('Error checking if user can create car:', error)
    return false
  }
}

export async function getCarByIdClient(carId: string): Promise<Car | null> {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single()

    if (error) {
      console.error('Error fetching car:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching car:', error)
    return null
  }
}

export async function getCarByNameAndUsernameClient(
  carName: string,
  username: string
): Promise<Car | null> {
  try {
    console.log('getCarByNameAndUsernameClient called with:', {
      carName,
      username,
    })

    // First get the profile to get the user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (profileError || !profileData) {
      console.error('Error fetching profile:', profileError)
      return null
    }

    console.log('Profile found:', profileData)

    // Try multiple search strategies to find the car
    let searchError = null

    // Strategy 1: Try exact match first
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('name', carName)
        .eq('user_id', profileData.id)
        .single()

      if (!error && data) {
        console.log('Exact match found:', data)
        return data
      }
      searchError = error
    } catch (e) {
      searchError = e
    }

    // Strategy 2: Try case-insensitive exact match
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .ilike('name', carName)
        .eq('user_id', profileData.id)
        .single()

      if (!error && data) {
        console.log('Case-insensitive exact match found:', data)
        return data
      }
    } catch (e) {
      console.error(e)
    }

    // Strategy 3: Try partial match (most flexible)
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .ilike('name', `%${carName}%`)
        .eq('user_id', profileData.id)
        .single()

      if (!error && data) {
        console.log('Partial match found:', data)
        return data
      }
    } catch (e) {
      console.error(e)
    }

    // Strategy 4: Try with spaces instead of dashes
    try {
      const nameWithSpaces = carName.replace(/-/g, ' ')
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .ilike('name', `%${nameWithSpaces}%`)
        .eq('user_id', profileData.id)
        .single()

      if (!error && data) {
        console.log('Space-replaced match found:', data)
        return data
      }
    } catch (e) {
      console.error(e)
    }

    // Strategy 5: Try with dashes instead of spaces
    try {
      const nameWithDashes = carName.replace(/\s+/g, '-')
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .ilike('name', `%${nameWithDashes}%`)
        .eq('user_id', profileData.id)
        .single()

      if (!error && data) {
        console.log('Dash-replaced match found:', data)
        return data
      }
    } catch (e) {
      console.error(e)
    }

    console.error('All search strategies failed. Original error:', searchError)
    console.error('Query details:', { carName, userId: profileData.id })
    return null
  } catch (error) {
    console.error('Error fetching car by name:', error)
    return null
  }
}

export async function getCarByUrlSlugAndUsernameClient(
  urlSlug: string,
  username: string
): Promise<Car | null> {
  try {
    console.log('getCarByUrlSlugAndUsernameClient called with:', {
      urlSlug,
      username,
    })

    // First get the profile to get the user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (profileError || !profileData) {
      console.error('Error fetching profile:', profileError)
      return null
    }

    console.log('Profile found:', profileData)

    // Get the car by url_slug and user_id
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('url_slug', urlSlug)
      .eq('user_id', profileData.id)
      .single()

    if (error) {
      console.error('Error fetching car by URL slug:', error)
      console.error('Query details:', { urlSlug, userId: profileData.id })
      return null
    }

    console.log('Car found:', data)
    return data
  } catch (error) {
    console.error('Error fetching car by URL slug:', error)
    return null
  }
}

export async function createCarClient(
  carData: Omit<Car, 'id' | 'created_at' | 'updated_at'>,
  unitPreference: 'metric' | 'imperial' = 'metric'
): Promise<Car | null> {
  try {
    // Check car limit before creating
    const canCreate = await canUserCreateCarClient(carData.user_id)
    if (!canCreate) {
      console.error('User has reached car limit')
      return null
    }

    // Convert values based on user's unit preference
    const convertedCarData = {
      ...carData,
      torque: carData.torque
        ? unitPreference === 'metric'
          ? unitConversions.torque.metricToImperial(carData.torque)
          : carData.torque
        : null,
      front_tire_pressure: carData.front_tire_pressure
        ? unitPreference === 'metric'
          ? unitConversions.pressure.metricToImperial(
              carData.front_tire_pressure
            )
          : carData.front_tire_pressure
        : null,
      rear_tire_pressure: carData.rear_tire_pressure
        ? unitPreference === 'metric'
          ? unitConversions.pressure.metricToImperial(
              carData.rear_tire_pressure
            )
          : carData.rear_tire_pressure
        : null,
      top_speed: carData.top_speed
        ? unitPreference === 'metric'
          ? unitConversions.speed.metricToImperial(carData.top_speed)
          : carData.top_speed
        : null,
      weight: carData.weight
        ? unitPreference === 'metric'
          ? unitConversions.weight.metricToImperial(carData.weight)
          : carData.weight
        : null,
      mileage: carData.mileage
        ? unitPreference === 'metric'
          ? unitConversions.distance.metricToImperial(carData.mileage)
          : carData.mileage
        : null,
    }

    const { data, error } = await supabase
      .from('cars')
      .insert(convertedCarData)
      .select()
      .single()

    if (error) {
      console.error('Error creating car:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating car:', error)
    return null
  }
}

export async function updateCarClient(
  carId: string,
  carData: Partial<Omit<Car, 'id' | 'created_at' | 'updated_at'>>,
  unitPreference: 'metric' | 'imperial' = 'metric'
): Promise<Car | null> {
  try {
    // Convert values based on user's unit preference
    const convertedCarData = {
      ...carData,
      torque:
        carData.torque !== undefined
          ? carData.torque
            ? unitPreference === 'metric'
              ? unitConversions.torque.metricToImperial(carData.torque)
              : carData.torque
            : null
          : undefined,
      front_tire_pressure:
        carData.front_tire_pressure !== undefined
          ? carData.front_tire_pressure
            ? unitPreference === 'metric'
              ? unitConversions.pressure.metricToImperial(
                  carData.front_tire_pressure
                )
              : carData.front_tire_pressure
            : null
          : undefined,
      rear_tire_pressure:
        carData.rear_tire_pressure !== undefined
          ? carData.rear_tire_pressure
            ? unitPreference === 'metric'
              ? unitConversions.pressure.metricToImperial(
                  carData.rear_tire_pressure
                )
              : carData.rear_tire_pressure
            : null
          : undefined,
      top_speed:
        carData.top_speed !== undefined
          ? carData.top_speed
            ? unitPreference === 'metric'
              ? unitConversions.speed.metricToImperial(carData.top_speed)
              : carData.top_speed
            : null
          : undefined,
      weight:
        carData.weight !== undefined
          ? carData.weight
            ? unitPreference === 'metric'
              ? unitConversions.weight.metricToImperial(carData.weight)
              : carData.weight
            : null
          : undefined,
      mileage:
        carData.mileage !== undefined
          ? carData.mileage
            ? unitPreference === 'metric'
              ? unitConversions.distance.metricToImperial(carData.mileage)
              : carData.mileage
            : null
          : undefined,
    }

    const { data, error } = await supabase
      .from('cars')
      .update(convertedCarData)
      .eq('id', carId)
      .select()
      .single()

    if (error) {
      console.error('Error updating car:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating car:', error)
    return null
  }
}

export async function deleteCarClient(carId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('cars').delete().eq('id', carId)

    if (error) {
      console.error('Error deleting car:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting car:', error)
    return false
  }
}

// Helper function to add a photo to a car
export async function addPhotoToCar(
  carId: string,
  photo: CarPhoto
): Promise<Car | null> {
  try {
    // First get the current car to get existing photos
    const currentCar = await getCarByIdClient(carId)
    if (!currentCar) return null

    const currentPhotos = currentCar.photos || []
    const updatedPhotos = [...currentPhotos, photo]

    return await updateCarClient(carId, { photos: updatedPhotos })
  } catch (error) {
    console.error('Error adding photo to car:', error)
    return null
  }
}

// Helper function to remove a photo from a car
export async function removePhotoFromCar(
  carId: string,
  photoUrl: string
): Promise<Car | null> {
  try {
    const currentCar = await getCarByIdClient(carId)
    if (!currentCar) return null

    const currentPhotos = currentCar.photos || []
    const updatedPhotos = currentPhotos.filter(photo => photo.url !== photoUrl)

    return await updateCarClient(carId, { photos: updatedPhotos })
  } catch (error) {
    console.error('Error removing photo from car:', error)
    return null
  }
}

// Helper function to update photo category
export async function updatePhotoCategory(
  carId: string,
  photoUrl: string,
  category: string,
  description?: string
): Promise<Car | null> {
  try {
    const currentCar = await getCarByIdClient(carId)
    if (!currentCar) return null

    const currentPhotos = currentCar.photos || []
    const updatedPhotos = currentPhotos.map(photo =>
      photo.url === photoUrl
        ? { ...photo, category, description: description || photo.description }
        : photo
    )

    return await updateCarClient(carId, { photos: updatedPhotos })
  } catch (error) {
    console.error('Error updating photo category:', error)
    return null
  }
}

// Helper function to set main photo
export async function setMainPhoto(
  carId: string,
  photoUrl: string
): Promise<Car | null> {
  try {
    return await updateCarClient(carId, { main_photo_url: photoUrl })
  } catch (error) {
    console.error('Error setting main photo:', error)
    return null
  }
}
