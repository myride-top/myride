'use client'

import { useState } from 'react'
import type { CarTimeline as CarTimelineType } from '@/lib/types/database'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FullscreenPhotoViewer } from '@/components/photos/fullscreen-photo-viewer'

interface CarTimelineProps {
  timeline: CarTimelineType[]
  carName: string
}

export const CarTimeline = ({ timeline, carName }: CarTimelineProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string
    category: string
  } | null>(null)

  if (!timeline || timeline.length === 0) {
    return null
  }

  // Sort timeline by date (oldest first) and then by order_index
  const sortedTimeline = [...timeline].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    if (dateA !== dateB) {
      return dateA - dateB // Oldest first
    }
    return a.order_index - b.order_index
  })

  const displayTimeline = isExpanded
    ? sortedTimeline
    : sortedTimeline.slice(0, 2)
  const hasMore = sortedTimeline.length > 2

  // Handle image click - show only the clicked photo
  const handleImageClick = (photoUrl: string, title: string) => {
    setSelectedPhoto({ url: photoUrl, category: title })
  }

  return (
    <div className='mt-8'>
      <h2 className='text-2xl font-bold mb-6'>Build Timeline</h2>
      <div className='relative'>
        {/* Timeline line */}
        <div
          className={cn(
            'absolute left-4 w-0.5 bg-border',
            isExpanded || !hasMore ? 'top-0 bottom-0' : 'top-0'
          )}
          style={{
            height:
              isExpanded || !hasMore
                ? '100%'
                : `${
                    (displayTimeline.length - 1) * 8 +
                    displayTimeline.length * 1.5
                  }rem`,
          }}
        />

        <div className='space-y-8'>
          {displayTimeline.map(entry => (
            <div key={entry.id} className='relative flex gap-6'>
              {/* Timeline dot */}
              <div className='relative z-10 flex-shrink-0'>
                <div className='w-8 h-8 rounded-full bg-primary border-4 border-background flex items-center justify-center'>
                  <div className='w-2 h-2 rounded-full bg-primary-foreground' />
                </div>
              </div>

              {/* Timeline content */}
              <div className='flex-1 pb-8'>
                <div className='bg-card border border-border rounded-lg p-6 shadow-sm'>
                  {/* Date */}
                  <div className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
                    <Calendar className='w-4 h-4' />
                    <time dateTime={entry.date}>
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>

                  {/* Title */}
                  <h3 className='text-xl font-semibold mb-3'>{entry.title}</h3>

                  {/* Description */}
                  {entry.description && (
                    <p className='text-muted-foreground mb-4 whitespace-pre-wrap'>
                      {entry.description}
                    </p>
                  )}

                  {/* Photos - Up to 2 photos */}
                  {(entry.photo_url || entry.photo_url_2) && (
                    <div
                      className={cn(
                        'mt-4',
                        entry.photo_url && entry.photo_url_2
                          ? 'grid grid-cols-2 gap-4'
                          : 'space-y-4'
                      )}
                    >
                      {entry.photo_url && (
                        <div>
                          <button
                            onClick={() =>
                              handleImageClick(entry.photo_url!, entry.title)
                            }
                            className='block w-full group cursor-pointer'
                          >
                            <div className='relative overflow-hidden rounded-lg flex items-center justify-center'>
                              <img
                                src={entry.photo_url}
                                alt={`${entry.title} - ${carName}`}
                                className={cn(
                                  'rounded-lg transition-transform duration-200 group-hover:scale-[1.02]',
                                  // Better handling for both horizontal and vertical images
                                  'max-w-full max-h-[500px] object-contain'
                                )}
                                loading='lazy'
                                style={{
                                  // Dynamically adjust based on aspect ratio
                                  width: 'auto',
                                  height: 'auto',
                                }}
                              />
                              {/* Overlay hint on hover */}
                              <div className='absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none'>
                                <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm font-medium bg-black/70 px-3 py-1.5 rounded-md backdrop-blur-sm'>
                                  Click to view fullscreen
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                      )}
                      {entry.photo_url_2 && (
                        <div>
                          <button
                            onClick={() =>
                              handleImageClick(entry.photo_url_2!, entry.title)
                            }
                            className='block w-full group cursor-pointer'
                          >
                            <div className='relative overflow-hidden rounded-lg flex items-center justify-center'>
                              <img
                                src={entry.photo_url_2}
                                alt={`${entry.title} - ${carName} - Photo 2`}
                                className={cn(
                                  'rounded-lg transition-transform duration-200 group-hover:scale-[1.02]',
                                  // Better handling for both horizontal and vertical images
                                  'max-w-full max-h-[500px] object-contain'
                                )}
                                loading='lazy'
                                style={{
                                  // Dynamically adjust based on aspect ratio
                                  width: 'auto',
                                  height: 'auto',
                                }}
                              />
                              {/* Overlay hint on hover */}
                              <div className='absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none'>
                                <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm font-medium bg-black/70 px-3 py-1.5 rounded-md backdrop-blur-sm'>
                                  Click to view fullscreen
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expand/Collapse button */}
        {hasMore && (
          <div className='mt-6 flex justify-center'>
            <Button
              variant='outline'
              onClick={() => setIsExpanded(!isExpanded)}
              className='flex items-center gap-2'
            >
              {isExpanded ? (
                <>
                  <ChevronUp className='w-4 h-4' />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className='w-4 h-4' />
                  Show All ({sortedTimeline.length} entries)
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Viewer - Single photo only, no navigation */}
      {selectedPhoto && (
        <FullscreenPhotoViewer
          isOpen={selectedPhoto !== null}
          onClose={() => {
            setSelectedPhoto(null)
          }}
          photos={[selectedPhoto]}
          initialIndex={0}
          carName={carName}
        />
      )}
    </div>
  )
}
