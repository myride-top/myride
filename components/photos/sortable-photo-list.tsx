'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CarPhoto, PhotoCategory } from '@/lib/types/database'
import SortablePhotoItem from './sortable-photo-item'

interface SortablePhotoListProps {
  photos: CarPhoto[]
  mainPhotoUrl?: string
  onReorder: (photos: CarPhoto[]) => Promise<void>
  onDeletePhoto?: (photoUrl: string) => Promise<void>
  onSetMainPhoto?: (photoUrl: string) => Promise<void>
  onPhotoCategoryChange?: (
    photoIndex: number,
    category: PhotoCategory
  ) => Promise<void>
  onPhotoDescriptionChange?: (
    photoIndex: number,
    description: string
  ) => Promise<void>
}

export default function SortablePhotoList({
  photos,
  mainPhotoUrl,
  onReorder,
  onDeletePhoto,
  onSetMainPhoto,
  onPhotoCategoryChange,
  onPhotoDescriptionChange,
}: SortablePhotoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex(photo => photo.url === active.id)
      const newIndex = photos.findIndex(photo => photo.url === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedPhotos = arrayMove(photos, oldIndex, newIndex)

        // Update order property for each photo
        const updatedPhotos = reorderedPhotos.map((photo, idx) => ({
          ...photo,
          order: idx,
        }))

        onReorder(updatedPhotos)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={photos.map(photo => photo.url)}
        strategy={verticalListSortingStrategy}
      >
        <div className='space-y-4'>
          {photos.map((photo, index) => (
            <SortablePhotoItem
              key={photo.url}
              photo={photo}
              index={index}
              mainPhotoUrl={mainPhotoUrl}
              onDelete={onDeletePhoto || (() => Promise.resolve())}
              onSetMainPhoto={onSetMainPhoto || (() => Promise.resolve())}
              onCategoryChange={
                onPhotoCategoryChange || (() => Promise.resolve())
              }
              onDescriptionChange={
                onPhotoDescriptionChange || (() => Promise.resolve())
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
