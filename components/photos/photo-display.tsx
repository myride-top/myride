'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FullscreenPhotoViewer } from './fullscreen-photo-viewer'
import { cn } from '@/lib/utils'

interface PhotoDisplayProps {
  photos: Array<{ url: string; category?: string }>
  carName: string
  className?: string
  showFullscreen?: boolean
  onPhotoClick?: (index: number) => void
}

export function PhotoDisplay({
  photos,
  carName,
  className,
  showFullscreen = true,
  onPhotoClick,
}: PhotoDisplayProps) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  const handlePhotoClick = (index: number) => {
    if (onPhotoClick) {
      onPhotoClick(index)
    } else if (showFullscreen) {
      setSelectedPhotoIndex(index)
      setIsFullscreenOpen(true)
    }
  }

  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <>
      <div className={cn('grid gap-4', className)}>
        {photos.map((photo, index) => (
          <motion.div
            key={`${photo.url}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative cursor-pointer overflow-hidden rounded-lg"
            onClick={() => handlePhotoClick(index)}
          >
            <img
              src={photo.url}
              alt={`${carName} - ${photo.category || 'photo'} ${index + 1}`}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            
            {/* Zoom icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Viewer */}
      {showFullscreen && (
        <FullscreenPhotoViewer
          isOpen={isFullscreenOpen}
          onClose={() => setIsFullscreenOpen(false)}
          photos={photos}
          initialIndex={selectedPhotoIndex}
          carName={carName}
        />
      )}
    </>
  )
}
