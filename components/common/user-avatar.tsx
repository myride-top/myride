import React from 'react'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  avatarUrl?: string | null
  username: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showFallback?: boolean
}

export default function UserAvatar({
  avatarUrl,
  username,
  size = 'md',
  className = '',
  showFallback = true,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${username}'s avatar`}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  if (!showFallback) {
    return null
  }

  return (
    <div
      className={cn(
        'rounded-full bg-muted flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      <User className={cn('text-muted-foreground', iconSizes[size])} />
    </div>
  )
}

// Extended component with initials fallback
interface UserAvatarWithInitialsProps extends UserAvatarProps {
  fullName?: string | null
}

export function UserAvatarWithInitials({
  avatarUrl,
  username,
  fullName,
  size = 'md',
  className = '',
  showFallback = true,
}: UserAvatarWithInitialsProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${username}'s avatar`}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  if (!showFallback) {
    return null
  }

  // Try to get initials from full name, fallback to username
  const getInitials = () => {
    if (fullName) {
      const names = fullName.trim().split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    return username.charAt(0).toUpperCase()
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold',
        sizeClasses[size],
        textSizes[size],
        className
      )}
    >
      {getInitials()}
    </div>
  )
}
