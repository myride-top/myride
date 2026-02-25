import { createClient } from '@/lib/supabase/server'

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

interface AnalyticsSummaryRow {
  views: number | string | null
  likes: number | string | null
  shares: number | string | null
  comments: number | string | null
}

interface CarPerformanceRow {
  id: string
  name: string
  views: number | string | null
  likes: number | string | null
  shares: number | string | null
  comments: number | string | null
  engagement: number | string | null
  image: string | null
}

interface EventPerformanceRow {
  id: string
  title: string
  views: number | string | null
  attendees: number | string | null
  shares: number | string | null
  event_date: string
  description: string | null
}

const ZERO_ANALYTICS: AnalyticsData = {
  views: 0,
  likes: 0,
  shares: 0,
  comments: 0,
  viewsChange: 0,
  likesChange: 0,
  sharesChange: 0,
  commentsChange: 0,
}

const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const getTimeRangeDates = (timeRange: string): { start: Date; end: Date } => {
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
      start.setMonth(end.getMonth() - 6)
  }

  return { start, end }
}

const getPreviousPeriod = (
  start: Date,
  end: Date
): { start: Date; end: Date } => {
  const duration = end.getTime() - start.getTime()
  const previousEnd = new Date(start.getTime())
  const previousStart = new Date(start.getTime() - duration)

  return { start: previousStart, end: previousEnd }
}

const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }

  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

const getSummaryForPeriod = async (
  userId: string,
  start: Date,
  end: Date
): Promise<AnalyticsSummaryRow> => {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_user_analytics_summary', {
    p_user_id: userId,
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  })

  if (error) {
    throw error
  }

  const rows = (data as AnalyticsSummaryRow[] | null) ?? []
  return rows[0] ?? { views: 0, likes: 0, shares: 0, comments: 0 }
}

export async function getAnalyticsData(
  userId: string,
  timeRange: string = '6m'
): Promise<AnalyticsData> {
  try {
    const currentPeriod = getTimeRangeDates(timeRange)
    const previousPeriod = getPreviousPeriod(currentPeriod.start, currentPeriod.end)

    const [currentSummary, previousSummary] = await Promise.all([
      getSummaryForPeriod(userId, currentPeriod.start, currentPeriod.end),
      getSummaryForPeriod(userId, previousPeriod.start, previousPeriod.end),
    ])

    const currentViews = toNumber(currentSummary.views)
    const currentLikes = toNumber(currentSummary.likes)
    const currentShares = toNumber(currentSummary.shares)
    const currentComments = toNumber(currentSummary.comments)

    const previousViews = toNumber(previousSummary.views)
    const previousLikes = toNumber(previousSummary.likes)
    const previousShares = toNumber(previousSummary.shares)
    const previousComments = toNumber(previousSummary.comments)

    return {
      views: currentViews,
      likes: currentLikes,
      shares: currentShares,
      comments: currentComments,
      viewsChange: calculateChange(currentViews, previousViews),
      likesChange: calculateChange(currentLikes, previousLikes),
      sharesChange: calculateChange(currentShares, previousShares),
      commentsChange: calculateChange(currentComments, previousComments),
    }
  } catch {
    return ZERO_ANALYTICS
  }
}

export async function getCarPerformance(
  userId: string,
  timeRange: string = '6m'
): Promise<CarPerformance[]> {
  try {
    const { start, end } = getTimeRangeDates(timeRange)
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_user_car_performance', {
      p_user_id: userId,
      p_start: start.toISOString(),
      p_end: end.toISOString(),
    })

    if (error) {
      throw error
    }

    const rows = (data as CarPerformanceRow[] | null) ?? []

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      views: toNumber(row.views),
      likes: toNumber(row.likes),
      shares: toNumber(row.shares),
      comments: toNumber(row.comments),
      engagement: toNumber(row.engagement),
      image: row.image ?? undefined,
    }))
  } catch {
    return []
  }
}

export async function getEventPerformance(
  userId: string,
  timeRange: string = '6m'
): Promise<EventPerformance[]> {
  try {
    const { start, end } = getTimeRangeDates(timeRange)
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_user_event_performance', {
      p_user_id: userId,
      p_start: start.toISOString(),
      p_end: end.toISOString(),
    })

    if (error) {
      throw error
    }

    const rows = (data as EventPerformanceRow[] | null) ?? []

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      views: toNumber(row.views),
      attendees: toNumber(row.attendees),
      shares: toNumber(row.shares),
      event_date: row.event_date,
      description: row.description ?? undefined,
    }))
  } catch {
    return []
  }
}
