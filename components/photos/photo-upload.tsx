'use client'

import { useState, useCallback } from 'react'
import { uploadCarPhoto } from '@/lib/storage/photos'
import { CarPhoto, PHOTO_CATEGORIES, PhotoCategory } from '@/lib/types/database'
import { toast } from 'sonner'

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
    let successCount = 0

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
        successCount++

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
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className='space-y-2'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            stroke='currentColor'
            fill='none'
            viewBox='0 0 48 48'
          >
            <path
              d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <div className='text-sm text-gray-600'>
            <label
              htmlFor='file-input'
              className='relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500'
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
          <p className='text-xs text-gray-500'>PNG, JPG, GIF up to 5MB each</p>
          <p className='text-xs text-indigo-600 font-medium'>
            You can categorize photos after uploading
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-gray-700'>Upload Progress</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className='space-y-1'>
              <div className='flex justify-between text-xs text-gray-600'>
                <span>{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-indigo-600 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className='text-center text-sm text-gray-600'>
          <div className='inline-flex items-center'>
            <svg
              className='animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            Uploading photos...
          </div>
        </div>
      )}
    </div>
  )
}
