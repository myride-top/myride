'use client'

import React, { useState, useEffect } from 'react'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/card'
import Button from '@/components/common/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Download,
  RefreshCw,
  Filter,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

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

interface AnalyticsDashboardProps {
  className?: string
}

export default function AnalyticsDashboard({
  className = '',
}: AnalyticsDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [carPerformance, setCarPerformance] = useState<CarPerformance[]>([])
  const [timeRange, setTimeRange] = useState('6m')
  const [selectedCar, setSelectedCar] = useState<string>('all')

  // Fetch analytics data
  const fetchAnalyticsData = async (range?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const timeRangeToUse = range || timeRange
      console.log('Fetching analytics data for timeRange:', timeRangeToUse)
      const response = await fetch(`/api/analytics?timeRange=${timeRangeToUse}`)

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const result = await response.json()
      console.log('Analytics data received:', result)
      setData(result.data)
      setCarPerformance(result.carPerformance)
      if (range) {
        setTimeRange(range)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Generate chart data from car performance
  const generateChartData = () => {
    if (selectedCar === 'all') {
      return carPerformance
    }
    return carPerformance.filter(car => car.id === selectedCar)
  }

  const handleTimeRangeChange = (range: string) => {
    console.log('Time range changed to:', range)
    fetchAnalyticsData(range)
  }

  const handleRefresh = async () => {
    await fetchAnalyticsData()
  }

  const handleExport = () => {
    if (!data || !carPerformance.length) return

    const csvContent = generateCSV()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${timeRange}-${
      new Date().toISOString().split('T')[0]
    }.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateCSV = () => {
    const headers = [
      'Car Name',
      'Views',
      'Likes',
      'Shares',
      'Comments',
      'Engagement Rate (%)',
    ]
    const rows = carPerformance.map(car => [
      car.name,
      car.views,
      car.likes,
      car.shares,
      car.comments,
      car.engagement,
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return (
      <div
        className={`flex items-center gap-1 text-sm ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isPositive ? (
          <TrendingUp className='h-4 w-4' />
        ) : (
          <TrendingDown className='h-4 w-4' />
        )}
        <span>{Math.abs(change)}%</span>
      </div>
    )
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

  if (!data || !carPerformance.length) {
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
            Start by adding some cars to see analytics data.
          </p>
        </div>
      </div>
    )
  }

  const chartData = generateChartData()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Analytics Dashboard
          </h1>
          <p className='text-muted-foreground'>
            Track your car performance and engagement metrics
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={handleRefresh} variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button onClick={handleExport} variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <Filter className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Time Range:</span>
        </div>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className='w-32'>
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
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Views</CardTitle>
            <Eye className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {data.views.toLocaleString()}
            </div>
            {formatChange(data.viewsChange)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Likes</CardTitle>
            <Heart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {data.likes.toLocaleString()}
            </div>
            {formatChange(data.likesChange)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Shares</CardTitle>
            <Share2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {data.shares.toLocaleString()}
            </div>
            {formatChange(data.sharesChange)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Comments
            </CardTitle>
            <MessageCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {data.comments.toLocaleString()}
            </div>
            {formatChange(data.commentsChange)}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='performance'>Car Performance</TabsTrigger>
          <TabsTrigger value='trends'>Trends</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Engagement Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
                <CardDescription>
                  How your audience interacts with your cars
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Views', value: data.views, color: '#3b82f6' },
                        { name: 'Likes', value: data.likes, color: '#ef4444' },
                        {
                          name: 'Shares',
                          value: data.shares,
                          color: '#10b981',
                        },
                        {
                          name: 'Comments',
                          value: data.comments,
                          color: '#f59e0b',
                        },
                      ]}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {[
                        { name: 'Views', value: data.views, color: '#3b82f6' },
                        { name: 'Likes', value: data.likes, color: '#ef4444' },
                        {
                          name: 'Shares',
                          value: data.shares,
                          color: '#10b981',
                        },
                        {
                          name: 'Comments',
                          value: data.comments,
                          color: '#f59e0b',
                        },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
                <CardDescription>Current vs previous period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart
                    data={[
                      {
                        metric: 'Views',
                        current: data.views,
                        previous: data.views / (1 + data.viewsChange / 100),
                      },
                      {
                        metric: 'Likes',
                        current: data.likes,
                        previous: data.likes / (1 + data.likesChange / 100),
                      },
                      {
                        metric: 'Shares',
                        current: data.shares,
                        previous: data.shares / (1 + data.sharesChange / 100),
                      },
                      {
                        metric: 'Comments',
                        current: data.comments,
                        previous:
                          data.comments / (1 + data.commentsChange / 100),
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='metric' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey='current'
                      fill='#3b82f6'
                      name='Current Period'
                    />
                    <Bar
                      dataKey='previous'
                      fill='#94a3b8'
                      name='Previous Period'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          {/* Car Filter */}
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium'>Filter by Car:</span>
            <Select value={selectedCar} onValueChange={setSelectedCar}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='All Cars' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Cars</SelectItem>
                {carPerformance.map(car => (
                  <SelectItem key={car.id} value={car.id}>
                    {car.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Car Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Car Performance</CardTitle>
              <CardDescription>Detailed metrics for each car</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left p-2'>Car</th>
                      <th className='text-left p-2'>Views</th>
                      <th className='text-left p-2'>Likes</th>
                      <th className='text-left p-2'>Shares</th>
                      <th className='text-left p-2'>Comments</th>
                      <th className='text-left p-2'>Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map(car => (
                      <tr key={car.id} className='border-b hover:bg-muted/50'>
                        <td className='p-2'>
                          <div className='flex items-center gap-3'>
                            {car.image && (
                              <img
                                src={car.image}
                                alt={car.name}
                                className='w-10 h-10 rounded object-cover'
                              />
                            )}
                            <span className='font-medium'>{car.name}</span>
                          </div>
                        </td>
                        <td className='p-2'>{car.views.toLocaleString()}</td>
                        <td className='p-2'>{car.likes.toLocaleString()}</td>
                        <td className='p-2'>{car.shares.toLocaleString()}</td>
                        <td className='p-2'>{car.comments.toLocaleString()}</td>
                        <td className='p-2'>
                          <Badge variant='secondary'>
                            {car.engagement.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Car</CardTitle>
              <CardDescription>Engagement rates for each car</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='engagement' fill='#8b5cf6' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='trends' className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Views Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Views Trend</CardTitle>
                <CardDescription>Views over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type='monotone'
                      dataKey='views'
                      stroke='#3b82f6'
                      fill='#3b82f6'
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trend</CardTitle>
                <CardDescription>Engagement rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='engagement'
                      stroke='#8b5cf6'
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
