'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FullscreenPhotoViewerProps {
  isOpen: boolean
  onClose: () => void
  photos: Array<{ url: string; category?: string }>
  initialIndex: number
  carName: string
}

export const FullscreenPhotoViewer = ({
  isOpen,
  onClose,
  photos,
  initialIndex,
  carName,
}: FullscreenPhotoViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLoading, setIsLoading] = useState(true)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setIsLoading(true)
    }
  }, [isOpen, initialIndex])

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const navigatePhoto = useCallback(
    (direction: 'prev' | 'next') => {
      if (photos.length <= 1) return

      setCurrentIndex(prev => {
        if (direction === 'prev') {
          return prev === 0 ? photos.length - 1 : prev - 1
        } else {
          return prev === photos.length - 1 ? 0 : prev + 1
        }
      })
      // Reset zoom and rotation when changing photos
      setIsLoading(true)
    },
    [photos.length]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          navigatePhoto('prev')
          break
        case 'ArrowRight':
          navigatePhoto('next')
          break
        case 'Escape':
          onClose()
          break
      }
    },
    [isOpen, navigatePhoto, onClose]
  )

  const handleTouchStart = useRef<{ x: number; y: number } | null>(null)
  const handleTouchMove = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleTouchStart.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!handleTouchStart.current) return

    const touch = e.touches[0]
    handleTouchMove.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!handleTouchStart.current || !handleTouchMove.current) return

    const deltaX = handleTouchMove.current.x - handleTouchStart.current.x
    const deltaY = handleTouchMove.current.y - handleTouchStart.current.y
    const minSwipeDistance = 50

    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > minSwipeDistance
    ) {
      if (deltaX > 0) {
        navigatePhoto('prev')
      } else {
        navigatePhoto('next')
      }
    }

    handleTouchStart.current = null
    handleTouchMove.current = null
  }, [navigatePhoto])

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent body scroll when viewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const currentPhoto = photos[currentIndex]
  if (!currentPhoto) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className='max-w-none w-screen h-screen p-0 bg-black/95 border-0 rounded-none overflow-hidden'
      >
        <DialogTitle className='sr-only'>
          {carName} - Photo {currentIndex + 1} of {photos.length}
        </DialogTitle>
        <div
          ref={containerRef}
          className='relative w-full h-full flex items-center justify-center'
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Top Controls */}
          <div
            className='absolute left-4 right-4 z-20 flex items-center justify-between'
            style={{
              top: 'max(1rem, env(safe-area-inset-top, 0px) + 1rem)',
            }}
          >
            {/* Photo Counter */}
            {photos.length > 1 && (
              <div className='px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm'>
                {currentIndex + 1} / {photos.length}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className='p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer backdrop-blur-sm'
              aria-label='Close viewer'
            >
              <X className='w-6 h-6' />
            </button>
          </div>

          {/* Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => navigatePhoto('prev')}
                className='absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer backdrop-blur-sm'
                aria-label='Previous photo'
              >
                <ChevronLeft className='size-6' />
              </button>
              <button
                onClick={() => navigatePhoto('next')}
                className='absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer backdrop-blur-sm'
                aria-label='Next photo'
              >
                <ChevronRight className='size-6' />
              </button>
            </>
          )}

          {/* Main Photo */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className='relative w-full h-full flex items-center justify-center'
            >
              <img
                ref={imageRef}
                src={currentPhoto.url}
                alt={`${carName} - ${currentPhoto.category || 'photo'} ${
                  currentIndex + 1
                }`}
                className={cn(
                  'max-w-full max-h-full object-contain transition-all duration-300'
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />

              {/* Loading State */}
              {isLoading && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Keyboard Shortcuts Help */}
          <div className='absolute bottom-20 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/30 text-white/70 text-xs rounded-lg backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300'>
            <div className='text-center'>
              <div>← → Navigate • ESC Close • Z Zoom • R Rotate</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
