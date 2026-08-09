'use client'

import { QrCode, X, Download, Share2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n/provider'
import { Button } from '@/components/ui/button'

interface EventQRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  qrCodeDataUrl: string
  event: {
    title: string
    event_date: string
    end_date?: string | null
    description?: string | null
  }
  currentUrl?: string
  onShare?: () => void
}

export const EventQRCodeModal = ({
  isOpen,
  onClose,
  qrCodeDataUrl,
  event,
  currentUrl,
  onShare,
}: EventQRCodeModalProps) => {
  const { t } = useI18n()

  useEffect(() => {
    if (isOpen && onShare) {
      onShare()
    }
  }, [isOpen, onShare])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `qr-code-${event.title.replace(
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
    const urlToCopy = currentUrl || window.location.href
    navigator.clipboard.writeText(urlToCopy)
    toast.success(t('qr.linkCopied', 'Link copied to clipboard!'))
  }

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year}, ${hours}:${minutes}`
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200'
      style={{ zIndex: 99999 }}
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-label={t('qr.title', 'QR Code')}
    >
      <div
        className='bg-card text-card-foreground border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200'
        style={{ zIndex: 100000 }}
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
                  {t('map.qr.shareEvent', 'Share this event easily')}
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
          <div className='space-y-4'>
            <div className='bg-muted/50 border border-border rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Calendar className='w-5 h-5 text-primary-foreground' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-semibold text-foreground mb-1'>
                    {event.title}
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    {event.end_date
                      ? `${formatDateTime(event.event_date)} - ${formatDateTime(
                          event.end_date
                        )}`
                      : formatDateTime(event.event_date)}
                  </p>
                </div>
              </div>
            </div>

            <div className='text-center'>
              <Image
                src={qrCodeDataUrl}
                alt={t('qr.title', 'QR Code')}
                width={256}
                height={256}
                className='w-64 h-64 mx-auto drop-shadow-lg mb-3 rounded-lg bg-white p-2'
                unoptimized
              />
              <p className='text-muted-foreground text-sm mb-1'>
                {t(
                  'qr.scanDescription',
                  'Scan this QR code with your phone camera'
                )}
              </p>
              <p className='text-muted-foreground/80 text-xs'>
                {t(
                  'map.qr.opensEvent',
                  'Opens the event page directly on your device'
                )}
              </p>
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
    </div>
  )

  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return null
}
