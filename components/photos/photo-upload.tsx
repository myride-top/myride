'use client'

import { useState, useCallback, useEffect } from 'react'
import { uploadCarPhoto } from '@/lib/storage/photos'
import { CarPhoto } from '@/lib/types/database'
import { toast } from 'sonner'
import { Upload, Loader2, Zap, CheckCircle } from 'lucide-react'
import {
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
  const [photoDescriptions, setPhotoDescriptions] = useState<{
    [key: string]: string
  }>({})

  // Auto-add photos when they're uploaded
  useEffect(() => {
    if (Object.keys(photoDescriptions).length > 0) {
      // Wait a short moment for user to add descriptions, then auto-add photos
      const timer = setTimeout(() => {
        const photosWithDescriptions = Object.entries(photoDescriptions).map(
          ([url, description], index) => ({
            url,
            category: 'other' as const,
            description: description || '',
            order: index,
          })
        )

        // Add photos to car
        if (photosWithDescriptions.length === 1) {
          onUploadComplete(photosWithDescriptions[0])
        } else if (photosWithDescriptions.length > 1) {
          onBatchUploadComplete(photosWithDescriptions)
        }

        // Clear descriptions
        setPhotoDescriptions({})
      }, 2000) // 2 second delay to allow user to add descriptions

      return () => clearTimeout(timer)
    }
  }, [photoDescriptions, onUploadComplete, onBatchUploadComplete])

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
          if (needsOptimization(file, 1500)) {
            setOptimizationProgress(prev => ({
              ...prev,
              [file.name]: {
                status: 'optimizing',
                details: 'Compressing image...',
              },
            }))

            try {
              // Optimize image to target size
              const optimized = await compressToTargetSize(file, 1500)

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
            } catch {
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

          // Add to descriptions state for user input
          setPhotoDescriptions(prev => ({
            ...prev,
            [photoUrl]: '',
          }))

          uploadedPhotos.push(photo)

          // Update progress to 100%
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))

          toast.success(`${file.name} uploaded successfully!`)
        } catch {
          toast.error(`Failed to upload ${file.name}`)
        }
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
    [carId]
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

  const handlePhotoDescriptionChange = (
    photoUrl: string,
    description: string
  ) => {
    setPhotoDescriptions(prev => ({
      ...prev,
      [photoUrl]: description,
    }))
  }

  return (
    <div className='space-y-4'>
      {/* Photo Upload with Descriptions */}
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
              PNG, JPG, GIF, WebP up to 10MB each (auto-optimized to 1.5MB)
            </p>
            <p className='text-xs text-primary font-medium'>
              You can add descriptions and categorize photos after uploading
            </p>
          </div>
        </div>

        {/* Photo Descriptions Input - Auto-add photos immediately */}
        {Object.keys(photoDescriptions).length > 0 && (
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-card-foreground'>
              Photo Descriptions (Optional)
            </h4>
            {Object.entries(photoDescriptions).map(
              ([photoUrl, description]) => (
                <div key={photoUrl} className='flex items-center gap-3'>
                  <img
                    src={photoUrl}
                    alt='Photo preview'
                    className='w-16 h-16 object-cover rounded-md'
                  />
                  <div className='flex-1'>
                    <input
                      type='text'
                      placeholder='Describe this photo (optional)'
                      value={description}
                      onChange={e =>
                        handlePhotoDescriptionChange(photoUrl, e.target.value)
                      }
                      className='w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground'
                    />
                  </div>
                </div>
              )
            )}

            {/* Auto-add photos after a short delay */}
            <div className='text-center pt-2'>
              <div className='text-sm text-muted-foreground'>
                Photos will be added to your car automatically...
              </div>
            </div>
          </div>
        )}

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
          <p>• Images are automatically optimized to under 1.5MB</p>
          <p>• Maximum original file size: 10MB</p>
          <p>• Supported formats: PNG, JPG, GIF, WebP</p>
        </div>
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
