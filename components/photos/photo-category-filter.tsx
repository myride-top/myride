import React from 'react'
import { cn } from '@/lib/utils'
import { PHOTO_CATEGORIES, PhotoCategory } from '@/lib/types/database'

interface PhotoCategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  photos: any[]
  totalCount: number
  className?: string
  variant?: 'default' | 'compact'
}

export default function PhotoCategoryFilter({
  selectedCategory,
  onCategoryChange,
  photos,
  totalCount,
  className = '',
  variant = 'default',
}: PhotoCategoryFilterProps) {
  const getCategoryCount = (category: PhotoCategory) => {
    return photos.filter(photo => {
      if (typeof photo === 'string') {
        return category === 'other'
      }
      return photo.category === category
    }).length
  }

  const buttonClasses = variant === 'compact' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-2 text-sm'

  return (
    <div className={cn('mb-4 sm:mb-6', className)}>
      <div className='flex flex-wrap gap-2'>
        <button
          onClick={() => onCategoryChange('all')}
          className={cn(
            buttonClasses,
            'rounded-full font-medium transition-colors cursor-pointer',
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          All ({totalCount})
        </button>
        
        {PHOTO_CATEGORIES.map(category => {
          const count = getCategoryCount(category)
          if (count === 0) return null
          
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                buttonClasses,
                'rounded-full font-medium capitalize transition-colors cursor-pointer',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {category} ({count})
            </button>
          )
        })}
      </div>
    </div>
  )
}
