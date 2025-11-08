'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/card'
import { Button } from '@/components/common/button'
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
  BarChart3,
  Activity,
  Info,
  Sparkles,
} from 'lucide-react'
import {
  AreaChart,
  BarChart,
  DonutChart,
  LineChart,
  CategoryBar,
  Metric,
  Text,
  Flex,
  Title,
  Subtitle,
  Grid,
  Col,
  Card as TremorCard,
} from '@tremor/react'

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

export const AnalyticsDashboard = ({
  className = '',
}: AnalyticsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [carPerformance, setCarPerformance] = useState<CarPerformance[]>([])
  const [timeRange, setTimeRange] = useState('6m')
  // Combined filter: "global" or "individual:all" or "individual:carId"
  const [viewFilter, setViewFilter] = useState<string>('global')

  // Parse viewFilter to get viewMode and selectedCar
  const viewMode = viewFilter === 'global' ? 'global' : 'individual'
  const selectedCar = viewFilter.startsWith('individual:')
    ? viewFilter.replace('individual:', '')
    : 'all'

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(
    async (range?: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const timeRangeToUse = range || timeRange
        console.log('Fetching analytics data for timeRange:', timeRangeToUse)
        const response = await fetch(
          `/api/analytics?timeRange=${timeRangeToUse}`
        )

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
    },
    [timeRange]
  )

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

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
        className={`flex items-center gap-1 text-sm font-medium ${
          isPositive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {isPositive ? (
          <TrendingUp className='h-4 w-4' />
        ) : (
          <TrendingDown className='h-4 w-4' />
        )}
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    )
  }

  // Prepare data for Tremor charts
  const engagementData = useMemo(() => {
    if (!data) return []
    const total = data.views + data.likes + data.shares + data.comments
    if (total === 0) return []
    return [
      {
        name: 'Views',
        value: data.views,
        percentage: ((data.views / total) * 100).toFixed(1),
      },
      {
        name: 'Likes',
        value: data.likes,
        percentage: ((data.likes / total) * 100).toFixed(1),
      },
      {
        name: 'Shares',
        value: data.shares,
        percentage: ((data.shares / total) * 100).toFixed(1),
      },
      {
        name: 'Comments',
        value: data.comments,
        percentage: ((data.comments / total) * 100).toFixed(1),
      },
    ]
  }, [data])

  const comparisonData = useMemo(() => {
    if (!data) return []
    const previousViews = data.views / (1 + data.viewsChange / 100)
    const previousLikes = data.likes / (1 + data.likesChange / 100)
    const previousShares = data.shares / (1 + data.sharesChange / 100)
    const previousComments = data.comments / (1 + data.commentsChange / 100)

    return [
      {
        metric: 'Views',
        current: Math.round(data.views),
        previous: Math.round(previousViews),
      },
      {
        metric: 'Likes',
        current: Math.round(data.likes),
        previous: Math.round(previousLikes),
      },
      {
        metric: 'Shares',
        current: Math.round(data.shares),
        previous: Math.round(previousShares),
      },
      {
        metric: 'Comments',
        current: Math.round(data.comments),
        previous: Math.round(previousComments),
      },
    ]
  }, [data])

  const carChartData = useMemo(() => {
    if (!carPerformance || carPerformance.length === 0) return []

    // Filter cars based on selection
    const filteredCars =
      selectedCar === 'all'
        ? carPerformance
        : carPerformance.filter(car => car.id === selectedCar)

    if (filteredCars.length === 0) return []

    return filteredCars.map(car => ({
      name: car.name.length > 15 ? car.name.substring(0, 15) + '...' : car.name,
      Views: car.views,
      Likes: car.likes,
      Shares: car.shares,
      Comments: car.comments,
      Engagement: car.engagement,
    }))
  }, [carPerformance, selectedCar])

  // Calculate engagement rate
  const totalEngagement = useMemo(() => {
    if (!data) return '0.00'
    const totalInteractions = data.likes + data.shares + data.comments
    return data.views > 0
      ? ((totalInteractions / data.views) * 100).toFixed(2)
      : '0.00'
  }, [data])

  const timeRangeLabel = useMemo(() => {
    const labels: Record<string, string> = {
      '7d': 'Posledních 7 dní',
      '30d': 'Posledních 30 dní',
      '3m': 'Poslední 3 měsíce',
      '6m': 'Posledních 6 měsíců',
      '1y': 'Poslední rok',
    }
    return labels[timeRange] || timeRange
  }, [timeRange])

  // Generate chart data from car performance (for table display)
  const chartData = useMemo(() => {
    if (!carPerformance || carPerformance.length === 0) return []
    if (selectedCar === 'all') {
      return carPerformance
    }
    return carPerformance.filter(car => car.id === selectedCar)
  }, [carPerformance, selectedCar])

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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
            <BarChart3 className='h-8 w-8 text-primary' />
            Analytics Dashboard
          </h1>
          <p className='text-muted-foreground mt-1'>
            Sledujte výkon svých aut a zjistěte, jak se lidem líbí vaše vozy
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={handleRefresh} variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Obnovit
          </Button>
          <Button onClick={handleExport} variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Exportovat
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Zobrazení:</span>
            </div>
            <Select value={viewFilter} onValueChange={setViewFilter}>
              <SelectTrigger className='w-64'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='global'>Celkové statistiky</SelectItem>
                <SelectItem value='individual:all'>
                  Jednotlivá auta - Všechna auta
                </SelectItem>
                {carPerformance.map(car => (
                  <SelectItem key={car.id} value={`individual:${car.id}`}>
                    Jednotlivá auta - {car.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex items-center gap-2 ml-4'>
              <Activity className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Období:</span>
            </div>
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className='w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7d'>Posledních 7 dní</SelectItem>
                <SelectItem value='30d'>Posledních 30 dní</SelectItem>
                <SelectItem value='3m'>Poslední 3 měsíce</SelectItem>
                <SelectItem value='6m'>Posledních 6 měsíců</SelectItem>
                <SelectItem value='1y'>Poslední rok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics with Tremor */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className='gap-6'>
        <Col>
          <TremorCard decoration='top' decorationColor='blue'>
            <Flex justifyContent='start' className='space-x-4'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                <Eye className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
              <div className='truncate'>
                <Text>Zobrazení</Text>
                <Metric className='text-2xl'>
                  {data.views.toLocaleString()}
                </Metric>
                {formatChange(data.viewsChange)}
              </div>
            </Flex>
            <div className='mt-4'>
              <Text className='text-xs text-muted-foreground'>
                Celkový počet zobrazení vašich aut za{' '}
                {timeRangeLabel.toLowerCase()}
              </Text>
            </div>
          </TremorCard>
        </Col>

        <Col>
          <TremorCard decoration='top' decorationColor='red'>
            <Flex justifyContent='start' className='space-x-4'>
              <div className='p-2 bg-red-100 dark:bg-red-900/30 rounded-lg'>
                <Heart className='h-6 w-6 text-red-600 dark:text-red-400' />
              </div>
              <div className='truncate'>
                <Text>Líbí se</Text>
                <Metric className='text-2xl'>
                  {data.likes.toLocaleString()}
                </Metric>
                {formatChange(data.likesChange)}
              </div>
            </Flex>
            <div className='mt-4'>
              <Text className='text-xs text-muted-foreground'>
                Počet lajků, které vaše auta získala
              </Text>
            </div>
          </TremorCard>
        </Col>

        <Col>
          <TremorCard decoration='top' decorationColor='emerald'>
            <Flex justifyContent='start' className='space-x-4'>
              <div className='p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg'>
                <Share2 className='h-6 w-6 text-emerald-600 dark:text-emerald-400' />
              </div>
              <div className='truncate'>
                <Text>Sdílení</Text>
                <Metric className='text-2xl'>
                  {data.shares.toLocaleString()}
                </Metric>
                {formatChange(data.sharesChange)}
              </div>
            </Flex>
            <div className='mt-4'>
              <Text className='text-xs text-muted-foreground'>
                Kolikrát byla vaše auta sdílena
              </Text>
            </div>
          </TremorCard>
        </Col>

        <Col>
          <TremorCard decoration='top' decorationColor='amber'>
            <Flex justifyContent='start' className='space-x-4'>
              <div className='p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg'>
                <MessageCircle className='h-6 w-6 text-amber-600 dark:text-amber-400' />
              </div>
              <div className='truncate'>
                <Text>Komentáře</Text>
                <Metric className='text-2xl'>
                  {data.comments.toLocaleString()}
                </Metric>
                {formatChange(data.commentsChange)}
              </div>
            </Flex>
            <div className='mt-4'>
              <Text className='text-xs text-muted-foreground'>
                Počet komentářů pod vašimi auty
              </Text>
            </div>
          </TremorCard>
        </Col>
      </Grid>

      {/* Engagement Rate Card */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-primary' />
                Míra zapojení (Engagement Rate)
              </CardTitle>
              <CardDescription>
                Ukazuje, jak aktivně se lidé zapojují do vašeho obsahu
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-3xl font-bold text-primary'>
                {totalEngagement}%
              </div>
              <div className='text-sm text-muted-foreground'>
                (Lajky + Sdílení + Komentáře) / Zobrazení × 100
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Celkové interakce</span>
              <span className='font-medium'>
                {(data.likes + data.shares + data.comments).toLocaleString()}
              </span>
            </div>
            <CategoryBar
              values={[
                (data.likes / (data.likes + data.shares + data.comments || 1)) *
                  100,
                (data.shares /
                  (data.likes + data.shares + data.comments || 1)) *
                  100,
                (data.comments /
                  (data.likes + data.shares + data.comments || 1)) *
                  100,
              ]}
              colors={['red', 'emerald', 'amber']}
              className='mt-3'
            />
            <div className='flex items-center justify-between text-xs text-muted-foreground mt-2'>
              <span>Lajky: {data.likes.toLocaleString()}</span>
              <span>Sdílení: {data.shares.toLocaleString()}</span>
              <span>Komentáře: {data.comments.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Přehled</TabsTrigger>
          {viewMode === 'individual' && (
            <TabsTrigger value='performance'>Výkon aut</TabsTrigger>
          )}
          <TabsTrigger value='trends'>Trendy</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <Grid numItems={1} numItemsLg={2} className='gap-6'>
            {/* Engagement Distribution */}
            <Col>
              <TremorCard>
                <Title>Rozložení interakcí</Title>
                <Subtitle>
                  Jak se lidé zapojují do vašeho obsahu - procentuální rozdělení
                </Subtitle>
                {engagementData.length > 0 ? (
                  <DonutChart
                    className='mt-6'
                    data={engagementData}
                    category='value'
                    index='name'
                    colors={['blue', 'red', 'emerald', 'amber']}
                    valueFormatter={value => value.toLocaleString()}
                    showLabel={true}
                  />
                ) : (
                  <div className='mt-6 text-center text-muted-foreground py-12'>
                    <Info className='h-12 w-12 mx-auto mb-2 opacity-50' />
                    <p>Zatím žádná data k zobrazení</p>
                  </div>
                )}
              </TremorCard>
            </Col>

            {/* Performance Comparison */}
            <Col>
              <TremorCard>
                <Title>Porovnání období</Title>
                <Subtitle>
                  Současné období vs. předchozí období - zjistěte, jak se vaše
                  metriky změnily
                </Subtitle>
                <BarChart
                  className='mt-6'
                  data={comparisonData}
                  index='metric'
                  categories={['current', 'previous']}
                  colors={['blue', 'slate']}
                  valueFormatter={value => value.toLocaleString()}
                  yAxisWidth={60}
                />
              </TremorCard>
            </Col>
          </Grid>

          {/* Global Analytics - Top Performing Cars */}
          {viewMode === 'global' && carPerformance.length > 0 && (
            <TremorCard>
              <Title>Nejlepší auta podle zapojení</Title>
              <Subtitle>
                Vaše nejúspěšnější auta seřazená podle míry zapojení (engagement
                rate)
              </Subtitle>
              <div className='mt-6 space-y-4'>
                {carPerformance.slice(0, 5).map((car, index) => (
                  <div
                    key={car.id}
                    className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full text-sm font-semibold'>
                        {index + 1}
                      </div>
                      {car.image && (
                        <img
                          src={car.image}
                          alt={car.name}
                          className='w-14 h-14 rounded-lg object-cover border'
                        />
                      )}
                      <div>
                        <p className='font-semibold'>{car.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {car.views.toLocaleString()} zobrazení
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <Badge variant='secondary' className='mb-2'>
                        {car.engagement.toFixed(1)}% zapojení
                      </Badge>
                      <div className='text-sm text-muted-foreground space-x-2'>
                        <span>{car.likes} lajků</span>
                        <span>•</span>
                        <span>{car.shares} sdílení</span>
                        <span>•</span>
                        <span>{car.comments} komentářů</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TremorCard>
          )}
        </TabsContent>

        <TabsContent value='performance' className='space-y-6'>
          {/* Car Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailní výkon aut</CardTitle>
              <CardDescription>
                Kompletní přehled metrik pro každé auto - zjistěte, které auto
                je nejúspěšnější
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left p-3 font-semibold'>Auto</th>
                      <th className='text-left p-3 font-semibold'>Zobrazení</th>
                      <th className='text-left p-3 font-semibold'>Lajky</th>
                      <th className='text-left p-3 font-semibold'>Sdílení</th>
                      <th className='text-left p-3 font-semibold'>Komentáře</th>
                      <th className='text-left p-3 font-semibold'>Zapojení</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map(car => (
                      <tr
                        key={car.id}
                        className='border-b hover:bg-muted/50 transition-colors'
                      >
                        <td className='p-3'>
                          <div className='flex items-center gap-3'>
                            {car.image && (
                              <img
                                src={car.image}
                                alt={car.name}
                                className='w-12 h-12 rounded-lg object-cover border'
                              />
                            )}
                            <span className='font-medium'>{car.name}</span>
                          </div>
                        </td>
                        <td className='p-3'>{car.views.toLocaleString()}</td>
                        <td className='p-3'>{car.likes.toLocaleString()}</td>
                        <td className='p-3'>{car.shares.toLocaleString()}</td>
                        <td className='p-3'>{car.comments.toLocaleString()}</td>
                        <td className='p-3'>
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
          <TremorCard>
            <Title>Míra zapojení podle auta</Title>
            <Subtitle>
              Porovnejte míru zapojení napříč všemi vašimi auty
            </Subtitle>
            {carChartData.length > 0 ? (
              <BarChart
                className='mt-6'
                data={carChartData}
                index='name'
                categories={['Engagement']}
                colors={['purple']}
                valueFormatter={value => `${value.toFixed(1)}%`}
                yAxisWidth={60}
              />
            ) : (
              <div className='mt-6 text-center text-muted-foreground py-12'>
                <Info className='h-12 w-12 mx-auto mb-2 opacity-50' />
                <p>Zatím žádná data k zobrazení</p>
              </div>
            )}
          </TremorCard>
        </TabsContent>

        <TabsContent value='trends' className='space-y-6'>
          <Grid numItems={1} numItemsLg={2} className='gap-6'>
            {/* Views Trend */}
            <Col>
              <TremorCard>
                <Title>Trend zobrazení</Title>
                <Subtitle>
                  {viewMode === 'global'
                    ? 'Celkový počet zobrazení napříč všemi auty'
                    : 'Zobrazení v čase pro jednotlivá auta'}
                </Subtitle>
                {carChartData.length > 0 ? (
                  <AreaChart
                    className='mt-6'
                    data={carChartData}
                    index='name'
                    categories={['Views']}
                    colors={['blue']}
                    valueFormatter={value => value.toLocaleString()}
                    yAxisWidth={60}
                  />
                ) : (
                  <div className='mt-6 text-center text-muted-foreground py-12'>
                    <Info className='h-12 w-12 mx-auto mb-2 opacity-50' />
                    <p>Zatím žádná data k zobrazení</p>
                  </div>
                )}
              </TremorCard>
            </Col>

            {/* Engagement Trend */}
            <Col>
              <TremorCard>
                <Title>Trend zapojení</Title>
                <Subtitle>
                  {viewMode === 'global'
                    ? 'Míra zapojení napříč všemi auty'
                    : 'Míra zapojení v čase pro jednotlivá auta'}
                </Subtitle>
                {carChartData.length > 0 ? (
                  <LineChart
                    className='mt-6'
                    data={carChartData}
                    index='name'
                    categories={['Engagement']}
                    colors={['purple']}
                    valueFormatter={value => `${value.toFixed(1)}%`}
                    yAxisWidth={60}
                  />
                ) : (
                  <div className='mt-6 text-center text-muted-foreground py-12'>
                    <Info className='h-12 w-12 mx-auto mb-2 opacity-50' />
                    <p>Zatím žádná data k zobrazení</p>
                  </div>
                )}
              </TremorCard>
            </Col>
          </Grid>

          {/* Global Analytics - Engagement Comparison */}
          {viewMode === 'global' && carPerformance.length > 0 && (
            <TremorCard>
              <Title>Porovnání všech metrik</Title>
              <Subtitle>
                Kompletní přehled všech interakcí napříč vašimi auty - zjistěte,
                které auto má nejvíce zobrazení, lajků, sdílení a komentářů
              </Subtitle>
              <BarChart
                className='mt-6'
                data={carChartData.slice(0, 10)}
                index='name'
                categories={['Views', 'Likes', 'Shares', 'Comments']}
                colors={['blue', 'red', 'emerald', 'amber']}
                valueFormatter={value => value.toLocaleString()}
                yAxisWidth={60}
              />
            </TremorCard>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
