'use client'

import { useState } from 'react'
import { Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumRequiredDialog } from './premium-required-dialog'

interface PremiumButtonProps {
  children: React.ReactNode
  featureName?: string
  featureDescription?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  disabled?: boolean
  title?: string
}

export const PremiumButton = ({
  children,
  featureName,
  featureDescription,
  className,
  size = 'md',
  variant = 'default',
  disabled = false,
  title,
}: PremiumButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const sizeClasses = {
    sm: 'h-7 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-10 px-5 text-base gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const variantClasses = {
    default: cn(
      'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
      'dark:from-amber-500 dark:via-yellow-500 dark:to-amber-600',
      'text-amber-950 dark:text-amber-50',
      'shadow-lg shadow-amber-500/50 dark:shadow-amber-600/50',
      'hover:shadow-xl hover:shadow-amber-500/60 dark:hover:shadow-amber-600/60',
      'hover:from-amber-500 hover:via-yellow-500 hover:to-amber-600',
      'dark:hover:from-amber-600 dark:hover:via-yellow-600 dark:hover:to-amber-700',
      'border border-amber-300/50 dark:border-amber-400/50',
      'font-semibold',
      'transition-all duration-200',
      'hover:scale-105 active:scale-95',
      'cursor-pointer'
    ),
    outline: cn(
      'bg-background/80 backdrop-blur-sm',
      'border-2 border-amber-400/60 dark:border-amber-500/60',
      'text-amber-700 dark:text-amber-300',
      'shadow-md shadow-amber-500/20 dark:shadow-amber-600/20',
      'hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
      'hover:border-amber-500 dark:hover:border-amber-400',
      'hover:shadow-lg hover:shadow-amber-500/30 dark:hover:shadow-amber-600/30',
      'font-medium',
      'transition-all duration-200',
      'hover:scale-105 active:scale-95',
      'cursor-pointer'
    ),
    ghost: cn(
      'bg-transparent',
      'text-amber-600 dark:text-amber-400',
      'hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
      'font-medium',
      'transition-all duration-200',
      'hover:scale-105 active:scale-95',
      'cursor-pointer'
    ),
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDialogOpen(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'whitespace-nowrap',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        title={title || 'Premium feature: Upgrade to unlock'}
      >
        <div className='relative flex items-center justify-center'>
          <Crown className={cn(iconSizes[size], 'text-current')} />
          <Sparkles
            className={cn(
              'absolute -top-0.5 -right-0.5',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3',
              'text-amber-600 dark:text-amber-400',
              'animate-pulse'
            )}
          />
        </div>
        <span>{children}</span>
      </button>

      <PremiumRequiredDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        featureName={featureName}
        featureDescription={featureDescription}
      />
    </>
  )
}

