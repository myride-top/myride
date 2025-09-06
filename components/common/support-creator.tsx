'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Coffee,
  Star,
  Gift,
  CreditCard,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/context/auth-context'

interface SupportOption {
  id: string
  name: string
  amount: number
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const supportOptions: SupportOption[] = [
  {
    id: 'coffee',
    name: 'Buy me a coffee',
    amount: 5,
    description: 'Support the development with a coffee',
    icon: Coffee,
    color: 'bg-orange-500',
  },
  {
    id: 'pizza',
    name: 'Buy me a pizza',
    amount: 15,
    description: 'Help fuel late-night coding sessions',
    icon: Gift,
    color: 'bg-red-500',
  },
  {
    id: 'dinner',
    name: 'Buy me dinner',
    amount: 25,
    description: 'A nice dinner for the creator',
    icon: Star,
    color: 'bg-purple-500',
  },
  {
    id: 'custom',
    name: 'Custom amount',
    amount: 0,
    description: 'Choose your own amount',
    icon: Heart,
    color: 'bg-pink-500',
  },
]

export default function SupportCreator() {
  const { user } = useAuth()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSupport = async (option: SupportOption) => {
    setIsLoading(true)

    try {
      let amount = option.amount

      if (option.id === 'custom') {
        const parsedAmount = parseFloat(customAmount)
        if (isNaN(parsedAmount) || parsedAmount < 1) {
          toast.error('Please enter a valid amount (minimum $1)')
          setIsLoading(false)
          return
        }
        amount = parsedAmount
      }

      // Create Stripe Payment Link
      const response = await fetch('/api/create-support-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          description: `Support MyRide - ${option.name}`,
          userId: user?.id,
          metadata: {
            supportType: option.id,
            amount: amount.toString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment link')
      }

      const { url } = await response.json()

      // Open Stripe Checkout in new window
      window.open(url, '_blank')

      toast.success(`Thank you for your support! Redirecting to payment...`)
    } catch {
      toast.error('Failed to process payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4'
        >
          <Heart className='h-8 w-8 text-white' />
        </motion.div>
        <h3 className='text-xl font-bold text-foreground mb-2'>
          Support MyRide
        </h3>
        <p className='text-muted-foreground'>
          Help keep MyRide free and support future development
        </p>
      </div>

      <div className='space-y-3'>
        {supportOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative cursor-pointer transition-all duration-200 ${
              selectedOption === option.id
                ? 'ring-2 rounded-3xl ring-primary ring-offset-2'
                : 'hover:ring-2 hover:ring-primary/50 ring-offset-2 rounded-3xl'
            }`}
            onClick={() => setSelectedOption(option.id)}
          >
            <div className='bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors'>
              <div className='flex items-center gap-3'>
                <div className={`p-2 rounded-lg ${option.color} text-white`}>
                  <option.icon className='h-5 w-5' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-semibold text-foreground'>
                      {option.name}
                    </h4>
                    {option.id !== 'custom' && (
                      <span className='text-lg font-bold text-primary'>
                        ${option.amount}
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {option.description}
                  </p>
                </div>
              </div>

              {option.id === 'custom' && selectedOption === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className='mt-3 pt-3 border-t border-border'
                >
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-foreground'>
                      $
                    </span>
                    <input
                      type='number'
                      min='1'
                      step='0.01'
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      placeholder='Enter amount'
                      className='flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-6'
        >
          <button
            onClick={() => {
              const option = supportOptions.find(
                opt => opt.id === selectedOption
              )
              if (option) handleSupport(option)
            }}
            disabled={
              isLoading || (selectedOption === 'custom' && !customAmount)
            }
            className='w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className='h-4 w-4' />
                Support with Stripe
                <ExternalLink className='h-4 w-4' />
              </>
            )}
          </button>

          <p className='text-xs text-muted-foreground text-center mt-2'>
            Secure payment powered by Stripe
          </p>
        </motion.div>
      )}
    </div>
  )
}
