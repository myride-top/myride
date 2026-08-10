'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ClubBadgeInfo } from '@/lib/types/database'
import { buildLocalePath } from '@/lib/i18n/config'
import { useI18n } from '@/lib/i18n/provider'

interface ClubBadgesProps {
  clubs: ClubBadgeInfo[]
  size?: 'xs' | 'sm' | 'md'
  className?: string
  maxVisible?: number
  mode?: 'primary' | 'all'
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
} as const

const primarySizeClasses = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-7 h-7',
} as const

export const ClubBadges = ({
  clubs,
  size = 'sm',
  className,
  maxVisible = 4,
  mode = 'primary',
}: ClubBadgesProps) => {
  const { locale } = useI18n()

  if (!clubs || clubs.length === 0) {
    return null
  }

  const sorted = [...clubs].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.name.localeCompare(b.name)
  })

  if (mode === 'primary') {
    const primary =
      sorted.find(club => club.is_primary) ?? sorted[0] ?? null
    const others = sorted.filter(club => club.id !== primary?.id)
    const otherNames = others.map(club => club.name).join(', ')

    if (!primary) {
      return null
    }

    return (
      <span
        className={cn('inline-flex items-center gap-1 flex-shrink-0', className)}
        aria-label='Club badge'
      >
        <Link
          href={buildLocalePath(locale, `/c/${primary.slug}`)}
          title={primary.name}
          className='inline-flex rounded-full ring-2 ring-primary/60 overflow-hidden hover:ring-primary transition-shadow'
          onClick={e => e.stopPropagation()}
        >
          <Image
            src={primary.badge_url}
            alt={primary.name}
            width={size === 'md' ? 28 : size === 'sm' ? 24 : 20}
            height={size === 'md' ? 28 : size === 'sm' ? 24 : 20}
            className={cn(primarySizeClasses[size], 'object-cover')}
            unoptimized
          />
        </Link>
        {others.length > 0 && (
          <span
            className='text-[10px] text-muted-foreground font-medium cursor-default'
            title={otherNames}
          >
            +{others.length}
          </span>
        )}
      </span>
    )
  }

  const visible = sorted.slice(0, maxVisible)
  const remaining = sorted.length - visible.length

  return (
    <span
      className={cn('inline-flex items-center gap-1 flex-shrink-0', className)}
      aria-label='Club badges'
    >
      {visible.map(club => (
        <Link
          key={club.id}
          href={buildLocalePath(locale, `/c/${club.slug}`)}
          title={club.name}
          className={cn(
            'inline-flex rounded-full overflow-hidden hover:ring-primary/50 transition-shadow',
            club.is_primary
              ? 'ring-2 ring-primary/60'
              : 'ring-1 ring-border/60'
          )}
          onClick={e => e.stopPropagation()}
        >
          <Image
            src={club.badge_url}
            alt={club.name}
            width={size === 'md' ? 24 : size === 'sm' ? 20 : 16}
            height={size === 'md' ? 24 : size === 'sm' ? 20 : 16}
            className={cn(
              club.is_primary ? primarySizeClasses[size] : sizeClasses[size],
              'object-cover'
            )}
            unoptimized
          />
        </Link>
      ))}
      {remaining > 0 && (
        <span
          className='text-[10px] text-muted-foreground font-medium'
          title={sorted
            .slice(maxVisible)
            .map(club => club.name)
            .join(', ')}
        >
          +{remaining}
        </span>
      )}
    </span>
  )
}
