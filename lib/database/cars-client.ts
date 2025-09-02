import { createBrowserClient } from '@supabase/ssr'
import { Car, CarPhoto, CarComment } from '@/lib/types/database'
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
    // First get cars with basic info
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (carsError) {
      return null
    }

    if (!cars || cars.length === 0) {
      return []
    }

    // Get like counts for all cars
    const carIds = cars.map(car => car.id)
    const { data: likeCounts, error: likeError } = await supabase
      .from('car_likes')
      .select('car_id')
      .in('car_id', carIds)

    if (likeError) {
      // Fallback to cars table like_count if car_likes query fails
      return cars
    }

    // Calculate like counts for each car
    const likeCountMap = new Map<string, number>()
    likeCounts?.forEach(like => {
      const currentCount = likeCountMap.get(like.car_id) || 0
      likeCountMap.set(like.car_id, currentCount + 1)
    })

    // Update cars with calculated like counts
    const carsWithLikes = cars.map(car => ({
      ...car,
      like_count: likeCountMap.get(car.id) || 0,
    }))

    return carsWithLikes
  } catch {
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
      return 0
    }

    return count || 0
  } catch {
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
      return false
    }

    const currentCarCount = count || 0
    const maxAllowedCars = 1 + carSlotsPurchased // 1 free + purchased slots

    return currentCarCount < maxAllowedCars
  } catch {
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
      return false
    }

    const currentCarCount = count || 0
    const maxAllowedCars = 1 + carSlotsPurchased // 1 free + purchased slots

    return currentCarCount < maxAllowedCars
  } catch {
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
      return null
    }

    return data
  } catch {
    return null
  }
}

export async function getCarByNameAndUsernameClient(
  carName: string,
  username: string
): Promise<Car | null> {
  try {
    // First get the profile to get the user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (profileError || !profileData) {
      return null
    }

    // Strategy 1: Try exact match first
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('name', carName)
        .eq('user_id', profileData.id)
        .single()

      if (!error && data) {
        return data
      }
    } catch {}

    // Strategy 2: Try case-insensitive exact match
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .ilike('name', carName)
        .eq('user_id', profileData.id)
        .single()

      if (!error && data) {
        return data
      }
    } catch {}

    // Strategy 3: Try partial match (most flexible)
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .ilike('name', `%${carName}%`)
        .eq('user_id', profileData.id)
        .single()

      if (!error && data) {
        return data
      }
    } catch {}

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
        return data
      }
    } catch {}

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
        return data
      }
    } catch {}

    return null
  } catch {
    return null
  }
}

export async function getCarByUrlSlugAndUsernameClient(
  urlSlug: string,
  username: string
): Promise<Car | null> {
  try {
    // First get the profile to get the user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (profileError || !profileData) {
      return null
    }

    // Get the car by url_slug (cars should be publicly viewable by url_slug)
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('url_slug', urlSlug)
      .single()

    if (error) {
      return null
    }

    // Verify that the car belongs to the profile we're looking up
    if (data.user_id !== profileData.id) {
      // Instead of failing, let's try to find the correct profile for this car
      const { data: correctProfile, error: profileLookupError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user_id)
        .single()

      if (profileLookupError || !correctProfile) {
        return null
      }

      // The car exists but belongs to a different username
      // We could either redirect to the correct URL or show an error

      // For now, return null to trigger the error page
      // In the future, we could redirect to the correct URL
      return null
    }

    // Get the real-time like count from car_likes table
    try {
      const { count: likeCount, error: likeError } = await supabase
        .from('car_likes')
        .select('*', { count: 'exact', head: true })
        .eq('car_id', data.id)

      if (likeError) {
        // Fallback to cars table like_count if car_likes query fails
        return data
      }

      // Update car with real-time like count
      const carWithLikeCount = {
        ...data,
        like_count: likeCount || 0,
      }

      return carWithLikeCount
    } catch {
      // Fallback to cars table like_count
      return data
    }
  } catch {
    return null
  }
}

// New function to get car by just url_slug (for public access)
export async function getCarByUrlSlugClient(
  urlSlug: string
): Promise<Car | null> {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('url_slug', urlSlug)
      .single()

    if (error) {
      return null
    }

    // Get the real-time like count from car_likes table
    try {
      const { count: likeCount, error: likeError } = await supabase
        .from('car_likes')
        .select('*', { count: 'exact', head: true })
        .eq('car_id', data.id)

      if (likeError) {
        return data
      }

      // Update car with real-time like count
      const carWithLikeCount = {
        ...data,
        like_count: likeCount || 0,
      }

      return carWithLikeCount
    } catch {
      return data
    }
  } catch {
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
      return null
    }

    return data
  } catch {
    return null
  }
}

