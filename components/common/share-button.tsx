import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ShareButtonProps {
  url: string
  title?: string
  text?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  children?: React.ReactNode
  onShare?: (platform: 'copy_link' | 'native_share') => void
}

export const ShareButton = ({
  url,
  title,
  text,
  className,
  variant = 'default',
  size = 'md',
  showIcon = true,
  children,
  onShare,
}: ShareButtonProps) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      // Always copy to clipboard first
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
      onShare?.('copy_link')

      // Then try native sharing if available (mobile devices)
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Check out this car!',
            text: text || 'I found this amazing car on MyRide',
            url: url,
          })
          onShare?.('native_share')
        } catch {
          // Native sharing failed, but clipboard copy already succeeded
        }
      }
    } catch {
      toast.error('Failed to copy link to clipboard')

      // Try native sharing as fallback
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Check out this car!',
            text: text || 'I found this amazing car on MyRide',
            url: url,
          })
          onShare?.('native_share')
        } catch {
          toast.error('Failed to share link')
        }
      }
    }
  }

  return (
    <Button
      onClick={handleShare}
      className={cn('cursor-pointer drop-shadow', className)}
      title='Share this car'
      variant={variant === 'default' ? 'default' : variant}
      size={size === 'md' ? 'default' : size}
    >
      {showIcon && <Share2 className={cn('w-4 h-4 mr-2')} />}
      {children || 'Share'}
    </Button>
  )
}
