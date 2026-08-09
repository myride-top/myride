'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { getUserCarSlots } from '@/lib/database/premium-client'
import { PageLayout } from '@/components/layout/page-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Button } from '@/components/ui/button'
import { CarIcon, Plus, Check, ArrowLeft, Crown } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function BuyCarSlotPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [carSlots, setCarSlots] = useState({
    currentCars: 0,
    maxAllowedCars: 1,
    purchasedSlots: 0,
    isPremium: false,
  })

  // Load car slot information
  useEffect(() => {
    const loadCarSlots = async () => {
      if (user) {
        try {
          const slots = await getUserCarSlots(user.id)
          setCarSlots(slots)
        } catch {}
      }
    }
    loadCarSlots()
  }, [user])

  const handlePurchaseCarSlot = async () => {
    if (!user) {
      toast.error('Please sign in to purchase car slots')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/create-car-slot-payment', {
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

  if (carSlots.isPremium) {
    return (
      <ProtectedRoute>
        <PageLayout showCreateButton maxWidth='3xl'>
          <div className='text-center'>
            <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-green-100 dark:bg-green-900 mb-6 shadow-lg'>
              <Check className='h-8 w-8 text-green-600 dark:text-green-400' />
            </div>
            <h1 className='text-3xl font-bold text-foreground mb-4'>
              You&apos;re Already Premium!
            </h1>
            <p className='text-lg text-muted-foreground mb-8 leading-relaxed'>
              As a premium user, you can create unlimited cars at no additional
              cost.
            </p>
            <Button asChild size='lg' rounded='xl'>
              <Link href='/dashboard'>
                <ArrowLeft className='w-5 h-5' />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </PageLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PageLayout showCreateButton maxWidth='3xl'>
        <div className='bg-primary/10 border-b border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 mb-8'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4'>
              <CarIcon className='h-6 w-6 text-primary-foreground' />
            </div>
            <h1 className='text-3xl font-bold text-foreground mb-3'>
              Need More Car Slots?
            </h1>
            <p className='text-muted-foreground'>
              Add more cars to your MyRide profile
            </p>
          </div>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl font-semibold text-foreground mb-6 text-center'>
            What You Get
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-primary rounded-lg shadow-sm'>
                  <div className='text-primary-foreground'>
                    <Plus className='w-5 h-5' />
                  </div>
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-foreground text-sm mb-1'>
                    Additional Car Slot
                  </h3>
                  <p className='text-xs text-muted-foreground mb-2'>
                    Add one more car to your profile
                  </p>
                  <span className='inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full'>
                    Expand your collection
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-primary rounded-lg shadow-sm'>
                  <div className='text-primary-foreground'>
                    <Check className='w-5 h-5' />
                  </div>
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-foreground text-sm mb-1'>
                    One-Time Purchase
                  </h3>
                  <p className='text-xs text-muted-foreground mb-2'>
                    No recurring fees, slot is yours forever
                  </p>
                  <span className='inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full'>
                    Great value
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-card border border-border rounded-lg p-6 mb-16'>
          <h2 className='text-xl font-semibold text-foreground mb-6 text-center'>
            Current Status
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-foreground mb-2'>
                {carSlots.currentCars}
              </div>
              <div className='text-muted-foreground font-medium'>
                Current Cars
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-foreground mb-2'>
                {carSlots.maxAllowedCars}
              </div>
              <div className='text-muted-foreground font-medium'>
                Car Limit
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-foreground mb-2'>
                {carSlots.purchasedSlots}
              </div>
              <div className='text-muted-foreground font-medium'>
                Purchased Slots
              </div>
            </div>
          </div>

          <div className='text-center mt-4'>
            <Button
              onClick={handlePurchaseCarSlot}
              disabled={loading}
              size='xl'
              className='w-full'
            >
              {loading ? (
                <LoadingSpinner size='sm' />
              ) : (
                <>
                  <CarIcon className='w-6 h-6' />
                  Purchase Car Slot for $2.00
                </>
              )}
            </Button>
          </div>
        </div>

        <div className='mb-16'>
          <h2 className='text-xl font-semibold text-foreground mb-6 text-center'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                How much does a car slot cost?
              </h3>
              <p className='text-sm text-muted-foreground'>
                Each additional car slot costs $2.00 as a one-time payment.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                Is this a recurring payment?
              </h3>
              <p className='text-sm text-muted-foreground'>
                No! You pay once and the slot is yours forever.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                Can I buy multiple slots?
              </h3>
              <p className='text-sm text-muted-foreground'>
                Yes! You can purchase multiple slots as needed.
              </p>
            </div>
          </div>
        </div>

        <div className='bg-primary/10 border border-primary/20 rounded-lg p-6 text-center'>
          <h3 className='text-2xl font-semibold text-foreground mb-4'>
            Want Unlimited Cars?
          </h3>
          <p className='text-muted-foreground mb-6 text-lg leading-relaxed'>
            Upgrade to premium and create unlimited cars for just $10!
          </p>
          <Button asChild variant='outline' size='lg' rounded='xl'>
            <Link href='/premium'>
              <Crown className='w-5 h-5' />
              Learn About Premium
            </Link>
          </Button>
        </div>

        <div className='text-center mt-8 pt-6 border-t border-border'>
          <p className='text-xs text-muted-foreground'>
            Secure payment via Stripe • One-time purchase • Instant access
          </p>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
