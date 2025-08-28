import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  url: string
  title?: string
  text?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  children?: React.ReactNode
  onShare?: () => void
}

export default function ShareButton({
  url,
  title,
  text,
  className,
  variant = 'default',
  size = 'md',
  showIcon = true,
  children,
  onShare,
}: ShareButtonProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border text-foreground bg-card hover:bg-accent',
    ghost: 'text-foreground hover:bg-accent',
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      // Always copy to clipboard first
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
      onShare?.()

      // Then try native sharing if available (mobile devices)
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Check out this car!',
            text: text || 'I found this amazing car on MyRide',
            url: url,
          })
        } catch (shareError) {
          // Native sharing failed, but clipboard copy already succeeded
          console.log(
            `Native sharing failed, but link copied to clipboard (${shareError})`
          )
        }
      }
    } catch (clipboardError) {
      console.error('Error copying to clipboard:', clipboardError)
      toast.error('Failed to copy link to clipboard')

      // Try native sharing as fallback
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Check out this car!',
            text: text || 'I found this amazing car on MyRide',
            url: url,
          })
        } catch (shareError) {
          console.error('Both clipboard and native sharing failed:', shareError)
          toast.error('Failed to share link')
        }
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className={cn(
        'inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 ring-offset-2 ring-ring transition-colors cursor-pointer drop-shadow',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      title='Share this car'
    >
      {showIcon && <Share2 className={cn('w-4 h-4 mr-2')} />}
      {children || 'Share'}
    </button>
  )
}
