'use client'

import { CarPhoto, PhotoCategory } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, Star, MoreVertical } from 'lucide-react'
import PhotoDescriptionInputSimple from './photo-description-input-simple'

interface PhotoItemSimpleProps {
  photo: CarPhoto
  isMain: boolean
  onSetMain: (photoUrl: string) => void
  onDelete: (photoUrl: string) => void
  onUpdateDescription: (photoUrl: string, description: string) => Promise<void>
  onUpdateCategory: (photoUrl: string, category: PhotoCategory) => Promise<void>
  isUpdating?: boolean
}

const categoryLabels: Record<PhotoCategory, string> = {
  exterior: 'Exterior',
  interior: 'Interior',
  engine: 'Engine',
  wheels: 'Wheels',
  brakes: 'Brakes',
  suspension: 'Suspension',
  underbody: 'Underbody',
  dyno: 'Dyno',
  other: 'Other',
}

export default function PhotoItemSimple({
  photo,
  isMain,
  onSetMain,
  onDelete,
  onUpdateDescription,
  onUpdateCategory,
  isUpdating = false,
}: PhotoItemSimpleProps) {
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
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 z-10' : ''
      }`}
    >
      {/* Photo */}
      <div className='aspect-square relative'>
        <img
          src={photo.url}
          alt={photo.description || 'Car photo'}
          className='w-full h-full object-cover'
        />

        {/* Main photo badge */}
        {isMain && (
          <div className='absolute top-2 left-2'>
            <Badge variant='default' className='bg-blue-600'>
              <Star className='w-3 h-3 mr-1' />
              Main
            </Badge>
          </div>
        )}

        {/* Actions overlay */}
        <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100'>
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='secondary'
              onClick={() => onSetMain(photo.url)}
              disabled={isMain || isUpdating}
            >
              <Star className='w-4 h-4' />
            </Button>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => onDelete(photo.url)}
              disabled={isUpdating}
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        </div>

        {/* Drag Handle */}
        <div
          {...listeners}
          className='absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity'
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

      {/* Photo info */}
      <div className='p-3 space-y-2'>
        {/* Category selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='w-full justify-between'
            >
              {categoryLabels[photo.category || 'other']}
              <MoreVertical className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                onClick={() =>
                  onUpdateCategory(photo.url, value as PhotoCategory)
                }
                disabled={isUpdating}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Description input */}
        <PhotoDescriptionInputSimple
          photoUrl={photo.url}
          initialDescription={photo.description || ''}
          onUpdate={onUpdateDescription}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  )
}
