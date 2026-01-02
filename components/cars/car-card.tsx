import { Car, Profile } from '@/lib/types/database'
import { Share2, Image, Edit, Crown } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LikeButton } from '@/components/common/like-button'
import { UserAvatar } from '@/components/common/user-avatar'
import { QRCodeModal } from '@/components/common/qr-code-modal'
import { generateQRCodeWithLogo } from '@/lib/utils/qr-code-with-logo'
import { NationalityFlag } from '@/components/common/nationality-flag'

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

export const CarCard = ({
  car,
  profile,
  onEdit,
  onShare,
  onLikeChange,
  className,
  showActions = true,
  isOwner = false,
}: CarCardProps) => {
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(car.like_count || 0)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showQRCode, setShowQRCode] = useState(false)

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onEdit?.(car)
  }

  const handleLikeChange = (carId: string, newLikeCount: number) => {
    setLikeCount(newLikeCount)
    onLikeChange?.(carId, newLikeCount)
  }

  const handleQRCode = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!qrCodeDataUrl) {
      try {
        const shareUrl = `${window.location.origin}/u/${profile?.username}/${car.url_slug}`
        const dataUrl = await generateQRCodeWithLogo(shareUrl, '/icon.jpg', {
          width: 200,
          margin: 1,
          logoSize: 50,
        })
        setQrCodeDataUrl(dataUrl)
        setShowQRCode(true)
        // Track share analytics when QR code modal opens
        onShare?.(car)
      } catch {
        toast.error('Failed to generate QR code')
      }
    } else {
      setShowQRCode(true)
      // Track share analytics when QR code modal opens
      onShare?.(car)
    }
  }

  const handleImageClick = () => {
    router.push(`/u/${profile?.username || 'user'}/${car.url_slug}`)
  }

  return (
    <article
      className={cn(
        'bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
      role='article'
      aria-label={`${car.name} - ${car.make} ${car.model} ${car.year}`}
    >
      {/* Photo */}
      <div
        className='relative aspect-[4/3] bg-muted overflow-hidden cursor-pointer focus-within:outline-none'
        onClick={handleImageClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleImageClick()
          }
        }}
        tabIndex={0}
        role='button'
        aria-label={`View details for ${car.name}`}
      >
        {(() => {
          // Get the photo URL to display
          const photoUrl =
            car.main_photo_url ||
            (car.photos && car.photos.length > 0 && car.photos[0]?.url) ||
            (car.photos &&
            car.photos.length > 0 &&
            typeof car.photos[0] === 'string'
              ? car.photos[0]
              : null)

          return photoUrl ? (
            <img
              src={photoUrl}
              alt={`${car.name || 'Car'} - ${car.make} ${car.model} ${car.year}`}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out'
              loading='lazy'
              decoding='async'
              onError={e => {
                // Fallback to placeholder on error
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const placeholder = target.nextElementSibling as HTMLElement
                if (placeholder) {
                  placeholder.style.display = 'flex'
                }
              }}
            />
          ) : (
            <div
              className='w-full h-full flex items-center justify-center bg-muted/50'
              aria-hidden='true'
            >
              <Image className='w-12 h-12 text-muted-foreground/50' />
            </div>
          )
        })()}

        {/* Actions Overlay */}
        {showActions && (
          <div
            className='absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200'
            role='group'
            aria-label='Car actions'
          >
            {isOwner && onEdit && (
              <button
                onClick={handleEdit}
                title='Edit car'
                aria-label='Edit car'
                className='flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 cursor-pointer'
              >
                <Edit className='w-4 h-4' aria-hidden='true' />
              </button>
            )}

            <button
              onClick={handleQRCode}
              title='Share car via QR Code'
              aria-label='Share car via QR Code'
              className='flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 cursor-pointer'
            >
              <Share2 className='w-4 h-4' aria-hidden='true' />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className='p-4 cursor-pointer focus-within:outline-none'
        onClick={() => {
          // Navigate to car detail page
          router.push(`/u/${profile?.username || 'user'}/${car.url_slug}`)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            router.push(`/u/${profile?.username || 'user'}/${car.url_slug}`)
          }
        }}
        tabIndex={0}
        role='button'
        aria-label={`View details for ${car.name}`}
      >
        {/* Car Info */}
        <div className='mb-3'>
          <h3 className='font-semibold text-foreground mb-1 line-clamp-1'>
            {car.name}
          </h3>
          <p className='text-sm text-muted-foreground'>
            {car.make} {car.model} ({car.year})
          </p>
        </div>

        {/* Profile Info */}
        {profile && (
          <div className='flex items-center gap-2 mb-3'>
            <UserAvatar
              avatarUrl={profile.avatar_url}
              username={profile.username}
              size='sm'
            />
            <span className='text-sm text-muted-foreground flex items-center gap-1'>
              {profile.is_premium && (
                <Crown className='w-3.5 h-3.5 text-yellow-500' />
              )}
              @{profile.username}
              {profile.nationality && (
                <NationalityFlag
                  nationality={profile.nationality}
                  size='sm'
                />
              )}
            </span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className='flex items-center justify-between'>
            <LikeButton
              carId={car.id}
              initialLikeCount={likeCount}
              isOwner={isOwner}
              onLikeChange={handleLikeChange}
              variant='minimal'
              size='sm'
            />

            <Link
              href={`/u/${profile?.username || 'user'}/${car.url_slug}`}
              className='text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer ml-auto'
            >
              View Details →
            </Link>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        qrCodeDataUrl={qrCodeDataUrl}
        car={car}
        profile={profile}
        currentUrl={`${window.location.origin}/u/${profile?.username}/${car.url_slug}`}
      />
    </article>
  )
}
