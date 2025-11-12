'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { useRouter } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { MainNavbar } from '@/components/navbar/main-navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/card'
import { Button } from '@/components/ui/button-enhanced'
import { Crown, BarChart3, ArrowRight, Lock } from 'lucide-react'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { Profile } from '@/lib/types/database'
import Link from 'next/link'

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const userProfile = await getProfileByUserIdClient(user.id)
          setProfile(userProfile)
        } catch {
          setProfile(null)
        }
      }
      setLoading(false)
    }

    if (!authLoading) {
      loadProfile()
    }
  }, [user, authLoading])

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner message='Loading...' />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login')
    return null
  }

  // Show premium required message if not premium
  if (!profile?.is_premium) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-background'>
          <MainNavbar showCreateButton={true} />
          <div className='container mx-auto px-4 pb-8 pt-28'>
            <Card className='max-w-2xl mx-auto'>
              <CardHeader className='text-center'>
                <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6'>
                  <Lock className='h-8 w-8 text-primary' />
                </div>
                <CardTitle className='text-3xl font-bold mb-2'>
                  Premium Required
                </CardTitle>
                <CardDescription className='text-lg'>
                  Analytics dashboard is available for premium users only
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20'>
                  <div className='flex items-start gap-4'>
                    <div className='p-3 bg-primary/20 rounded-lg'>
                      <BarChart3 className='h-6 w-6 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg mb-2'>
                        Unlock Advanced Analytics
                      </h3>
                      <p className='text-muted-foreground mb-4'>
                        Get detailed insights into your cars and events performance with our premium analytics dashboard.
                      </p>
                      <ul className='space-y-2 text-sm text-muted-foreground mb-4'>
                        <li className='flex items-center gap-2'>
                          <Crown className='h-4 w-4 text-yellow-500' />
                          Track views, likes, shares, and comments
                        </li>
                        <li className='flex items-center gap-2'>
                          <Crown className='h-4 w-4 text-yellow-500' />
                          Monitor event attendance and engagement
                        </li>
                        <li className='flex items-center gap-2'>
                          <Crown className='h-4 w-4 text-yellow-500' />
                          Analyze performance over time
                        </li>
                        <li className='flex items-center gap-2'>
                          <Crown className='h-4 w-4 text-yellow-500' />
                          Export data for further analysis
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                  <Button
                    asChild
                    className='bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white'
                  >
                    <Link href='/premium' className='flex items-center gap-2'>
                      <Crown className='h-4 w-4' />
                      Upgrade to Premium
                      <ArrowRight className='h-4 w-4' />
                    </Link>
                  </Button>
                  <Button
                    variant='outline'
                    asChild
                  >
                    <Link href='/dashboard'>
                      Back to Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Show analytics dashboard for premium users
  return (
    <ProtectedRoute>
      <MainNavbar showCreateButton={true} />
      <div className='container mx-auto px-3 md:px-4 pb-6 md:pb-8 pt-20 md:pt-28'>
        <AnalyticsDashboard />
      </div>
    </ProtectedRoute>
  )
}
