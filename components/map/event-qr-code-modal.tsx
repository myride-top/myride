'use client'

import { QrCode, X, Download, Share2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

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
  // Track share analytics when modal opens
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
    toast.success('QR Code downloaded!')
  }

  const handleCopyLink = () => {
    const urlToCopy = currentUrl || window.location.href
    navigator.clipboard.writeText(urlToCopy)
    toast.success('Link copied to clipboard!')
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
      className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative'
        style={{ zIndex: 100000 }}
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
                <p className='text-blue-100 text-sm'>Share this event easily</p>
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
          <div className='space-y-4'>
            {/* Event Info Card - Above QR Code */}
            <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <Calendar className='w-5 h-5 text-white' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-semibold text-gray-900 dark:text-white mb-1'>
                    {event.title}
                  </h4>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>
                    {event.end_date
                      ? `${formatDateTime(event.event_date)} - ${formatDateTime(
                          event.end_date
                        )}`
                      : formatDateTime(event.event_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className='text-center'>
              <img
                src={qrCodeDataUrl}
                alt='QR Code'
                className='w-64 h-64 mx-auto drop-shadow-lg mb-3'
              />
              <p className='text-gray-600 dark:text-gray-300 text-sm mb-1'>
                Scan this QR code with your phone camera
              </p>
              <p className='text-gray-500 dark:text-gray-400 text-xs'>
                Opens the event page directly on your device
              </p>
            </div>

            {/* Actions - Under QR Code */}
            <div className='flex flex-row gap-3'>
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
    </div>
  )

  // Render in a portal to ensure it's above everything
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return null
}
