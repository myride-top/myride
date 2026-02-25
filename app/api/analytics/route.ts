import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getAnalyticsData,
  getCarPerformance,
  getEventPerformance,
} from '@/lib/database/analytics'

const ALLOWED_TIME_RANGES = new Set(['7d', '30d', '3m', '6m', '1y'])

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const requestedTimeRange = searchParams.get('timeRange') || '6m'
    const timeRange = ALLOWED_TIME_RANGES.has(requestedTimeRange)
      ? requestedTimeRange
      : '6m'

    // Fetch analytics data
    const [analyticsData, carPerformance, eventPerformance] = await Promise.all(
      [
        getAnalyticsData(user.id, timeRange),
        getCarPerformance(user.id, timeRange),
        getEventPerformance(user.id, timeRange),
      ]
    )

    const response = NextResponse.json({
      data: analyticsData,
      carPerformance,
      eventPerformance,
      timeRange,
    })

    // Add caching headers for analytics data (5 minutes cache)
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600')

    return response
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
