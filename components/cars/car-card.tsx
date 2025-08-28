import { Car, Profile } from '@/lib/types/database'
import { Share2, Edit, Image } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CarCardProps {
  car: Car
  profile: Profile | null
  onEdit?: (car: Car) => void
  onShare?: (car: Car) => void
  className?: string
  showActions?: boolean
  isOwner?: boolean
}

export default function CarCard({
  car,
  profile,
  onEdit,
  onShare,
  className,
  showActions = true,
  isOwner = false,
}: CarCardProps) {
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
              {car.make} {car.model}
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
