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
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
} as const

export const ClubBadges = ({
  clubs,
  size = 'sm',
  className,
  maxVisible = 4,
}: ClubBadgesProps) => {
  const { locale } = useI18n()

  if (!clubs || clubs.length === 0) {
    return null
  }

  const visible = clubs.slice(0, maxVisible)
  const remaining = clubs.length - visible.length

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
          className='inline-flex rounded-full ring-1 ring-border/60 overflow-hidden hover:ring-primary/50 transition-shadow'
          onClick={e => e.stopPropagation()}
        >
          <Image
            src={club.badge_url}
            alt={club.name}
            width={size === 'md' ? 24 : size === 'sm' ? 20 : 16}
            height={size === 'md' ? 24 : size === 'sm' ? 20 : 16}
            className={cn(sizeClasses[size], 'object-cover')}
            unoptimized
          />
        </Link>
      ))}
      {remaining > 0 && (
        <span className='text-[10px] text-muted-foreground font-medium'>
          +{remaining}
        </span>
      )}
    </span>
  )
}
