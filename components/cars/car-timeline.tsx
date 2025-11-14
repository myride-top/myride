'use client'

import { useState, useMemo, useRef } from 'react'
import type { CarTimeline as CarTimelineType } from '@/lib/types/database'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FullscreenPhotoViewer } from '@/components/photos/fullscreen-photo-viewer'

interface CarTimelineProps {
  timeline: CarTimelineType[]
  carName: string
}

interface TimelinePeriod {
  year: number
  month: number
  monthName: string
  entries: CarTimelineType[]
}

interface TimelineYear {
  year: number
  months: TimelinePeriod[]
}

export const CarTimeline = ({ timeline, carName }: CarTimelineProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string
    category: string
  } | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)
  const entryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Group timeline by year and month
  const timelinePeriods = useMemo(() => {
    if (!timeline || timeline.length === 0) return []

    const periodsMap = new Map<string, TimelinePeriod>()

    timeline.forEach(entry => {
      const date = new Date(entry.date)
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthName = date.toLocaleDateString('en-US', { month: 'long' })
      const key = `${year}-${month}`

      if (!periodsMap.has(key)) {
        periodsMap.set(key, {
          year,
          month,
          monthName,
          entries: [],
        })
      }

      periodsMap.get(key)!.entries.push(entry)
    })

    // Sort entries within each period and sort periods
    const periods = Array.from(periodsMap.values())
    periods.forEach(period => {
      period.entries.sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        if (dateA !== dateB) {
          return dateA - dateB
        }
        return a.order_index - b.order_index
      })
    })

    // Sort periods by date (oldest first)
    periods.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    return periods
  }, [timeline])

  // Group periods by year
  const timelineYears = useMemo(() => {
    const yearsMap = new Map<number, TimelineYear>()

    timelinePeriods.forEach(period => {
      if (!yearsMap.has(period.year)) {
        yearsMap.set(period.year, {
          year: period.year,
          months: [],
        })
      }
      yearsMap.get(period.year)!.months.push(period)
    })

    // Sort months within each year
    yearsMap.forEach(year => {
      year.months.sort((a, b) => a.month - b.month)
    })

    // Sort years (oldest first)
    return Array.from(yearsMap.values()).sort((a, b) => a.year - b.year)
  }, [timelinePeriods])

  // Sort timeline by date (oldest first) and then by order_index
  const sortedTimeline = useMemo(() => {
    if (!timeline || timeline.length === 0) return []

    return [...timeline].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA !== dateB) {
        return dateA - dateB // Oldest first
      }
      return a.order_index - b.order_index
    })
  }, [timeline])

  const displayTimeline = isExpanded
    ? sortedTimeline
    : sortedTimeline.slice(0, 2)
  const hasMore = sortedTimeline.length > 2
  const previewEntry = !isExpanded && hasMore ? sortedTimeline[2] : null

  // Scroll to period
  const scrollToPeriod = (year: number, month: number) => {
    const key = `${year}-${month}`
    const firstEntry = timelinePeriods.find(
      p => p.year === year && p.month === month
    )?.entries[0]

    if (!firstEntry) return

    // If timeline is not expanded, expand it first
    if (!isExpanded) {
      setIsExpanded(true)
      // Wait for DOM to update using requestAnimationFrame for more reliable timing
      const scrollToElement = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const element = entryRefs.current[firstEntry.id]
            if (element) {
              const elementPosition = element.getBoundingClientRect().top
              const offsetPosition = elementPosition + window.pageYOffset - 100 // 100px offset for navbar

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
              })
              setSelectedPeriod(key)
              setTimeout(() => setSelectedPeriod(null), 2000)
            } else {
              // If element still not found, try again after a short delay
              setTimeout(scrollToElement, 100)
            }
          })
        })
      }
      scrollToElement()
    } else {
      // Timeline already expanded, scroll immediately
      const element = entryRefs.current[firstEntry.id]
      if (element) {
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - 100 // 100px offset for navbar

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
        setSelectedPeriod(key)
        setTimeout(() => setSelectedPeriod(null), 2000)
      }
    }
  }

  if (!timeline || timeline.length === 0) {
    return null
  }

  // Handle image click - show only the clicked photo
  const handleImageClick = (photoUrl: string, title: string) => {
    setSelectedPhoto({ url: photoUrl, category: title })
  }

  return (
    <div className='mt-12'>
      <h2 className='text-2xl font-semibold mb-6 text-foreground'>
        Build Timeline
      </h2>
      <div className='flex gap-4'>
        {/* Left sidebar navigation */}
        <div className='hidden lg:block w-20 flex-shrink-0'>
          <div className='sticky top-24'>
            <h3 className='text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mb-3'>
              Guide
            </h3>
            <div className='space-y-1 max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
              {timelineYears.map(yearData => {
                const isHovered = hoveredYear === yearData.year
                return (
                  <div
                    key={yearData.year}
                    onMouseEnter={() => setHoveredYear(yearData.year)}
                    onMouseLeave={() => setHoveredYear(null)}
                    className='border border-border/20 rounded px-1.5 py-1 transition-colors duration-200 hover:border-border/40'
                  >
                    {/* Year button */}
                    <button
                      onClick={() => {
                        // Scroll to first entry of the year
                        const firstPeriod = yearData.months[0]
                        if (firstPeriod) {
                          scrollToPeriod(firstPeriod.year, firstPeriod.month)
                        }
                      }}
                      className={cn(
                        'w-full text-left text-xs transition-colors duration-150 cursor-pointer',
                        'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {yearData.year}
                    </button>

                    {/* Months expand under year on hover */}
                    {isHovered && (
                      <div className='pl-1 space-y-0 mt-1'>
                        {yearData.months.map((period, index) => {
                          const key = `${period.year}-${period.month}`
                          const isSelected = selectedPeriod === key
                          return (
                            <button
                              key={key}
                              onClick={() =>
                                scrollToPeriod(period.year, period.month)
                              }
                              className={cn(
                                'w-full text-left py-0.5 text-[10px] transition-colors duration-150 cursor-pointer',
                                'text-muted-foreground/70 hover:text-foreground',
                                'animate-in fade-in slide-in-from-top-1',
                                isSelected && 'text-foreground font-medium'
                              )}
                              style={{
                                animationDelay: `${index * 20}ms`,
                                animationDuration: '300ms',
                                animationFillMode: 'both',
                              }}
                            >
                              {period.monthName.slice(0, 3)}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main timeline content */}
        <div className='flex-1 relative'>
          {/* Timeline line - super minimal */}
          <div
            className={cn(
              'absolute left-2 w-px transition-all duration-500',
              'bg-border/30',
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
            {displayTimeline.map((entry, index) => (
              <div
                key={entry.id}
                ref={el => {
                  entryRefs.current[entry.id] = el
                }}
                className='relative flex gap-6 group'
              >
                {/* Timeline dot - super minimal */}
                <div className='relative z-10 flex-shrink-0 w-4 flex items-start justify-center'>
                  <div className='w-2 h-2 rounded-full bg-foreground/60 mt-1' />
                </div>

                {/* Timeline content */}
                <div className='flex-1 pb-8'>
                  <div className='border-b border-border/30 pb-6 transition-colors duration-200 hover:border-border/50'>
                    {/* Date */}
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground mb-3'>
                      <time dateTime={entry.date}>
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    </div>

                    {/* Title */}
                    <h3 className='text-lg font-medium mb-3 text-foreground leading-tight'>
                      {entry.title}
                    </h3>

                    {/* Description */}
                    {entry.description && (
                      <p className='text-sm text-muted-foreground mb-4 whitespace-pre-wrap leading-relaxed'>
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
                                  loading={index < 5 ? 'eager' : 'lazy'}
                                  fetchPriority={
                                    index < 2
                                      ? 'high'
                                      : index < 5
                                      ? 'auto'
                                      : 'low'
                                  }
                                  style={{
                                    // Dynamically adjust based on aspect ratio
                                    width: 'auto',
                                    height: 'auto',
                                  }}
                                />
                                {/* Overlay hint on hover */}
                                <div className='absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none'>
                                  <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-medium bg-black/60 px-2 py-1 rounded backdrop-blur-sm'>
                                    View
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
                                handleImageClick(
                                  entry.photo_url_2!,
                                  entry.title
                                )
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
                                  loading={index < 5 ? 'eager' : 'lazy'}
                                  fetchPriority={
                                    index < 2
                                      ? 'high'
                                      : index < 5
                                      ? 'auto'
                                      : 'low'
                                  }
                                  style={{
                                    // Dynamically adjust based on aspect ratio
                                    width: 'auto',
                                    height: 'auto',
                                  }}
                                />
                                {/* Overlay hint on hover */}
                                <div className='absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none'>
                                  <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-medium bg-black/60 px-2 py-1 rounded backdrop-blur-sm'>
                                    View
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

            {/* Preview entry (3rd entry when collapsed) */}
            {previewEntry && (
              <div className='relative flex gap-6 group'>
                {/* Timeline dot - super minimal */}
                <div className='relative z-10 flex-shrink-0 w-4 flex items-start justify-center'>
                  <div className='w-2 h-2 rounded-full bg-foreground/60 mt-1' />
                </div>

                {/* Preview content - only title */}
                <div className='flex-1 relative overflow-hidden'>
                  <div className='border-b border-border/30 pb-6'>
                    {/* Date */}
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground mb-3'>
                      <time dateTime={previewEntry.date}>
                        {new Date(previewEntry.date).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </time>
                    </div>

                    {/* Title */}
                    <h3 className='text-lg font-medium text-foreground leading-tight'>
                      {previewEntry.title}
                    </h3>
                  </div>
                  {/* Fade-out gradient overlay */}
                  <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none' />
                </div>
              </div>
            )}
          </div>

          {/* Expand/Collapse button */}
          {hasMore && (
            <div className='mt-6 flex justify-center'>
              <Button
                variant='ghost'
                onClick={() => setIsExpanded(!isExpanded)}
                className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className='w-3.5 h-3.5' />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className='w-3.5 h-3.5' />
                    Read more
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Viewer - Single photo only, no navigation */}
      {selectedPhoto && (
        <FullscreenPhotoViewer
          isOpen={selectedPhoto !== null}
          onClose={() => {
            setSelectedPhoto(null)
          }}
          photos={selectedPhoto ? [selectedPhoto] : []}
          initialIndex={0}
          carName={carName}
        />
      )}
    </div>
  )
}
