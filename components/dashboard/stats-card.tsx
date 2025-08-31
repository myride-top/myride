import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export interface DashboardStat {
  icon: LucideIcon
  label: string
  value: string | number
  isPremium?: boolean
  premiumUpgradeHref?: string
  className?: string
}

interface StatsCardProps {
  stat: DashboardStat
  className?: string
}

export default function StatsCard({ stat, className = '' }: StatsCardProps) {
  const {
    icon: Icon,
    label,
    value,
    isPremium = true,
    premiumUpgradeHref,
    className: statClassName,
  } = stat

  return (
    <div
      className={cn(
        'bg-card overflow-hidden shadow rounded-lg border border-border group relative',
        className,
        statClassName
      )}
    >
      <div className='p-3 md:p-5'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <Icon
              className={cn(
                'w-5 h-5 md:w-6 md:h-6',
                isPremium ? 'text-foreground' : 'text-muted-foreground'
              )}
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
    </div>
  )
}
