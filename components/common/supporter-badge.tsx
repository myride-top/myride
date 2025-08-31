import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SupporterBadgeProps {
  className?: string
  variant?: 'default' | 'compact' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export default function SupporterBadge({
  className = '',
  variant = 'default',
  size = 'md',
}: SupporterBadgeProps) {
  const variantClasses = {
    default: 'bg-yellow-500 text-white',
    compact: 'bg-yellow-500 text-white',
    outline:
      'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-0.5 text-xs gap-1',
    lg: 'px-3 py-1 text-sm gap-1.5',
  }

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <Star className={cn('fill-current', iconSizes[size])} />
      <span>Supporter</span>
    </div>
  )
}

// Extended component with custom text
interface SupporterBadgeCustomProps
  extends Omit<SupporterBadgeProps, 'variant'> {
  text?: string
  variant?: 'default' | 'compact' | 'outline' | 'custom'
  customColor?: string
}

export function SupporterBadgeCustom({
  text = 'Supporter',
  className = '',
  variant = 'default',
  size = 'md',
  customColor,
}: SupporterBadgeCustomProps) {
  const variantClasses = {
    default: 'bg-yellow-500 text-white',
    compact: 'bg-yellow-500 text-white',
    outline:
      'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    custom:
      customColor ||
      'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-0.5 text-xs gap-1',
    lg: 'px-3 py-1 text-sm gap-1.5',
  }

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <Star className={cn('fill-current', iconSizes[size])} />
      <span>{text}</span>
    </div>
  )
}
