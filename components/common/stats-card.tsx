import { LucideIcon, Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconWrapper } from './icon-wrapper'
import { Card } from './card'
import { PremiumButton } from './premium-button'

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

export const StatsCard = ({
  stat,
  className = '',
  showIcon = true,
  showDescription = true,
  variant = 'default',
  size = 'md',
}: StatsCardProps) => {
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
          'p-2 md:p-3',
          'transition-all duration-200',
          !isPremium && premiumUpgradeHref && [
            'border-2 border-amber-400/40 dark:border-amber-500/40',
            'bg-gradient-to-br from-amber-50/30 via-yellow-50/20 to-amber-50/30',
            'dark:from-amber-950/20 dark:via-yellow-950/10 dark:to-amber-950/20',
            'hover:border-amber-400/60 dark:hover:border-amber-500/60',
            'hover:shadow-lg hover:shadow-amber-500/20 dark:hover:shadow-amber-600/20',
          ],
          className,
          statClassName
        )}
      >
        <div className='flex flex-col items-center justify-center gap-1 md:gap-2'>
          {/* Label text - desktop only */}
          <div className='hidden md:block text-xs font-medium text-muted-foreground text-center'>
            {label}
          </div>
          <div className='flex items-center justify-center gap-2 md:gap-3'>
            {!isPremium && premiumUpgradeHref ? (
              <div className='relative flex items-center justify-center'>
                <Crown className='w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400 flex-shrink-0' />
                <Sparkles
                  className='absolute -top-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 text-amber-600 dark:text-amber-400 animate-pulse'
                />
              </div>
            ) : (
              <IconWrapper
                icon={icon}
                size='sm'
                variant={isPremium ? 'primary' : 'muted'}
                className='w-4 h-4 md:w-5 md:h-5 flex-shrink-0'
              />
            )}
            <div
              className={cn(
                'text-base md:text-xl font-semibold text-card-foreground',
                !isPremium && premiumUpgradeHref && 'text-amber-700 dark:text-amber-300'
              )}
            >
              {!isPremium && premiumUpgradeHref ? '—' : value}
            </div>
          </div>
        </div>

        {/* Premium upgrade overlay */}
        {!isPremium && premiumUpgradeHref && (
          <div className='absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/10 dark:from-amber-600/10 dark:via-yellow-600/5 dark:to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-xs'>
            <PremiumButton
              featureName={label}
              featureDescription={`View your ${label.toLowerCase()} statistics with premium access.`}
              size='sm'
              variant='default'
            >
              Upgrade to Premium
            </PremiumButton>
          </div>
        )}
      </Card>
    )
  }

  // Regular stat card
  const regularStat = stat as Stat
  const { icon, value, label, description } = regularStat

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