export async function fixCarUrlSlug(carId: string): Promise<Car | null> {
  try {
    // Get the car first
    const car = await getCarByIdClient(carId)
    if (!car) {
      return null
    }

    // Check if the current url_slug is a UUID
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        car.url_slug
      )
    ) {
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
        return null
      }

      return data
    }

    return car
  } catch {
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
      return null
    }

    return data
  } catch {
    return null
  }
}

export async function deleteCarClient(carId: string): Promise<boolean> {
  try {
    // First, delete all photos from storage
    const photosDeleted = await deleteAllCarPhotos(carId)
    if (!photosDeleted) {
    }

    // Then delete the car record
    const { error } = await supabase.from('cars').delete().eq('id', carId)

    if (error) {
      return false
    }

    return true
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    return null
  }
}

// Like-related functions
export async function likeCarClient(
  carId: string,
  userId: string
): Promise<void> {
  // Insert the like
  const { error: likeError } = await supabase
    .from('car_likes')
    .insert({ car_id: carId, user_id: userId })

  if (likeError) {
    throw new Error('Failed to like car')
  }

  // Note: We no longer update the cars.like_count field since we calculate it from car_likes table
}

export async function unlikeCarClient(
  carId: string,
  userId: string
): Promise<void> {
  // Delete the like
  const { error: unlikeError } = await supabase
    .from('car_likes')
    .delete()
    .eq('car_id', carId)
    .eq('user_id', userId)

  if (unlikeError) {
    throw new Error('Failed to unlike car')
  }

  // Note: We no longer update the cars.like_count field since we calculate it from car_likes table
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
    throw new Error('Failed to check like status')
  }

  return !!data
}

export async function getCarLikeCountClient(carId: string): Promise<number> {
  // Calculate like count from car_likes table instead of relying on cars.like_count field
  const { count, error } = await supabase
    .from('car_likes')
    .select('*', { count: 'exact', head: true })
    .eq('car_id', carId)

  if (error) {
    // Fallback to cars table if car_likes query fails
    const { data: carData, error: carError } = await supabase
      .from('cars')
      .select('like_count')
      .eq('id', carId)
      .single()

    if (carError) {
      throw new Error('Failed to get like count')
    }

    return carData.like_count || 0
  }

  return count || 0
}

export async function getAllCarsClient(): Promise<Car[] | null> {
  try {
    // Get all cars first
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })

    if (carsError) {
      return null
    }

    if (!cars || cars.length === 0) {
      return []
    }

    // Get like counts for all cars
    const carIds = cars.map(car => car.id)
    const { data: likeCounts, error: likeError } = await supabase
      .from('car_likes')
      .select('car_id')
      .in('car_id', carIds)

    if (likeError) {
      // Continue without like counts if the query fails
    }

    // Calculate like counts for each car
    const likeCountMap = new Map<string, number>()
    likeCounts?.forEach(like => {
      const currentCount = likeCountMap.get(like.car_id) || 0
      likeCountMap.set(like.car_id, currentCount + 1)
    })

    // Get all unique user IDs from the cars
    const userIds = [...new Set(cars.map(car => car.user_id))]

    // Get profiles for all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', userIds)

    if (profilesError) {
      // Return cars without profile data but with like counts
      return cars.map(car => ({
        ...car,
        like_count: likeCountMap.get(car.id) || 0,
        profiles: null,
      }))
    }

    // Create a map of user_id to profile for quick lookup
    const profileMap = new Map()
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile)
      })
    }

    // Attach profile data and like counts to cars
    const carsWithProfilesAndLikes = cars.map(car => ({
      ...car,
      like_count: likeCountMap.get(car.id) || 0,
      profiles: profileMap.get(car.user_id) || null,
    }))

    return carsWithProfilesAndLikes
  } catch {
    return null
  }
}

// Premium Analytics Functions

