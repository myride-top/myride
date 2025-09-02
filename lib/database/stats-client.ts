import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface PlatformStats {
  totalCars: number
  totalUsers: number
  totalLikes: number
  averageRating: number
}

export async function getPlatformStats(): Promise<PlatformStats> {
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
    // In a real app, you'd have a ratings table and calculate the average
    const averageRating = 4.9 // Placeholder - you can implement real rating system later

    return {
      totalCars: carCount || 0,
      totalUsers: userCount || 0,
      totalLikes: likeCount || 0,
      averageRating,
    }
  } catch (error) {
    return {
      totalCars: 0,
      totalUsers: 0,
      totalLikes: 0,
      averageRating: 4.9,
    }
  }
}

// Get stats for a specific user
export async function getUserStats(userId: string) {
  try {
    // Get user's car count
    const { count: carCount, error: carError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (carError) {
    }

    // Get total likes given by user
    const { count: likesGiven, error: likeError } = await supabase
      .from('car_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (likeError) {
    }

    return {
      carCount: carCount || 0,
      likesGiven: likesGiven || 0,
    }
  } catch (error) {
    return {
      carCount: 0,
      likesGiven: 0,
    }
  }
}

// Get recent activity stats
export async function getRecentActivityStats() {
  try {
    // Get cars created in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentCars, error: carError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (carError) {
    }

    // Get likes given in the last 30 days
    const { count: recentLikes, error: likeError } = await supabase
      .from('car_likes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (likeError) {
    }

    return {
      recentCars: recentCars || 0,
      recentLikes: recentLikes || 0,
    }
  } catch {
    return {
      recentCars: 0,
      recentLikes: 0,
    }
  }
}

// Payment logging functions for analytics
export async function logPaymentSuccess(
  userId: string,
  amount: number,
  type: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('payment_logs').insert({
      user_id: userId,
      amount: amount,
      type: type,
      status: 'success',
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error logging payment success:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error logging payment success:', error)
    return false
  }
}

export async function logPaymentFailure(
  userId: string,
  amount: number,
  type: string,
  errorMessage: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('payment_logs').insert({
      user_id: userId,
      amount: amount,
      type: type,
      status: 'failed',
      error_message: errorMessage,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error logging payment failure:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error logging payment failure:', error)
    return false
  }
}
