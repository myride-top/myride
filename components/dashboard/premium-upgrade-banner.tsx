import React from 'react'
import { Crown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LinkButton } from '@/components/ui/link-button'

interface PremiumUpgradeBannerProps {
  currentCars: number
  maxAllowedCars: number
  className?: string
  variant?: 'default' | 'compact'
}

export default function PremiumUpgradeBanner({
  currentCars,
  maxAllowedCars,
  className = '',
  variant = 'default',
}: PremiumUpgradeBannerProps) {
  const remainingSlots = maxAllowedCars - currentCars
  const isAtLimit = currentCars >= maxAllowedCars

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4',
          className
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <h3 className='text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1'>
              Need More Car Slots?
            </h3>
            <p className='text-blue-700 dark:text-blue-300 text-xs'>
              Currently {currentCars}/{maxAllowedCars} cars • {remainingSlots}{' '}
              slot{remainingSlots !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <div className='flex gap-2'>
            <LinkButton
              href='/buy-car-slot'
              variant='outline'
              size='sm'
              className='border-blue-600 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70'
            >
              <Plus className='w-3 h-3 mr-1' />
              Buy Slots
            </LinkButton>
            <LinkButton
              href='/premium'
              variant='outline'
              size='sm'
              className='border-amber-600 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/70'
            >
              <Crown className='w-3 h-3 mr-1' />
              Go Premium
            </LinkButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6',
        className
      )}
    >
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1'>
            Need More Car Slots?
          </h3>
          <p className='text-blue-700 dark:text-blue-300 text-sm'>
            Currently {currentCars}/{maxAllowedCars} cars • {remainingSlots}{' '}
            slot{remainingSlots !== 1 ? 's' : ''} remaining
          </p>
        </div>
        <div className='flex gap-2'>
          <LinkButton
            href='/buy-car-slot'
            variant='outline'
            className='border-blue-600 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70'
          >
            <Plus className='w-4 h-4 mr-2' />
            Buy More Slots
          </LinkButton>
          <LinkButton
            href='/premium'
            variant='outline'
            className='border-amber-600 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/70'
          >
            <Crown className='w-4 h-4 mr-2' />
            Go Premium
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
