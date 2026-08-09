'use client'

import { QrCode, X, Download, Share2, User } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/provider'
import { Button } from '@/components/ui/button'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  qrCodeDataUrl: string
  car: {
    name: string
    year: number
    make: string
    model: string
    main_photo_url?: string | null
  }
  profile?: {
    username: string
    avatar_url?: string | null
    full_name?: string | null
  } | null
  currentUrl?: string
  onShare?: () => void
}

export const QRCodeModal = ({
  isOpen,
  onClose,
  qrCodeDataUrl,
  car,
  profile,
  currentUrl,
  onShare,
}: QRCodeModalProps) => {
  const { t } = useI18n()

  useEffect(() => {
    if (isOpen && onShare) {
      onShare()
    }
  }, [isOpen, onShare])

  if (!isOpen) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `qr-code-${car.name.replace(
      /[^a-zA-Z0-9]/g,
      '-'
    )}-${new Date().getTime()}.png`
    link.href = qrCodeDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(t('qr.downloaded', 'QR Code downloaded!'))
  }

  const handleCopyLink = () => {
    const urlToCopy =
      currentUrl || `${window.location.origin}/${profile?.username}/${car.name}`
    navigator.clipboard.writeText(urlToCopy)
    toast.success(t('qr.linkCopied', 'Link copied to clipboard!'))
  }

  return (
    <div
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-label={t('qr.title', 'QR Code')}
    >
      <div
        className='bg-card text-card-foreground border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200'
        onClick={e => e.stopPropagation()}
      >
        <div className='bg-primary px-6 py-4 text-primary-foreground'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center'>
                <QrCode className='w-5 h-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>
                  {t('qr.title', 'QR Code')}
                </h3>
                <p className='text-primary-foreground/80 text-sm'>
                  {t('qr.shareCar', 'Share this car easily')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='w-8 h-8 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer'
              aria-label={t('common.close', 'Close')}
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>

        <div className='p-6'>
          <div className='text-center mb-6'>
            <Image
              src={qrCodeDataUrl}
              alt={t('qr.title', 'QR Code')}
              width={192}
              height={192}
              className='w-48 h-48 mx-auto drop-shadow-lg mb-6 rounded-lg bg-white p-2'
              unoptimized
            />
            <p className='text-muted-foreground text-sm mb-2'>
              {t('qr.scanDescription', 'Scan this QR code with your phone camera')}
            </p>
            <p className='text-muted-foreground/80 text-xs'>
              {t('qr.opensCarPage', 'Opens the car page directly on your device')}
            </p>
          </div>

          <div className='bg-muted/50 border border-border rounded-lg p-4 mb-6'>
            <div className='flex items-center gap-3'>
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={
                    profile.full_name ||
                    profile.username ||
                    t('qr.profile', 'Profile')
                  }
                  width={48}
                  height={48}
                  className='w-12 h-12 rounded-full object-cover'
                  unoptimized
                />
              ) : car.main_photo_url ? (
                <Image
                  src={car.main_photo_url}
                  alt={car.name}
                  width={48}
                  height={48}
                  className='w-12 h-12 rounded-lg object-cover'
                  unoptimized
                />
              ) : (
                <div className='w-12 h-12 bg-muted rounded-lg flex items-center justify-center'>
                  <User className='w-6 h-6 text-muted-foreground' />
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <h4 className='font-semibold text-foreground truncate'>
                  {car.name}
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {car.make} {car.model} ({car.year})
                </p>
              </div>
            </div>
          </div>

          <div className='flex gap-3'>
            <Button onClick={handleDownload} className='flex-1' size='lg'>
              <Download className='w-4 h-4' />
              {t('qr.downloadPng', 'Download PNG')}
            </Button>
            <Button
              onClick={handleCopyLink}
              variant='secondary'
              className='flex-1'
              size='lg'
            >
              <Share2 className='w-4 h-4' />
              {t('qr.copyLink', 'Copy Link')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
