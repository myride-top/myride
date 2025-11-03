'use client'

import { CarPhoto, PhotoCategory } from '@/lib/types/database'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { PhotoItem } from './photo-item'

interface SortablePhotoGalleryProps {
  photos: CarPhoto[]
  mainPhotoUrl?: string
  onSetMain: (photoUrl: string) => void
  onDelete: (photoUrl: string) => void
  onUpdateDescription: (photoUrl: string, description: string) => Promise<void>
  onUpdateCategory: (photoUrl: string, category: PhotoCategory) => Promise<void>
  onReorder: (reorderedPhotos: CarPhoto[]) => Promise<void>
  isUpdating?: boolean
}

export const SortablePhotoGallery = ({
  photos,
  mainPhotoUrl,
  onSetMain,
  onDelete,
  onUpdateDescription,
  onUpdateCategory,
  onReorder,
  isUpdating = false,
}: SortablePhotoGalleryProps) => {
  // Deduplicate photos by URL to prevent React key errors
  const uniquePhotos = photos.filter(
    (photo, index, self) => index === self.findIndex(p => p.url === photo.url)
  )

  if (!uniquePhotos || uniquePhotos.length === 0) {
    return (
      <div className='text-center py-12 text-gray-500'>
        <p>No photos uploaded yet</p>
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    console.log('Drag end event:', { active: active?.id, over: over?.id })

    if (active.id !== over?.id) {
      const oldIndex = uniquePhotos.findIndex(photo => photo.url === active.id)
      const newIndex = uniquePhotos.findIndex(photo => photo.url === over?.id)

      console.log('Drag indices:', { oldIndex, newIndex })

      if (oldIndex === newIndex) return

      const newOrder = arrayMove(uniquePhotos, oldIndex, newIndex)

      const reorderedPhotos = newOrder.map((photo, index) => ({
        ...photo,
        order: index,
      }))

      console.log('Reordered photos:', reorderedPhotos)

      onReorder(reorderedPhotos)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={uniquePhotos.map(photo => photo.url)}
        strategy={verticalListSortingStrategy}
      >
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {uniquePhotos.map(photo => (
            <PhotoItem
              key={photo.url}
              photo={photo}
              isMain={photo.url === mainPhotoUrl}
              onSetMain={onSetMain}
              onDelete={onDelete}
              onUpdateDescription={onUpdateDescription}
              onUpdateCategory={onUpdateCategory}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
