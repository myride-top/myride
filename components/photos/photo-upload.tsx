'use client'

import { useState, useCallback } from 'react'
import { uploadCarPhoto } from '@/lib/storage/photos'
import { CarPhoto } from '@/lib/types/database'
import { toast } from 'sonner'
import { Upload, Loader2, Zap, CheckCircle } from 'lucide-react'
import {
  optimizeImage,
  compressToTargetSize,
  needsOptimization,
  formatFileSize,
} from '@/lib/utils/image-optimization'

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
  const [optimizationProgress, setOptimizationProgress] = useState<{
    [key: string]: {
      status: 'pending' | 'optimizing' | 'optimized' | 'failed'
      details?: string
    }
  }>({})

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFiles = useCallback(
    async (files: File[]) => {
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

          // Validate file size (10MB limit for original files)
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`${file.name} is too large. Maximum size is 10MB`)
            continue
          }

          // Initialize optimization progress
          setOptimizationProgress(prev => ({
            ...prev,
            [file.name]: { status: 'pending' },
          }))

          let optimizedFile: File

          // Check if image needs optimization
          if (needsOptimization(file, 500)) {
            setOptimizationProgress(prev => ({
              ...prev,
              [file.name]: {
                status: 'optimizing',
                details: 'Compressing image...',
              },
            }))

            try {
              // Optimize image to target size
              const optimized = await compressToTargetSize(file, 500)

              // Convert blob to file
              optimizedFile = new File([optimized.blob], file.name, {
                type: `image/${file.name.endsWith('.webp') ? 'webp' : 'jpeg'}`,
                lastModified: Date.now(),
              })

              setOptimizationProgress(prev => ({
                ...prev,
                [file.name]: {
                  status: 'optimized',
                  details: `${formatFileSize(file.size)} → ${formatFileSize(
                    optimizedFile.size
                  )} (${optimized.compressionRatio.toFixed(1)}% smaller)`,
                },
              }))

              toast.success(
                `${file.name} optimized: ${formatFileSize(
                  file.size
                )} → ${formatFileSize(optimizedFile.size)}`
              )
            } catch (error) {
              console.error('Image optimization failed:', error)
              setOptimizationProgress(prev => ({
                ...prev,
                [file.name]: {
                  status: 'failed',
                  details: 'Optimization failed, using original',
                },
              }))
              optimizedFile = file
              toast.warning(
                `${file.name} optimization failed, using original file`
              )
            }
          } else {
            // Image is already under 500KB
            optimizedFile = file
            setOptimizationProgress(prev => ({
              ...prev,
              [file.name]: {
                status: 'optimized',
                details: 'Already optimized',
              },
            }))
          }

          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

          // Upload the optimized photo
          const photoUrl = await uploadCarPhoto(optimizedFile, carId)

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
      setOptimizationProgress({})

      // Reset file input
      const fileInput = document.getElementById(
        'file-input'
      ) as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    },
    [carId, onUploadComplete, onBatchUploadComplete]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        await handleFiles(files)
      }
    },
    [handleFiles]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        await handleFiles(files)
      }
    },
    [handleFiles]
  )

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
            PNG, JPG, GIF, WebP up to 10MB each (auto-optimized to 500KB)
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
          {Object.entries(uploadProgress).map(([fileName, progress]) => {
            const optimization = optimizationProgress[fileName]
            return (
              <div key={fileName} className='space-y-1'>
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>{fileName}</span>
                  <span>{progress}%</span>
                </div>

                {/* Optimization Status */}
                {optimization && (
                  <div className='flex items-center gap-2 text-xs'>
                    {optimization.status === 'pending' && (
                      <div className='flex items-center gap-1 text-muted-foreground'>
                        <div className='w-3 h-3 rounded-full border-2 border-muted-foreground'></div>
                        <span>Pending optimization...</span>
                      </div>
                    )}

                    {optimization.status === 'optimizing' && (
                      <div className='flex items-center gap-1 text-blue-600'>
                        <Zap className='w-3 h-3 animate-pulse' />
                        <span>{optimization.details}</span>
                      </div>
                    )}

                    {optimization.status === 'optimized' && (
                      <div className='flex items-center gap-1 text-green-600'>
                        <CheckCircle className='w-3 h-3' />
                        <span>{optimization.details}</span>
                      </div>
                    )}

                    {optimization.status === 'failed' && (
                      <div className='flex items-center gap-1 text-orange-600'>
                        <div className='w-3 h-3 rounded-full bg-orange-600'></div>
                        <span>{optimization.details}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className='w-full bg-muted rounded-full h-2'>
                  <div
                    className='bg-primary h-2 rounded-full transition-all duration-300'
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* File Size Info */}
      <div className='text-xs text-muted-foreground space-y-1'>
        <p>• Images are automatically optimized to under 500KB</p>
        <p>• Maximum original file size: 10MB</p>
        <p>• Supported formats: PNG, JPG, GIF, WebP</p>
      </div>

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
