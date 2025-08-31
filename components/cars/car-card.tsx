import { Car, Profile } from '@/lib/types/database'
import { Share2, Image, Heart } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/context/auth-context'
import { useState, useEffect } from 'react'
import {
  likeCarClient,
  unlikeCarClient,
  hasUserLikedCarClient,
} from '@/lib/database/cars-client'

interface CarCardProps {
  car: Car
  profile: Profile | null
  onEdit?: (car: Car) => void
  onShare?: (car: Car) => void
  onLikeChange?: (carId: string, newLikeCount: number) => void
  className?: string
  showActions?: boolean
  isOwner?: boolean
}

export default function CarCard({
  car,
  profile,
  onEdit,
  onShare,
  onLikeChange,
  className,
  showActions = true,
  isOwner = false,
}: CarCardProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(car.like_count || 0)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  // Check if current user has liked this car
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user && !isOwner) {
        try {
          const liked = await hasUserLikedCarClient(car.id, user.id)
          setIsLiked(liked)
        } catch (error) {}
      }
    }

    checkLikeStatus()
  }, [user, car.id, isOwner])
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/${profile?.username}/${car.url_slug}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
      onShare?.(car)
    } catch (error) {
      toast.error(`Failed to copy link (${error})`)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(car)
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      toast.error('Please sign in to like cars')
      return
    }

    if (isLikeLoading) return

    setIsLikeLoading(true)
    try {
      if (isLiked) {
        await unlikeCarClient(car.id, user.id)
        const newCount = likeCount - 1
        setLikeCount(newCount)
        setIsLiked(false)
        toast.success('Car unliked')
        onLikeChange?.(car.id, newCount)
      } else {
        await likeCarClient(car.id, user.id)
        const newCount = likeCount + 1
        setLikeCount(newCount)
        setIsLiked(true)
        toast.success('Car liked!')
        onLikeChange?.(car.id, newCount)
      }
    } catch (error) {
      toast.error('Failed to update like status')
    } finally {
      setIsLikeLoading(false)
    }
  }

  const getMainPhotoUrl = () => {
    if (car.main_photo_url) return car.main_photo_url

    if (car.photos && car.photos.length > 0) {
      const exteriorPhoto = car.photos.find(
        p => typeof p === 'object' && p.category === 'exterior'
      )
      if (exteriorPhoto && typeof exteriorPhoto === 'object') {
        return exteriorPhoto.url
      }
      return typeof car.photos[0] === 'string'
        ? car.photos[0]
        : car.photos[0].url
    }

    return null
  }

  const photoCount = car.photos?.length || 0

  return (
    <div
      className={cn(
        'bg-card overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200 relative border border-border',
        className
      )}
    >
      <Link href={`/${profile?.username}/${car.url_slug}`} className='block'>
        <div className='p-6 cursor-pointer'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-medium text-card-foreground'>
              {car.name}
            </h3>
            <div className='flex items-center space-x-2'>
              {photoCount > 0 && (
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary'>
                  📸 {photoCount}
                </span>
              )}
            </div>
          </div>

          <div>
            {getMainPhotoUrl() ? (
              <div className='relative'>
                <img
                  src={getMainPhotoUrl() ?? ''}
                  alt={`${car.make} ${car.model}`}
                  className='w-full h-48 object-cover rounded-md'
                />
              </div>
            ) : (
              <div className='w-full h-48 bg-muted rounded-md flex items-center justify-center'>
                <Image className='w-16 h-16 text-muted-foreground' />
              </div>
            )}
          </div>
        </div>
      </Link>

      {showActions && (
        <div className='px-6 pb-6'>
          <div className='flex space-x-2'>
            {isOwner && (
              <button
                onClick={handleEdit}
                className='flex-1 px-3 py-2 border border-primary text-primary dark:text-primary rounded-md focus:ring-2 ring-offset-2 ring-ring text-center cursor-pointer text-sm font-medium focus:outline-none hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors'
              >
                Edit car
              </button>
            )}
            {!isOwner && user && (
              <button
                onClick={handleLike}
                disabled={isLikeLoading}
                className={cn(
                  'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 ring-offset-2 ring-ring transition-colors cursor-pointer',
                  isLiked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
                title={isLiked ? 'Unlike car' : 'Like car'}
              >
                <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>
            )}
            {isOwner && likeCount > 0 && (
              <div className='flex items-center space-x-1 px-3 py-2 bg-muted rounded-md text-sm font-medium text-muted-foreground'>
                <Heart className='w-4 h-4' />
                <span>{likeCount}</span>
              </div>
            )}
            <button
              onClick={handleShare}
              className='px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 ring-offset-2 ring-ring transition-colors cursor-pointer'
              title='Copy link to clipboard'
            >
              <Share2 className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
