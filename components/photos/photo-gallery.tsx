import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CarPhoto, PhotoCategory } from '@/lib/types/database'

interface PhotoGalleryProps {
  photos: (string | CarPhoto)[]
  selectedPhoto: number
  onPhotoSelect: (index: number) => void
  onFullscreenOpen: (index: number) => void
  className?: string
  variant?: 'default' | 'compact'
}

export default function PhotoGallery({
  photos,
  selectedPhoto,
  onPhotoSelect,
  onFullscreenOpen,
  className = '',
  variant = 'default',
}: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center h-64 bg-muted/20 rounded-lg border-2 border-dashed border-muted',
        className
      )}>
        <p className="text-muted-foreground">No photos available</p>
      </div>
    )
  }

  const currentPhoto = photos[selectedPhoto]
  const photoInfo = getPhotoInfo(currentPhoto)
  const hasMultiplePhotos = photos.length > 1

  const imageHeight = variant === 'compact' ? 'h-48' : 'h-64 sm:h-80 md:h-96'

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Photo */}
      <div className='relative'>
        <div className='relative'>
          <img
            src={photoInfo.url}
            alt={`Photo ${selectedPhoto + 1} - ${photoInfo.category}`}
            className={cn(
              'w-full object-cover rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity',
              imageHeight
            )}
            onClick={() => onFullscreenOpen(selectedPhoto)}
          />

          {/* Navigation Arrows */}
          {hasMultiplePhotos && (
            <>
              <button
                onClick={() => onPhotoSelect(selectedPhoto > 0 ? selectedPhoto - 1 : photos.length - 1)}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors'
                aria-label="Previous photo"
              >
                <ChevronLeft className='w-5 h-5' />
              </button>

              <button
                onClick={() => onPhotoSelect(selectedPhoto < photos.length - 1 ? selectedPhoto + 1 : 0)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors'
                aria-label="Next photo"
              >
                <ChevronRight className='w-5 h-5' />
              </button>

              {/* Photo Counter */}
              <div className='absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm'>
                {selectedPhoto + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {hasMultiplePhotos && (
        <div className='flex gap-2 overflow-x-auto pb-2'>
          {photos.map((photo, index) => {
            const thumbInfo = getPhotoInfo(photo)
            return (
              <button
                key={index}
                onClick={() => onPhotoSelect(index)}
                className={cn(
                  'flex-shrink-0 relative',
                  'w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden',
                  'border-2 transition-all duration-200',
                  selectedPhoto === index
                    ? 'border-primary shadow-lg'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <img
                  src={thumbInfo.url}
                  alt={`Thumbnail ${index + 1}`}
                  className='w-full h-full object-cover'
                />
                {selectedPhoto === index && (
                  <div className='absolute inset-0 bg-primary/20' />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Helper function to get photo info (compatible with both string and CarPhoto formats)
function getPhotoInfo(photo: string | CarPhoto) {
  if (typeof photo === 'string') {
    return { url: photo, category: 'other' as PhotoCategory, description: '' }
  }

  if (photo && typeof photo === 'object' && photo.url) {
    return {
      url: photo.url,
      category: photo.category || 'other',
      description: photo.description || '',
    }
  }

  return { url: '', category: 'other' as PhotoCategory, description: '' }
}