export async function trackCarViewClient(
  carId: string,
  userId?: string,
  metadata?: {
    ipAddress?: string
    userAgent?: string
    referrer?: string
  }
): Promise<boolean> {
  try {
    const { error } = await supabase.from('car_views').insert({
      car_id: carId,
      user_id: userId || null,
      ip_address: metadata?.ipAddress || null,
      user_agent: metadata?.userAgent || null,
      referrer: metadata?.referrer || null,
    })

    if (error) {
      return false
    }

    // Update the car's view count
    await updateCarViewCount(carId)
    return true
  } catch {
    return false
  }
}

export async function trackCarShareClient(
  carId: string,
  platform:
    | 'twitter'
    | 'facebook'
    | 'instagram'
    | 'whatsapp'
    | 'telegram'
    | 'copy_link'
    | 'other',
  userId?: string,
  metadata?: {
    shareUrl?: string
    ipAddress?: string
    userAgent?: string
  }
): Promise<boolean> {
  try {
    const { error } = await supabase.from('car_shares').insert({
      car_id: carId,
      user_id: userId || null,
      share_platform: platform,
      share_url: metadata?.shareUrl || null,
      ip_address: metadata?.ipAddress || null,
      user_agent: metadata?.userAgent || null,
    })

    if (error) {
      return false
    }

    // Update the car's share count
    await updateCarShareCount(carId)
    return true
  } catch {
    return false
  }
}

export async function addCarCommentClient(
  carId: string,
  userId: string,
  content: string,
  parentCommentId?: string
): Promise<CarComment | null> {
  try {
    // Check if this is a reply to an existing comment
    if (parentCommentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('car_comments')
        .select('id')
        .eq('id', parentCommentId)
        .eq('car_id', carId)
        .single()

      if (parentError || !parentComment) {
        return null
      }
    }

    const { data, error } = await supabase
      .from('car_comments')
      .insert({
        car_id: carId,
        user_id: userId,
        content,
        parent_comment_id: parentCommentId || null,
        is_edited: false,
      })
      .select()
      .single()

    if (error) {
      return null
    }

    // Update the car's comment count
    await updateCarCommentCount(carId)
    return data
  } catch {
    return null
  }
}

