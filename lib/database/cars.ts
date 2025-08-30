import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Car } from '@/lib/types/database'
import { deleteAllCarPhotos } from '@/lib/storage/photos'

export async function getCarsByUser(userId: string): Promise<Car[] | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

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
}

export async function getCarById(carId: string): Promise<Car | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

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
}

export async function createCar(
  carData: Omit<Car, 'id' | 'created_at' | 'updated_at'>
): Promise<Car | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { data, error } = await supabase
    .from('cars')
    .insert(carData)
    .select()
    .single()

  if (error) {
    console.error('Error creating car:', error)
    return null
  }

  return data
}

export async function updateCar(
  carId: string,
  carData: Partial<Omit<Car, 'id' | 'created_at' | 'updated_at'>>
): Promise<Car | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { data, error } = await supabase
    .from('cars')
    .update(carData)
    .eq('id', carId)
    .select()
    .single()

  if (error) {
    console.error('Error updating car:', error)
    return null
  }

  return data
}

export async function deleteCar(carId: string): Promise<boolean> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

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

export async function getCarByUrlSlugAndUsername(
  urlSlug: string,
  username: string
): Promise<Car | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  try {
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

    // Get the car by url_slug (cars should be publicly viewable by url_slug)
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('url_slug', urlSlug)
      .single()

    if (error) {
      console.error('Error fetching car by URL slug:', error)
      return null
    }

    // Verify that the car belongs to the profile we're looking up
    if (data.user_id !== profileData.id) {
      console.error('Car found but belongs to different user:', {
        carUserId: data.user_id,
        profileUserId: profileData.id,
        urlSlug,
        username,
      })
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching car by URL slug:', error)
    return null
  }
}
