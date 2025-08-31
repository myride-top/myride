'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { getUserCarSlots } from '@/lib/database/premium-client'
import { MainNavbar } from '@/components/navbar'
import ProtectedRoute from '@/components/auth/protected-route'
import LoadingSpinner from '@/components/common/loading-spinner'
import { CarIcon, Plus, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function BuyCarSlotPage() {
  const router = useRouter()
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
        } catch (error) {
          console.error('Error loading car slots:', error)
        }
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
          userId: user.id,
          customerEmail: user.email,
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
    } catch (error) {
      console.error('Error creating payment session:', error)
      toast.error('Failed to create payment session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (carSlots.isPremium) {
    return (
      <ProtectedRoute>
        <div className='min-h-screen bg-background'>
          <MainNavbar />
          <main className='max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 pt-24'>
            <div className='px-4 py-6 sm:px-0'>
              <div className='text-center'>
                <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900'>
                  <Check className='h-6 w-6 text-green-600 dark:text-green-400' />
                </div>
                <h1 className='mt-4 text-2xl font-bold text-foreground'>
                  You're Already Premium!
                </h1>
                <p className='mt-2 text-muted-foreground'>
                  As a premium user, you can create unlimited cars at no additional cost.
                </p>
                <div className='mt-6'>
                  <Link
                    href='/dashboard'
                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring'
                  >
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-background'>
        <MainNavbar />
        <main className='max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 pt-24'>
          <div className='px-4 py-6 sm:px-0'>
            {/* Header */}
            <div className='text-center mb-8'>
              <Link
                href='/dashboard'
                className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to Dashboard
              </Link>
              <h1 className='text-3xl font-bold text-foreground mb-2'>
                Need More Car Slots?
              </h1>
              <p className='text-lg text-muted-foreground'>
                Add more cars to your MyRide profile
              </p>
            </div>

            {/* Current Status */}
            <div className='bg-card border border-border rounded-lg p-6 mb-8'>
              <h2 className='text-xl font-semibold text-foreground mb-4'>
                Current Status
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-foreground'>
                    {carSlots.currentCars}
                  </div>
                  <div className='text-sm text-muted-foreground'>Current Cars</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-foreground'>
                    {carSlots.maxAllowedCars}
                  </div>
                  <div className='text-sm text-muted-foreground'>Car Limit</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-foreground'>
                    {carSlots.purchasedSlots}
                  </div>
                  <div className='text-sm text-muted-foreground'>Purchased Slots</div>
                </div>
              </div>
            </div>

            {/* Purchase Options */}
            <div className='bg-card border border-border rounded-lg p-6 mb-8'>
              <h2 className='text-xl font-semibold text-foreground mb-4'>
                Purchase Additional Car Slots
              </h2>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border border-border rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
                      <Plus className='w-5 h-5 text-primary' />
                    </div>
                    <div>
                      <div className='font-medium text-foreground'>
                        Additional Car Slot
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Add one more car to your profile
                      </div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold text-foreground'>$1.00</div>
                    <div className='text-sm text-muted-foreground'>One-time</div>
                  </div>
                </div>

                <button
                  onClick={handlePurchaseCarSlot}
                  disabled={loading}
                  className='w-full flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {loading ? (
                    <LoadingSpinner size='sm' />
                  ) : (
                    <>
                      <CarIcon className='w-5 h-5 mr-2' />
                      Purchase Car Slot for $1.00
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className='bg-card border border-border rounded-lg p-6'>
              <h2 className='text-xl font-semibold text-foreground mb-4'>
                Why Buy Additional Car Slots?
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-start space-x-3'>
                  <div className='flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 mt-0.5'>
                    <Check className='w-4 h-4 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <div className='font-medium text-foreground'>Showcase More Cars</div>
                    <div className='text-sm text-muted-foreground'>
                      Display your entire car collection
                    </div>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 mt-0.5'>
                    <Check className='w-4 h-4 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <div className='font-medium text-foreground'>Build Your Brand</div>
                    <div className='text-sm text-muted-foreground'>
                      Establish yourself in the car community
                    </div>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 mt-0.5'>
                    <Check className='w-4 h-4 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <div className='font-medium text-foreground'>Share Your Passion</div>
                    <div className='text-sm text-muted-foreground'>
                      Inspire others with your builds
                    </div>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 mt-0.5'>
                    <Check className='w-4 h-4 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <div className='font-medium text-foreground'>One-Time Purchase</div>
                    <div className='text-sm text-muted-foreground'>
                      No recurring fees, slot is yours forever
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Upgrade Option */}
            <div className='bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center'>
              <h3 className='text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2'>
                🚀 Want Unlimited Cars?
              </h3>
              <p className='text-amber-700 dark:text-amber-300 mb-4'>
                Upgrade to premium and create unlimited cars for just $10!
              </p>
              <Link
                href='/premium'
                className='inline-flex items-center px-4 py-2 border border-amber-600 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/50 rounded-md text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors'
              >
                Learn About Premium
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
