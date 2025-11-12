import React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LinkButton } from '@/components/ui/link-button'
import { PremiumButton } from '@/components/common/premium-button'

interface PremiumUpgradeBannerProps {
  currentCars: number
  maxAllowedCars: number
  className?: string
  variant?: 'default' | 'compact'
}

export const PremiumUpgradeBanner = ({
  currentCars,
  maxAllowedCars,
  className = '',
  variant = 'default',
}: PremiumUpgradeBannerProps) => {
  const remainingSlots = maxAllowedCars - currentCars

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
            <PremiumButton
              featureName='Go Premium'
              featureDescription='Upgrade to premium for unlimited car slots, advanced analytics, garage sharing, and exclusive features.'
              size='sm'
              variant='default'
            >
              Go Premium
            </PremiumButton>
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
          <PremiumButton
            featureName='Go Premium'
            featureDescription='Upgrade to premium for unlimited car slots, advanced analytics, garage sharing, and exclusive features.'
            size='md'
            variant='default'
          >
            Go Premium
          </PremiumButton>
        </div>
      </div>
    </div>
  )
}
