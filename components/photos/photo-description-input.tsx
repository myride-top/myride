'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface PhotoDescriptionInputProps {
  photoUrl: string
  initialDescription: string
  onUpdate: (photoUrl: string, description: string) => Promise<void>
  isUpdating?: boolean
}

export const PhotoDescriptionInput = ({
  photoUrl,
  initialDescription,
  onUpdate,
  isUpdating = false,
}: PhotoDescriptionInputProps) => {
  const [description, setDescription] = useState(initialDescription)
  const [isLocalUpdating, setIsLocalUpdating] = useState(false)

  const handleUpdate = useCallback(async () => {
    if (description === initialDescription) return

    setIsLocalUpdating(true)
    try {
      await onUpdate(photoUrl, description)
    } catch (error) {
      console.error('Error updating description:', error)
    } finally {
      setIsLocalUpdating(false)
    }
  }, [photoUrl, description, initialDescription, onUpdate])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleUpdate()
      }
    },
    [handleUpdate]
  )

  const handleBlur = useCallback(() => {
    handleUpdate()
  }, [handleUpdate])

  const isUpdatingState = isUpdating || isLocalUpdating

  return (
    <div className='relative'>
      <Input
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        placeholder='Add a description...'
        className='pr-8'
        disabled={isUpdatingState}
      />
      {isUpdatingState && (
        <div className='absolute right-2 top-1/2 -translate-y-1/2'>
          <Loader2 className='h-4 w-4 animate-spin' />
        </div>
      )}
    </div>
  )
}
