'use client'

import { QrCode, X, Download, Share2, User } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'

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
  } | null
  currentUrl?: string
  onShare?: () => void
}

export default function QRCodeModal({
  isOpen,
  onClose,
  qrCodeDataUrl,
  car,
  profile,
  currentUrl,
  onShare,
}: QRCodeModalProps) {
  // Track share analytics when modal opens
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
    toast.success('QR Code downloaded!')
  }

  const handleCopyLink = () => {
    const urlToCopy =
      currentUrl || `${window.location.origin}/${profile?.username}/${car.name}`
    navigator.clipboard.writeText(urlToCopy)
    toast.success('Link copied to clipboard!')
  }

  return (
    <div
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                <QrCode className='w-5 h-5 text-white' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>QR Code</h3>
                <p className='text-blue-100 text-sm'>Share this car easily</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer'
            >
              <X className='w-4 h-4 text-white' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6'>
          <div className='text-center mb-6'>
            <img
              src={qrCodeDataUrl}
              alt='QR Code'
              className='w-48 h-48 mx-auto drop-shadow-lg mb-6'
            />
            <p className='text-gray-600 dark:text-gray-300 text-sm mb-2'>
              Scan this QR code with your phone camera
            </p>
            <p className='text-gray-500 dark:text-gray-400 text-xs'>
              Opens the car page directly on your device
            </p>
          </div>

          {/* Car Info */}
          <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6'>
            <div className='flex items-center gap-3'>
              {car.main_photo_url ? (
                <img
                  src={car.main_photo_url}
                  alt={car.name}
                  className='w-12 h-12 rounded-lg object-cover'
                />
              ) : (
                <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
                  <User className='w-6 h-6 text-gray-400' />
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <h4 className='font-semibold text-gray-900 dark:text-white truncate'>
                  {car.name}
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  {car.make} {car.model} ({car.year})
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-3'>
            <button
              onClick={handleDownload}
              className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer'
            >
              <Download className='w-4 h-4' />
              Download PNG
            </button>
            <button
              onClick={handleCopyLink}
              className='flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer'
            >
              <Share2 className='w-4 h-4' />
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
