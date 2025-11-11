import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface AnalyticsData {
  views: number
  likes: number
  shares: number
  comments: number
  viewsChange: number
  likesChange: number
  sharesChange: number
  commentsChange: number
}

export interface CarPerformance {
  id: string
  name: string
  views: number
  likes: number
  shares: number
  comments: number
  engagement: number
  image?: string
}

export interface EventPerformance {
  id: string
  title: string
  views: number
  attendees: number
  shares: number
  event_date: string
  description?: string
}

export interface TimeRangeData {
  current: AnalyticsData
  previous: AnalyticsData
}

export async function getAnalyticsData(
  userId: string,
  timeRange: string = '6m'
): Promise<AnalyticsData> {
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
    // Get current period data
    const currentPeriod = getTimeRangeDates(timeRange)
    console.log(`Analytics: Fetching data for timeRange: ${timeRange}`, {
      start: currentPeriod.start.toISOString(),
      end: currentPeriod.end.toISOString(),
    })

    // Get cars for this user
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .eq('user_id', userId)

    if (carsError || !cars) {
      return {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        viewsChange: 0,
        likesChange: 0,
        sharesChange: 0,
        commentsChange: 0,
      }
    }

    const carIds = cars.map(car => car.id)

    // Get current period stats
    const currentStats = await getStatsForPeriod(
      supabase,
      carIds,
      currentPeriod.start,
      currentPeriod.end
    )

    // Get previous period stats for comparison
    const previousPeriod = getPreviousPeriod(
      currentPeriod.start,
      currentPeriod.end
    )
    const previousStats = await getStatsForPeriod(
      supabase,
      carIds,
      previousPeriod.start,
      previousPeriod.end
    )

    // Calculate changes
    const viewsChange = calculateChange(currentStats.views, previousStats.views)
    const likesChange = calculateChange(currentStats.likes, previousStats.likes)
    const sharesChange = calculateChange(
      currentStats.shares,
      previousStats.shares
    )
    const commentsChange = calculateChange(
      currentStats.comments,
      previousStats.comments
    )

    return {
      views: currentStats.views,
      likes: currentStats.likes,
      shares: currentStats.shares,
      comments: currentStats.comments,
      viewsChange,
      likesChange,
      sharesChange,
      commentsChange,
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return {
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      viewsChange: 0,
      likesChange: 0,
      sharesChange: 0,
      commentsChange: 0,
    }
  }
}

export async function getCarPerformance(
  userId: string,
  timeRange: string = '6m'
): Promise<CarPerformance[]> {
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
    const currentPeriod = getTimeRangeDates(timeRange)

    // Get cars with their current stats
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select(
        'id, name, main_photo_url, like_count, view_count, share_count, comment_count'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (carsError || !cars) {
      return []
    }

    // Get detailed stats for the time period
    const carPerformance: CarPerformance[] = []

    for (const car of cars) {
      const carIds = [car.id]

      const periodStats = await getStatsForPeriod(
        supabase,
        carIds,
        currentPeriod.start,
        currentPeriod.end
      )

      // Calculate engagement rate (likes + shares + comments) / views * 100
      const engagement =
        periodStats.views > 0
          ? ((periodStats.likes + periodStats.shares + periodStats.comments) /
              periodStats.views) *
            100
          : 0

      carPerformance.push({
        id: car.id,
        name: car.name,
        views: periodStats.views,
        likes: periodStats.likes,
        shares: periodStats.shares,
        comments: periodStats.comments,
        engagement: Math.round(engagement * 100) / 100, // Round to 2 decimal places
        image: car.main_photo_url || undefined,
      })
    }

    // Sort by engagement (highest first)
    return carPerformance.sort((a, b) => b.engagement - a.engagement)
  } catch (error) {
    console.error('Error fetching car performance:', error)
    return []
  }
}

async function getStatsForPeriod(
  supabase: SupabaseClient,
  carIds: string[],
  startDate: Date,
  endDate: Date
): Promise<{ views: number; likes: number; shares: number; comments: number }> {
  const startISO = startDate.toISOString()
  const endISO = endDate.toISOString()

  console.log(`getStatsForPeriod: Querying for carIds: ${carIds.join(', ')}`, {
    start: startISO,
    end: endISO,
  })

  // Get views
  const { count: views } = await supabase
    .from('car_views')
    .select('*', { count: 'exact', head: true })
    .in('car_id', carIds)
    .gte('created_at', startISO)
    .lte('created_at', endISO)

  // Get likes
  const { count: likes } = await supabase
    .from('car_likes')
    .select('*', { count: 'exact', head: true })
    .in('car_id', carIds)
    .gte('created_at', startISO)
    .lte('created_at', endISO)

  // Get shares
  const { count: shares } = await supabase
    .from('car_shares')
    .select('*', { count: 'exact', head: true })
    .in('car_id', carIds)
    .gte('created_at', startISO)
    .lte('created_at', endISO)

  // Get comments
  const { count: comments } = await supabase
    .from('car_comments')
    .select('*', { count: 'exact', head: true })
    .in('car_id', carIds)
    .gte('created_at', startISO)
    .lte('created_at', endISO)

  const result = {
    views: views || 0,
    likes: likes || 0,
    shares: shares || 0,
    comments: comments || 0,
  }

  console.log(`getStatsForPeriod: Returning stats:`, result)
  return result
}

function getTimeRangeDates(timeRange: string): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (timeRange) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '3m':
      start.setMonth(end.getMonth() - 3)
      break
    case '6m':
      start.setMonth(end.getMonth() - 6)
      break
    case '1y':
      start.setFullYear(end.getFullYear() - 1)
      break
    default:
      start.setMonth(end.getMonth() - 6) // Default to 6 months
  }

  return { start, end }
}

function getPreviousPeriod(start: Date, end: Date): { start: Date; end: Date } {
  const duration = end.getTime() - start.getTime()
  const previousEnd = new Date(start.getTime())
  const previousStart = new Date(start.getTime() - duration)

  return { start: previousStart, end: previousEnd }
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

export async function getEventPerformance(
  userId: string,
  timeRange: string = '6m'
): Promise<EventPerformance[]> {
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
    const currentPeriod = getTimeRangeDates(timeRange)

    // Get all events created by this user (we'll filter stats by time range)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, description, event_date')
      .eq('created_by', userId)
      .order('event_date', { ascending: false })

    if (eventsError || !events) {
      return []
    }

    // Get detailed stats for each event
    const eventPerformance: EventPerformance[] = []

    for (const event of events) {
      // Get attendees count
      const { count: attendees } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('attending', true)
        .gte('created_at', currentPeriod.start.toISOString())
        .lte('created_at', currentPeriod.end.toISOString())

      // Get views count
      const { count: views } = await supabase
        .from('event_views')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .gte('created_at', currentPeriod.start.toISOString())
        .lte('created_at', currentPeriod.end.toISOString())

      // Get shares count
      const { count: shares } = await supabase
        .from('event_shares')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .gte('created_at', currentPeriod.start.toISOString())
        .lte('created_at', currentPeriod.end.toISOString())

      eventPerformance.push({
        id: event.id,
        title: event.title,
        views: views || 0,
        attendees: attendees || 0,
        shares: shares || 0,
        event_date: event.event_date,
        description: event.description || undefined,
      })
    }

    // Sort by attendees (highest first), then by event date
    return eventPerformance.sort((a, b) => {
      if (b.attendees !== a.attendees) {
        return b.attendees - a.attendees
      }
      return new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    })
  } catch (error) {
    console.error('Error fetching event performance:', error)
    return []
  }
}
