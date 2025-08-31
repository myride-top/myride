'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Star, X } from 'lucide-react'
import { CarPhoto, PhotoCategory } from '@/lib/types/database'
import PhotoCategoryMenu from './photo-category-menu'

interface SortablePhotoItemProps {
  photo: CarPhoto
  index: number
  mainPhotoUrl?: string
  onDelete?: (photoUrl: string) => Promise<void>
  onSetMainPhoto?: (photoUrl: string) => Promise<void>
  onCategoryChange?: (
    photoIndex: number,
    category: PhotoCategory
  ) => Promise<void>
  onDescriptionChange?: (
    photoIndex: number,
    description: string
  ) => Promise<void>
}

export default function SortablePhotoItem({
  photo,
  index,
  mainPhotoUrl,
  onDelete,
  onSetMainPhoto,
  onCategoryChange,
  onDescriptionChange,
}: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.url })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Remove zIndex to prevent stacking context issues with modals
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-start space-x-4 p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors relative cursor-move ${
        isDragging ? 'opacity-50 scale-95 shadow-lg' : ''
      }`}
    >
      {/* Photo Thumbnail with Overlay Controls */}
      <div className='relative flex-shrink-0'>
        <img
          src={photo.url}
          alt={`Car photo ${index + 1}`}
          className='w-32 h-32 object-cover rounded-lg'
        />

        {/* Main Photo Badge - Upper Left */}
        {mainPhotoUrl === photo.url && (
          <div className='absolute -top-2 -left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium'>
            Main
          </div>
        )}

        {/* Delete Button - Upper Right */}
        <button
          onClick={async () => {
            await onDelete?.(photo.url)
          }}
          className='absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors cursor-pointer'
          title='Delete photo'
        >
          <X className='w-4 h-4' />
        </button>

        {/* Set as Main Photo Button - Bottom Right */}
        {mainPhotoUrl !== photo.url && (
          <button
            onClick={() => onSetMainPhoto?.(photo.url)}
            className='absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors cursor-pointer'
            title='Set as main photo'
          >
            <Star className='w-4 h-4' />
          </button>
        )}

        {/* Drag Handle - Bottom Left - Only this area triggers dragging */}
        <div
          {...listeners}
          className='absolute -bottom-3 -left-3 bg-zinc-500 text-white rounded-lg p-3 opacity-90 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shadow-lg'
          title='Drag to reorder'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 8h16M4 16h16'
            />
          </svg>
        </div>
      </div>

      {/* Photo Details */}
      <div className='flex-1 space-y-3'>
        {/* Description Input */}
        <div>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Description
          </label>
          <input
            type='text'
            value={photo.description || ''}
            onChange={e => {
              onDescriptionChange?.(index, e.target.value)
            }}
            placeholder='Describe this photo...'
            className='w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground text-sm'
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Category
          </label>
          <PhotoCategoryMenu
            currentCategory={photo.category as PhotoCategory}
            onCategoryChange={category => onCategoryChange?.(index, category)}
          />
        </div>
      </div>
    </div>
  )
}
