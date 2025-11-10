'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/card'
import { Button } from '@/components/ui/button-enhanced'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw,
  Calendar,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Users,
  BarChart3,
} from 'lucide-react'

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

interface AnalyticsDashboardProps {
  className?: string
}

export const AnalyticsDashboard = ({
  className = '',
}: AnalyticsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [carPerformance, setCarPerformance] = useState<CarPerformance[]>([])
  const [eventPerformance, setEventPerformance] = useState<EventPerformance[]>(
    []
  )
  const [timeRange, setTimeRange] = useState('6m')

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(
    async (range?: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const timeRangeToUse = range || timeRange
        const response = await fetch(
          `/api/analytics?timeRange=${timeRangeToUse}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const result = await response.json()
        setCarPerformance(result.carPerformance || [])
        setEventPerformance(result.eventPerformance || [])
        if (range) {
          setTimeRange(range)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching analytics:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [timeRange]
  )

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  const handleTimeRangeChange = (range: string) => {
    fetchAnalyticsData(range)
  }

  const handleRefresh = async () => {
    await fetchAnalyticsData()
  }

  const getTimeRangeLabel = (range: string) => {
    const labels: Record<string, string> = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '3m': 'Last 3 months',
      '6m': 'Last 6 months',
      '1y': 'Last year',
    }
    return labels[range] || range
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='text-red-500 mb-4'>
            <svg
              className='h-12 w-12 mx-auto'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-semibold mb-2'>
            Error Loading Analytics
          </h3>
          <p className='text-muted-foreground mb-4'>{error}</p>
          <Button onClick={handleRefresh} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!carPerformance.length && !eventPerformance.length) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='text-muted-foreground mb-4'>
            <svg
              className='h-16 w-16 mx-auto'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-semibold mb-2'>No Analytics Data</h3>
          <p className='text-muted-foreground'>
            Start by adding some cars or events to see analytics data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* New Header Design */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8'>
        <div className='relative z-10'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6'>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <div className='p-3 bg-primary/10 rounded-xl'>
                  <BarChart3 className='h-8 w-8 text-primary' />
                </div>
                <div>
                  <h1 className='text-4xl font-bold tracking-tight'>
                    Analytics Dashboard
                  </h1>
                  <p className='text-muted-foreground text-lg'>
                    Track performance of your cars and events
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className='w-48 bg-background/80 backdrop-blur-sm'>
                  <Calendar className='h-4 w-4 mr-2' />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7d'>Last 7 days</SelectItem>
                  <SelectItem value='30d'>Last 30 days</SelectItem>
                  <SelectItem value='3m'>Last 3 months</SelectItem>
                  <SelectItem value='6m'>Last 6 months</SelectItem>
                  <SelectItem value='1y'>Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleRefresh}
                variant='outline'
                size='sm'
                className='bg-background/80 backdrop-blur-sm'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Refresh
              </Button>
            </div>
          </div>
        </div>
        <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2' />
      </div>

      {/* Your Cars */}
      {carPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl flex items-center gap-2'>
              <Eye className='h-6 w-6 text-primary' />
              Your Cars
            </CardTitle>
            <CardDescription className='mt-2'>
              Your cars performance for{' '}
              {getTimeRangeLabel(timeRange).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {carPerformance.slice(0, 10).map(car => (
                <div
                  key={car.id}
                  className='group relative flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 hover:shadow-md transition-all duration-200'
                >
                  {/* Car Image */}
                  {car.image && (
                    <div className='flex-shrink-0'>
                      <img
                        src={car.image}
                        alt={car.name}
                        className='w-20 h-20 rounded-xl object-cover border-2 border-border shadow-md group-hover:scale-105 transition-transform duration-200'
                      />
                    </div>
                  )}

                  {/* Car Info */}
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-bold text-lg truncate'>{car.name}</h3>
                    <div className='flex items-center gap-4 mt-2 flex-wrap'>
                      <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <Eye className='h-4 w-4' />
                        <span>{car.views.toLocaleString()} views</span>
                      </div>
                      <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <Heart className='h-4 w-4' />
                        <span>{car.likes.toLocaleString()}</span>
                      </div>
                      <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <Share2 className='h-4 w-4' />
                        <span>{car.shares.toLocaleString()}</span>
                      </div>
                      <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <MessageCircle className='h-4 w-4' />
                        <span>{car.comments.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Events */}
      {eventPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl flex items-center gap-2'>
              <Calendar className='h-6 w-6 text-primary' />
              Your Events
            </CardTitle>
            <CardDescription className='mt-2'>
              Your events performance for{' '}
              {getTimeRangeLabel(timeRange).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {eventPerformance.map(event => (
                <div
                  key={event.id}
                  className='group relative flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 hover:shadow-md transition-all duration-200'
                >
                  {/* Event Icon */}
                  <div className='flex-shrink-0 p-3 bg-primary/10 rounded-xl'>
                    <Calendar className='h-8 w-8 text-primary' />
                  </div>

                  {/* Event Info */}
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-bold text-lg truncate'>
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className='text-sm text-muted-foreground mt-1 line-clamp-1'>
                        {event.description}
                      </p>
                    )}
                    <div className='flex items-center gap-4 mt-2 flex-wrap'>
                      <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <Eye className='h-4 w-4' />
                        <span>{event.views.toLocaleString()} views</span>
                      </div>
                      <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <Users className='h-4 w-4' />
                        <span>
                          {event.attendees.toLocaleString()} attendees
                        </span>
                      </div>
                      <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <Share2 className='h-4 w-4' />
                        <span>{event.shares.toLocaleString()} shares</span>
                      </div>
                      <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                        <Calendar className='h-4 w-4' />
                        <span>
                          {new Date(event.event_date).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
