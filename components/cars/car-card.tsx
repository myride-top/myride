import { Car, Profile } from '@/lib/types/database'
import { Share2, Image, Edit, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import QRCode from 'qrcode'
import { useRouter } from 'next/navigation'
import LikeButton from '@/components/common/like-button'
import UserAvatar from '@/components/common/user-avatar'
import QRCodeModal from '@/components/common/qr-code-modal'

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
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(car.like_count || 0)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showQRCode, setShowQRCode] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
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
        const shareUrl = `${window.location.origin}/${profile?.username}/${car.url_slug}`
        const dataUrl = await QRCode.toDataURL(shareUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
        setQrCodeDataUrl(dataUrl)
        setShowQRCode(true)
      } catch (error) {
        toast.error('Failed to generate QR code')
      }
    } else {
      setShowQRCode(true)
    }
  }

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group',
        className
      )}
    >
      {/* Photo */}
      <div className='relative aspect-[4/3] bg-muted overflow-hidden'>
        {car.main_photo_url ? (
          <img
            src={car.main_photo_url}
            alt={car.name}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <Image className='w-12 h-12 text-muted-foreground' />
          </div>
        )}

        {/* Actions Overlay */}
        {showActions && (
          <div className='absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
            {isOwner && onEdit && (
              <button
                onClick={handleEdit}
                title='Edit car'
                className='p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors cursor-pointer'
              >
                <Edit className='w-4 h-4' />
              </button>
            )}

            <button
              onClick={handleShare}
              title='Share car'
              className='p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors cursor-pointer'
            >
              <Share2 className='w-4 h-4' />
            </button>

            <button
              onClick={handleQRCode}
              title='Generate QR Code'
              className='p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors cursor-pointer'
            >
              <QrCode className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className='p-4 cursor-pointer'
        onClick={() => {
          // Navigate to car detail page
          router.push(`/${profile?.username || 'user'}/${car.url_slug}`)
        }}
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
            <span className='text-sm text-muted-foreground'>
              @{profile.username}
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
              href={`/${profile?.username || 'user'}/${car.url_slug}`}
              className='text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer'
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
        currentUrl={`${window.location.origin}/${profile?.username}/${car.url_slug}`}
      />
    </div>
  )
}