export async function getCarCommentsClient(
  carId: string,
  limit: number = 100, // Increased limit to get all comments and replies
  offset: number = 0
): Promise<CarComment[] | null> {
  try {
    const { data, error } = await supabase
      .from('car_comments')
      .select(
        `
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('car_id', carId)
      .order('created_at', { ascending: true }) // Chronological order for better threading
      .range(offset, offset + limit - 1)

    if (error) {
      return null
    }

    if (data && data.length > 0) {
    }

    return data
  } catch {
    return null
  }
}

// Helper functions to update car counts
async function updateCarViewCount(carId: string): Promise<void> {
  try {
    const { count, error } = await supabase
      .from('car_views')
      .select('*', { count: 'exact', head: true })
      .eq('car_id', carId)

    if (error) {
      return
    }

    await supabase
      .from('cars')
      .update({ view_count: count || 0 })
      .eq('id', carId)
  } catch {}
}

async function updateCarShareCount(carId: string): Promise<void> {
  try {
    const { count, error } = await supabase
      .from('car_shares')
      .select('*', { count: 'exact', head: true })
      .eq('car_id', carId)

    if (error) {
      return
    }

    await supabase
      .from('cars')
      .update({ share_count: count || 0 })
      .eq('id', carId)
  } catch {}
}

async function updateCarCommentCount(carId: string): Promise<void> {
  try {
    // Get the total count of comments for this car
    const { count, error } = await supabase
      .from('car_comments')
      .select('*', { count: 'exact', head: true })
      .eq('car_id', carId)

    if (error) {
      console.error('Error getting comment count:', error)
      return
    }

    // Update the car's comment count
    const { error: updateError } = await supabase
      .from('cars')
      .update({ comment_count: count || 0 })
      .eq('id', carId)

    if (updateError) {
      console.error('Error updating car comment count:', updateError)
      return
    }

    console.log(`Updated car ${carId} comment count to ${count || 0}`)
  } catch (error) {
    console.error('Error in updateCarCommentCount:', error)
  }
}

export async function syncCarCommentCount(carId: string): Promise<boolean> {
  try {
    await updateCarCommentCount(carId)
    return true
  } catch (error) {
    console.error('Error syncing car comment count:', error)
    return false
  }
}

export async function deleteCarCommentClient(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    // First get the car_id before deleting the comment
    const { data: comment, error: fetchError } = await supabase
      .from('car_comments')
      .select('car_id')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment) {
      return false
    }

    const { error } = await supabase
      .from('car_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId)

    if (error) {
      return false
    }

    // Update the car's comment count
    await updateCarCommentCount(comment.car_id)

    return true
  } catch {
    return false
  }
}

export async function deleteCarCommentAsOwnerClient(
  commentId: string,
  carId: string,
  ownerId: string
): Promise<boolean> {
  try {
    // First verify the user owns the car
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id')
      .eq('id', carId)
      .eq('user_id', ownerId)
      .single()

    if (carError || !car) {
      return false
    }

    // Delete the comment
    const { error } = await supabase
      .from('car_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      return false
    }

    // Update the car's comment count
    await updateCarCommentCount(carId)

    return true
  } catch {
    return false
  }
}

export async function pinCarCommentClient(
  commentId: string,
  carId: string,
  ownerId: string
): Promise<boolean> {
  try {
    // First verify the user owns the car
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id')
      .eq('id', carId)
      .eq('user_id', ownerId)
      .single()

    if (carError || !car) {
      return false
    }

    // Unpin all other comments first
    const { error: unpinError } = await supabase
      .from('car_comments')
      .update({ is_pinned: false })
      .eq('car_id', carId)

    if (unpinError) {
      return false
    }

    // Pin the selected comment
    const { error } = await supabase
      .from('car_comments')
      .update({ is_pinned: true })
      .eq('id', commentId)

    if (error) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export async function unpinCarCommentClient(
  carId: string,
  ownerId: string
): Promise<boolean> {
  try {
    // First verify the user owns the car
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id')
      .eq('id', carId)
      .eq('user_id', ownerId)
      .single()

    if (carError || !car) {
      return false
    }

    // Unpin all comments
    const { error } = await supabase
      .from('car_comments')
      .update({ is_pinned: false })
      .eq('car_id', carId)

    if (error) {
      return false
    }

    return true
  } catch {
    return false
  }
}

// Comment like functions
export async function likeCommentClient(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    // Check if user already liked this comment
    const { data: existingLike, error: checkError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code === '42P01') {
      console.warn('Comment likes table does not exist yet')
      return false
    }

    if (existingLike) {
      // User already liked this comment
      return true
    }

    // Insert the like
    const { error: likeError } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: userId })

    if (likeError) {
      if (likeError.code === '42P01') {
        console.warn('Comment likes table does not exist yet')
        return false
      }
      throw new Error('Failed to like comment')
    }

    return true
  } catch (error) {
    console.error('Error liking comment:', error)
    return false
  }
}

export async function unlikeCommentClient(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)

    if (error) {
      throw new Error('Failed to unlike comment')
    }

    return true
  } catch (error) {
    console.error('Error unliking comment:', error)
    return false
  }
}

export async function hasUserLikedCommentClient(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      // Check if it's a table not found error (code 42P01)
      if (error.code === '42P01') {
        console.warn('Comment likes table does not exist yet')
        return false
      }
      // Log the specific error for debugging
      console.error('Error checking like status:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking comment like status:', error)
    return false
  }
}

export async function getCommentLikeCountClient(
  commentId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId)

    if (error) {
      // Check if it's a table not found error (code 42P01)
      if (error.code === '42P01') {
        console.warn('Comment likes table does not exist yet')
        return 0
      }
      // Log the specific error for debugging
      console.error(
        'Error getting comment like count for commentId:',
        commentId,
        'Error:',
        error
      )
      throw new Error('Failed to get comment like count')
    }

    return count || 0
  } catch (error) {
    console.error('Error getting comment like count:', error)
    return 0
  }
}

export async function getCommentLikesWithProfilesClient(
  commentId: string
): Promise<
  {
    user_id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }[]
> {
  try {
    const { data, error } = await supabase
      .from('comment_likes')
      .select(
        `
        user_id,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq('comment_id', commentId)

    if (error) {
      if (error.code === '42P01') {
        console.warn('Comment likes table does not exist yet')
        return []
      }
      throw new Error('Failed to get comment likes with profiles')
    }

    if (!data) return []

    return data.map(like => ({
      user_id: like.user_id,
      username: like.profiles?.[0]?.username || 'Unknown User',
      full_name: like.profiles?.[0]?.full_name,
      avatar_url: like.profiles?.[0]?.avatar_url,
    }))
  } catch (error) {
    console.error('Error getting comment likes with profiles:', error)
    return []
  }
}
