import { createBrowserClient } from '@supabase/ssr'
import { Car, CarPhoto } from '@/lib/types/database'
import { unitConversions } from '@/lib/utils'
import { deleteAllCarPhotos } from '@/lib/storage/photos'

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
    // First check if user is premium
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, car_slots_purchased')
      .eq('id', userId)
      .single()

    let isPremium = false
    let carSlotsPurchased = 0
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      // If profile doesn't exist yet, treat as non-premium
      isPremium = false
      carSlotsPurchased = 0
    } else {
      isPremium = profile?.is_premium || false
      carSlotsPurchased = profile?.car_slots_purchased || 0
    }

    // If premium, they can create unlimited cars
    if (isPremium) {
      return true
    }

    // If not premium, check car count
    const { count, error: carError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (carError) {
      console.error('Error counting cars:', carError)
      return false
    }

    const currentCarCount = count || 0
    const maxAllowedCars = 1 + carSlotsPurchased // 1 free + purchased slots

    return currentCarCount < maxAllowedCars
  } catch (error) {
    console.error('Error checking if user can create car:', error)
    return false
  }
}

// Simple fallback function that doesn't rely on database functions
export async function canUserCreateCarSimpleClient(
  userId: string
): Promise<boolean> {
  try {
    // Check profile for purchased slots
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, car_slots_purchased')
      .eq('id', userId)
      .single()

    let isPremium = false
    let carSlotsPurchased = 0
    if (profileError) {
      // If profile doesn't exist yet, treat as non-premium
      isPremium = false
      carSlotsPurchased = 0
    } else {
      isPremium = profile?.is_premium || false
      carSlotsPurchased = profile?.car_slots_purchased || 0
    }

    // If premium, they can create unlimited cars
    if (isPremium) {
      return true
    }

    // Check car count
    const { count, error } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error counting cars:', error)
      return false
    }

    const currentCarCount = count || 0
    const maxAllowedCars = 1 + carSlotsPurchased // 1 free + purchased slots

    return currentCarCount < maxAllowedCars
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

    // Get the car by url_slug (cars should be publicly viewable by url_slug)
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('url_slug', urlSlug)
      .single()

    if (error) {
      console.error('Error fetching car by URL slug:', error)
      console.error('Query details:', { urlSlug })
      return null
    }

    // Verify that the car belongs to the profile we're looking up
    if (data.user_id !== profileData.id) {
      console.error('Car found but belongs to different user:', {
        carUserId: data.user_id,
        profileUserId: profileData.id,
        urlSlug,
        username
      })
      
      // Instead of failing, let's try to find the correct profile for this car
      const { data: correctProfile, error: profileLookupError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user_id)
        .single()
      
      if (profileLookupError || !correctProfile) {
        console.error('Could not find profile for car owner:', profileLookupError)
        return null
      }
      
      // The car exists but belongs to a different username
      // We could either redirect to the correct URL or show an error
      console.log('Car belongs to different username:', {
        expectedUsername: username,
        actualUsername: correctProfile.username,
        urlSlug
      })
      
      // For now, return null to trigger the error page
      // In the future, we could redirect to the correct URL
      return null
    }

    console.log('Car found by URL slug:', data)
    return data
  } catch (error) {
    console.error('Error fetching car by URL slug:', error)
    return null
  }
}

// New function to get car by just url_slug (for public access)
export async function getCarByUrlSlugClient(urlSlug: string): Promise<Car | null> {
  try {
    console.log('getCarByUrlSlugClient called with:', { urlSlug })

    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('url_slug', urlSlug)
      .single()

    if (error) {
      console.error('Error fetching car by URL slug:', error)
      return null
    }

    console.log('Car found by URL slug:', data)
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

export async function fixCarUrlSlug(carId: string): Promise<Car | null> {
  try {
    // Get the car first
    const car = await getCarByIdClient(carId)
    if (!car) {
      console.error('Car not found for URL slug fix')
      return null
    }

    // Check if the current url_slug is a UUID
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        car.url_slug
      )
    ) {
      console.log('Fixing URL slug for car:', car.id)

      // Generate a proper URL slug from the car name
      const baseSlug = car.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // Make it unique by adding a timestamp
      const uniqueSlug = `${baseSlug}-${Date.now()}`

      // Update the car with the new URL slug
      const { data, error } = await supabase
        .from('cars')
        .update({ url_slug: uniqueSlug })
        .eq('id', carId)
        .select()
        .single()

      if (error) {
        console.error('Error updating URL slug:', error)
        return null
      }

      console.log('URL slug fixed:', uniqueSlug)
      return data
    }

    return car
  } catch (error) {
    console.error('Error fixing URL slug:', error)
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
    // First, delete all photos from storage
    const photosDeleted = await deleteAllCarPhotos(carId)
    if (!photosDeleted) {
      console.warn(
        `Failed to delete photos for car ${carId}, but continuing with car deletion`
      )
    }

    // Then delete the car record
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

// Like-related functions
export async function likeCarClient(
  carId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('car_likes')
    .insert({ car_id: carId, user_id: userId })

  if (error) {
    console.error('Error liking car:', error)
    throw new Error('Failed to like car')
  }
}

export async function unlikeCarClient(
  carId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('car_likes')
    .delete()
    .eq('car_id', carId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error unliking car:', error)
    throw new Error('Failed to unlike car')
  }
}

export async function hasUserLikedCarClient(
  carId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('car_likes')
    .select('id')
    .eq('car_id', carId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    console.error('Error checking if user liked car:', error)
    throw new Error('Failed to check like status')
  }

  return !!data
}

export async function getCarLikeCountClient(carId: string): Promise<number> {
  const { data, error } = await supabase
    .from('cars')
    .select('like_count')
    .eq('id', carId)
    .single()

  if (error) {
    console.error('Error getting car like count:', error)
    throw new Error('Failed to get like count')
  }

  return data.like_count || 0
}

export async function getAllCarsClient(): Promise<Car[] | null> {
  try {
    // Get all cars first
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })

    if (carsError) {
      console.error('Error fetching cars:', carsError)
      return null
    }

    if (!cars || cars.length === 0) {
      return []
    }

    // Get all unique user IDs from the cars
    const userIds = [...new Set(cars.map(car => car.user_id))]

    // Get profiles for all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      // Return cars without profile data
      return cars
    }

    // Create a map of user_id to profile for quick lookup
    const profileMap = new Map()
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile)
      })
    }

    // Attach profile data to cars
    const carsWithProfiles = cars.map(car => ({
      ...car,
      profiles: profileMap.get(car.user_id) || null,
    }))

    return carsWithProfiles
  } catch (error) {
    console.error('Error fetching all cars:', error)
    return null
  }
}
