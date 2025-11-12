'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, BarChart3, Share2, Car, MapPin, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PremiumRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  featureName?: string
  featureDescription?: string
}

export function PremiumRequiredDialog({
  open,
  onOpenChange,
  featureName,
  featureDescription,
}: PremiumRequiredDialogProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onOpenChange(false)
    router.push('/premium')
  }

  const defaultDescription =
    featureDescription ||
    'This feature is available exclusively for Premium members.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg'>
              <Crown className='w-6 h-6 text-white' />
            </div>
            <DialogTitle className='text-2xl'>
              {featureName || 'Premium Feature'}
            </DialogTitle>
          </div>
          <DialogDescription className='text-base'>
            {defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <Car className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
              <div>
                <h4 className='font-semibold text-sm mb-1'>
                  Unlimited Cars
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Add as many cars as you want to your garage with no limits.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <BarChart3 className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
              <div>
                <h4 className='font-semibold text-sm mb-1'>
                  Advanced Analytics
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Get detailed insights into your cars and events performance.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Share2 className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
              <div>
                <h4 className='font-semibold text-sm mb-1'>
                  Share Your Garage
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Make your profile public and shareable with a custom URL.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <MapPin className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
              <div>
                <h4 className='font-semibold text-sm mb-1'>
                  Create Events
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Create and manage car meets, shows, and gatherings on the map.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Sparkles className='w-5 h-5 text-primary mt-0.5 flex-shrink-0' />
              <div>
                <h4 className='font-semibold text-sm mb-1'>
                  Premium Benefits
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Access to all premium features and exclusive updates.
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-foreground mb-1'>$10</div>
              <div className='text-sm text-muted-foreground'>
                One-time payment, lifetime access
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='flex-col sm:flex-row gap-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='w-full sm:w-auto'
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            className='w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          >
            <Crown className='w-4 h-4 mr-2' />
            Upgrade to Premium
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

