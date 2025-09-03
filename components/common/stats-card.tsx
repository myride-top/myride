import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import IconWrapper from './icon-wrapper'
import Card from './card'

export interface Stat {
  icon: LucideIcon
  value: string | number
  label: string
  description?: string
  color?: string
}

export interface DashboardStat {
  icon: LucideIcon
  label: string
  value: string | number
  isPremium?: boolean
  premiumUpgradeHref?: string
  className?: string
}

interface StatsCardProps {
  stat: Stat | DashboardStat
  className?: string
  showIcon?: boolean
  showDescription?: boolean
  variant?: 'default' | 'highlighted' | 'minimal' | 'dashboard'
  size?: 'sm' | 'md' | 'lg'
}

export default function StatsCard({
  stat,
  className = '',
  showIcon = true,
  showDescription = true,
  variant = 'default',
  size = 'md',
}: StatsCardProps) {
  // Check if it's a dashboard stat
  const isDashboardStat = 'isPremium' in stat

  if (variant === 'dashboard' || isDashboardStat) {
    const dashboardStat = stat as DashboardStat
    const {
      icon,
      label,
      value,
      isPremium = true,
      premiumUpgradeHref,
      className: statClassName,
    } = dashboardStat

    return (
      <Card
        variant='default'
        padding='md'
        rounded='lg'
        className={cn(
          'overflow-hidden shadow group relative',
          className,
          statClassName
        )}
      >
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <IconWrapper
              icon={icon}
              size='sm'
              variant={isPremium ? 'primary' : 'muted'}
              className='w-5 h-5 md:w-6 md:h-6'
            />
          </div>
          <div className='ml-3 md:ml-5 w-0 flex-1'>
            <dl>
              <dt className='text-xs md:text-sm font-medium text-muted-foreground truncate flex items-center gap-1'>
                {label}
                {!isPremium && (
                  <span className='ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
                    PREMIUM
                  </span>
                )}
              </dt>
              <dd
                className={cn(
                  'text-base md:text-lg font-medium text-card-foreground',
                  !isPremium && 'blur-sm'
                )}
              >
                {value}
              </dd>
            </dl>
          </div>
        </div>

        {/* Premium upgrade overlay */}
        {!isPremium && premiumUpgradeHref && (
          <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-xs'>
            <Link
              href={premiumUpgradeHref}
              className='bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors'
            >
              Upgrade to Premium
            </Link>
          </div>
        )}
      </Card>
    )
  }

  // Regular stat card
  const regularStat = stat as Stat
  const {
    icon,
    value,
    label,
    description,
    color = 'text-primary',
  } = regularStat

  const variantClasses = {
    default: 'hover:border-primary/50',
    highlighted:
      'bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20',
    minimal: 'bg-transparent border-none',
  }

  return (
    <Card
      variant={
        variant === 'highlighted'
          ? 'gradient'
          : variant === 'minimal'
          ? 'outlined'
          : 'default'
      }
      padding={size}
      rounded='2xl'
      hover
      className={cn(
        'group transition-all duration-300 hover:scale-105',
        variantClasses[variant],
        className
      )}
    >
      <div className='text-center'>
        {showIcon && (
          <div className='mb-4'>
            <IconWrapper
              icon={icon}
              size='lg'
              variant='primary'
              showHoverEffect
              rounded='full'
            />
          </div>
        )}

        <div
          className={cn(
            'text-3xl md:text-4xl font-bold mb-2',
            variant === 'highlighted' ? 'text-primary' : 'text-foreground'
          )}
        >
          {value}
        </div>

        <div
          className={cn(
            'text-lg font-semibold mb-2',
            variant === 'highlighted' ? 'text-primary' : 'text-foreground'
          )}
        >
          {label}
        </div>

        {showDescription && description && (
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {description}
          </p>
        )}
      </div>
    </Card>
  )
}
