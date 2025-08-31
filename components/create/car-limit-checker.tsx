import React from 'react'
import { Crown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'

interface CarLimitCheckerProps {
  currentCars: number
  maxAllowedCars: number
  isPremium: boolean
  onUpgradeClick?: () => void
  className?: string
  variant?: 'default' | 'compact'
}

export default function CarLimitChecker({
  currentCars,
  maxAllowedCars,
  isPremium,
  onUpgradeClick,
  className = '',
  variant = 'default',
}: CarLimitCheckerProps) {
  const canCreate = isPremium || currentCars < maxAllowedCars
  const remainingSlots = maxAllowedCars - currentCars

  if (canCreate) {
    return null
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 text-center',
        className
      )}>
        <div className='flex items-center justify-center mb-2'>
          <AlertCircle className='w-5 h-5 text-orange-600 dark:text-orange-400 mr-2' />
          <span className='text-sm font-medium text-orange-800 dark:text-orange-200'>
            Car Limit Reached
          </span>
        </div>
        <p className='text-orange-700 dark:text-orange-300 text-xs mb-3'>
          You have reached your car limit ({currentCars} cars). Upgrade to premium to create more cars.
        </p>
        <div className='flex gap-2 justify-center'>
          <LinkButton
            href='/support'
            variant="outline"
            size="sm"
            className="border-orange-600 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-900/70"
            onClick={onUpgradeClick}
          >
            <Crown className='w-3 h-3 mr-1' />
            Upgrade to Premium
          </LinkButton>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 text-center',
      className
    )}>
      <div className='flex items-center justify-center mb-4'>
        <AlertCircle className='w-6 h-6 text-orange-600 dark:text-orange-400 mr-3' />
        <h3 className='text-lg font-semibold text-orange-800 dark:text-orange-200'>
          Car Limit Reached
        </h3>
      </div>
      <p className='text-orange-700 dark:text-orange-300 mb-6'>
        You have reached your car limit ({currentCars} cars). Upgrade to premium to create more cars.
      </p>
      <Button
        onClick={onUpgradeClick}
        className="bg-orange-600 text-white hover:bg-orange-700 border-orange-600"
      >
        <Crown className='w-4 h-4 mr-2' />
        Upgrade to Premium
      </Button>
    </div>
  )
}
