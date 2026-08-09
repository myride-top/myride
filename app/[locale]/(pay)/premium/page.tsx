'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { PageLayout } from '@/components/layout/page-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Button } from '@/components/ui/button'
import { Crown, BarChart3, Share2, Car, ArrowRight, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function PremiumPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handlePurchasePremium = async () => {
    if (!user) {
      toast.error('Please sign in to purchase premium')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/create-premium-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: user.email || undefined,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error('Failed to create payment session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <BarChart3 className='w-5 h-5' />,
      title: 'Analytics Dashboard',
      description: 'Track car views, shares, and likes with detailed insights',
      hype: 'Data-driven decisions',
    },
    {
      icon: <Car className='w-5 h-5' />,
      title: 'Unlimited Cars',
      description: 'Add as many cars as you want to your garage',
      hype: 'Build your dream collection',
    },
    {
      icon: <MapPin className='w-5 h-5' />,
      title: 'Map Events',
      description: 'Create and manage car events on an interactive map',
      hype: 'Connect with car enthusiasts',
    },
    {
      icon: <Share2 className='w-5 h-5' />,
      title: 'Garage Sharing',
      description: 'Share your entire car collection with one link',
      hype: 'One link, entire collection',
    },
    {
      icon: <Crown className='w-5 h-5' />,
      title: 'Premium Badge',
      description: 'Show off your premium status on car pages',
      hype: 'Stand out from the crowd',
    },
  ]

  return (
    <ProtectedRoute>
      <PageLayout showCreateButton maxWidth='3xl'>
        <div className='bg-primary/10 border-b border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 mb-8'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4'>
              <Crown className='h-6 w-6 text-primary-foreground' />
            </div>
            <h1 className='text-3xl font-bold text-foreground mb-3'>
              Go Premium
            </h1>
            <p className='text-muted-foreground'>
              Unlock unlimited cars and advanced features
            </p>
          </div>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-6 text-center'>
            Premium Features
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200'
              >
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-primary rounded-lg shadow-sm'>
                    <div className='text-primary-foreground'>{feature.icon}</div>
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-foreground text-sm mb-1'>
                      {feature.title}
                    </h3>
                    <p className='text-xs text-muted-foreground mb-2'>
                      {feature.description}
                    </p>
                    <span className='inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full'>
                      {feature.hype}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-card border border-border rounded-xl p-8 mb-16 shadow-sm text-center'>
          <div className='mb-6'>
            <div className='text-4xl font-bold text-foreground mb-2'>$10</div>
            <div className='text-muted-foreground'>
              One-time payment, lifetime access
            </div>
          </div>
          <Button
            onClick={handlePurchasePremium}
            disabled={loading}
            variant='gradient'
            size='xl'
            className='w-full'
          >
            {loading ? (
              <LoadingSpinner size='sm' />
            ) : (
              <>
                Get Premium Access
                <ArrowRight className='w-5 h-5' />
              </>
            )}
          </Button>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-6 text-center'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                Is this really a one-time payment?
              </h3>
              <p className='text-sm text-muted-foreground'>
                Yes! You pay $10 once and get lifetime access to all premium
                features.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                What happens if I&apos;m not satisfied?
              </h3>
              <p className='text-sm text-muted-foreground'>
                We offer a 30-day money-back guarantee.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                Can I upgrade later?
              </h3>
              <p className='text-sm text-muted-foreground'>
                Absolutely! You can upgrade to premium at any time.
              </p>
            </div>
          </div>
        </div>

        <div className='text-center mt-8 pt-6 border-t border-border'>
          <p className='text-xs text-muted-foreground'>
            Secure payment via Stripe • No recurring fees • Instant access
          </p>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
