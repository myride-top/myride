import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/context/auth-context'
import {
  likeCarClient,
  unlikeCarClient,
  hasUserLikedCarClient,
} from '@/lib/database/cars-client'
import { toast } from 'sonner'

interface LikeButtonProps {
  carId: string
  initialLikeCount: number
  isOwner: boolean
  onLikeChange?: (carId: string, newLikeCount: number) => void
  className?: string
  variant?: 'default' | 'minimal' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  disabled?: boolean
}

export const LikeButton = ({
  carId,
  initialLikeCount,
  isOwner,
  onLikeChange,
  className = '',
  variant = 'default',
  size = 'md',
  showCount = true,
  disabled = false,
}: LikeButtonProps) => {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)

  // Check if current user has liked this car
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user && !isOwner && !disabled) {
        try {
          const liked = await hasUserLikedCarClient(carId, user.id)
          setIsLiked(liked)
        } catch {
          // Silently fail - user can still interact
        }
      }
    }

    checkLikeStatus()
  }, [user, carId, isOwner, disabled])

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!user) {
      toast.error('Please sign in to like cars')
      return
    }

    if (isLoading || disabled) return

    setIsLoading(true)
    try {
      if (isLiked) {
        await unlikeCarClient(carId, user.id)
        const newCount = Math.max(0, likeCount - 1)
        setLikeCount(newCount)
        setIsLiked(false)
        toast.success('Car unliked')
        onLikeChange?.(carId, newCount)
      } else {
        await likeCarClient(carId, user.id)
        const newCount = likeCount + 1
        setLikeCount(newCount)
        setIsLiked(true)
        toast.success('Car liked!')
        onLikeChange?.(carId, newCount)
      }
    } catch {
      toast.error('Failed to update like status')
    } finally {
      setIsLoading(false)
    }
  }

  const variantClasses = {
    default: 'bg-muted hover:bg-muted/80',
    minimal: 'bg-transparent hover:bg-muted/20',
    outline: 'border border-border bg-background hover:bg-muted/20',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  // If user is owner, show read-only like count
  if (isOwner) {
    if (likeCount === 0) return null

    return (
      <div
        className={cn(
          'flex items-center space-x-2 px-3 py-2 bg-muted rounded-md text-sm font-medium text-muted-foreground',
          sizeClasses[size],
          className
        )}
      >
        <Heart className={iconSizes[size]} />
        <span>
          {likeCount} like{likeCount !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  // Interactive like button for non-owners
  return (
    <button
      onClick={handleLike}
      disabled={isLoading || disabled}
      className={cn(
        'flex items-center space-x-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      title={isLiked ? 'Unlike car' : 'Like car'}
    >
      <Heart
        className={cn(
          iconSizes[size],
          isLiked ? 'fill-current text-red-500' : ''
        )}
      />
      {showCount && (
        <span>
          {likeCount > 0
            ? `${likeCount} like${likeCount !== 1 ? 's' : ''}`
            : 'Like'}
        </span>
      )}
    </button>
  )
}
