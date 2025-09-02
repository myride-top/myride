import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface PlatformStats {
  totalCars: number
  totalUsers: number
  totalLikes: number
  averageRating: number
}

export async function getPlatformStatsServer(): Promise<PlatformStats> {
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
    // Get total cars
    const { count: carCount, error: carError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })

    if (carError) {
    }

    // Get total users (profiles)
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (userError) {
    }

    // Get total likes
    const { count: likeCount, error: likeError } = await supabase
      .from('car_likes')
      .select('*', { count: 'exact', head: true })

    if (likeError) {
    }

    // Calculate average rating (we'll use a placeholder for now since we don't have ratings table)
    const averageRating = 4.9 // Placeholder - you can implement real rating system later

    return {
      totalCars: carCount || 0,
      totalUsers: userCount || 0,
      totalLikes: likeCount || 0,
      averageRating,
    }
  } catch {
    return {
      totalCars: 0,
      totalUsers: 0,
      totalLikes: 0,
      averageRating: 4.9,
    }
  }
}
