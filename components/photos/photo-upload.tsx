'use client'

import { useState, useCallback } from 'react'
import { uploadCarPhoto } from '@/lib/storage/photos'
import { CarPhoto } from '@/lib/types/database'
import { toast } from 'sonner'
import { Upload, Loader2 } from 'lucide-react'

interface PhotoUploadProps {
  carId: string
  onUploadComplete: (photo: CarPhoto) => void
  onBatchUploadComplete: (photos: CarPhoto[]) => void
}

export default function PhotoUpload({
  carId,
  onUploadComplete,
  onBatchUploadComplete,
}: PhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number
  }>({})

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFiles(files)
    }
  }, [])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        await handleFiles(files)
      }
    },
    []
  )

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    setUploading(true)
    const uploadedPhotos: CarPhoto[] = []

    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        // Upload the photo
        const photoUrl = await uploadCarPhoto(file, carId)

        if (!photoUrl) {
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        // Create CarPhoto object with default 'other' category
        const photo: CarPhoto = {
          url: photoUrl,
          category: 'other',
          description: '',
          order: uploadedPhotos.length,
        }

        uploadedPhotos.push(photo)

        // Update progress to 100%
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))

        // Call individual callback
        onUploadComplete(photo)

        toast.success(`${file.name} uploaded successfully!`)
      } catch (error) {
        console.error('Error uploading photo:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    // Call batch callback if multiple photos were uploaded
    if (uploadedPhotos.length > 1) {
      onBatchUploadComplete(uploadedPhotos)
    }

    setUploading(false)
    setUploadProgress({})

    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className='space-y-4'>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className='space-y-2'>
          <Upload className='mx-auto h-12 w-12 text-muted-foreground' />
          <div className='text-sm text-muted-foreground'>
            <label
              htmlFor='file-input'
              className='relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring'
            >
              <span>Upload photos</span>
              <input
                id='file-input'
                name='file-input'
                type='file'
                className='sr-only'
                multiple
                accept='image/*'
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
            <p className='pl-1'>or drag and drop</p>
          </div>
          <p className='text-xs text-muted-foreground'>
            PNG, JPG, GIF up to 5MB each
          </p>
          <p className='text-xs text-primary font-medium'>
            You can categorize photos after uploading
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-foreground'>
            Upload Progress
          </h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className='space-y-1'>
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-primary h-2 rounded-full transition-all duration-300'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className='text-center text-sm text-muted-foreground'>
          <div className='inline-flex items-center'>
            <Loader2 className='animate-spin -ml-1 mr-3 h-5 w-5 text-primary' />
            Uploading photos...
          </div>
        </div>
      )}
    </div>
  )
}
