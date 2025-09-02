import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  compressToTargetSize,
  needsOptimization,
  formatFileSize,
} from '@/lib/utils/image-optimization'

export interface OptimizationProgress {
  status: 'pending' | 'optimizing' | 'optimized' | 'failed'
  details?: string
  error?: string
  originalSize: number
  optimizedSize?: number
  compressionRatio?: number
  wasOptimized?: boolean
}

export interface OptimizedImage {
  file: File
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  wasOptimized: boolean
}

export interface UseImageOptimizationOptions {
  targetSize?: number // in bytes
  maxOriginalSize?: number // in bytes
  showToasts?: boolean
  autoOptimize?: boolean
}

export function useImageOptimization({
  targetSize = 1.5 * 1024 * 1024, // 1.5MB
  maxOriginalSize = 10 * 1024 * 1024, // 10MB
  showToasts = true,
  autoOptimize = true,
}: UseImageOptimizationOptions = {}) {
  const [optimizing, setOptimizing] = useState(false)
  const [progress, setProgress] = useState<
    Record<string, OptimizationProgress>
  >({})

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!file.type.startsWith('image/')) {
        return 'File must be an image'
      }

      if (file.size > maxOriginalSize) {
        return `File size must be under ${formatFileSize(maxOriginalSize)}`
      }

      return null
    },
    [maxOriginalSize]
  )

  // Optimize single image
  const optimizeImage = useCallback(
    async (file: File): Promise<OptimizedImage> => {
      const fileName = file.name
      const originalSize = file.size

      // Initialize progress
      setProgress(prev => ({
        ...prev,
        [fileName]: {
          status: 'pending',
          originalSize,
        },
      }))

      try {
        // Check if optimization is needed
        if (!autoOptimize || !needsOptimization(file, targetSize)) {
          setProgress(prev => ({
            ...prev,
            [fileName]: {
              status: 'optimized',
              details: 'Already optimized',
              originalSize,
              optimizedSize: originalSize,
              compressionRatio: 0,
            },
          }))

          return {
            file,
            originalSize,
            optimizedSize: originalSize,
            compressionRatio: 0,
            wasOptimized: false,
          }
        }

        // Start optimization
        setProgress(prev => ({
          ...prev,
          [fileName]: {
            status: 'optimizing',
            details: 'Compressing image...',
            originalSize,
          },
        }))

        // Optimize image
        const optimized = await compressToTargetSize(file, targetSize)

        // Convert blob to file
        const optimizedFile = new File([optimized.blob], file.name, {
          type: `image/${file.name.endsWith('.webp') ? 'webp' : 'jpeg'}`,
          lastModified: Date.now(),
        })

        const compressionRatio =
          ((originalSize - optimizedFile.size) / originalSize) * 100

        setProgress(prev => ({
          ...prev,
          [fileName]: {
            status: 'optimized',
            details: `${formatFileSize(originalSize)} → ${formatFileSize(
              optimizedFile.size
            )} (${compressionRatio.toFixed(1)}% smaller)`,
            originalSize,
            optimizedSize: optimizedFile.size,
            compressionRatio,
          },
        }))

        if (showToasts) {
          toast.success(
            `${fileName} optimized: ${formatFileSize(
              originalSize
            )} → ${formatFileSize(optimizedFile.size)}`
          )
        }

        return {
          file: optimizedFile,
          originalSize,
          optimizedSize: optimizedFile.size,
          compressionRatio,
          wasOptimized: true,
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Optimization failed'

        setProgress(prev => ({
          ...prev,
          [fileName]: {
            status: 'failed',
            details: 'Optimization failed, using original',
            error: errorMessage,
            originalSize,
          },
        }))

        if (showToasts) {
          toast.warning(`${fileName} optimization failed, using original file`)
        }

        return {
          file,
          originalSize,
          optimizedSize: originalSize,
          compressionRatio: 0,
          wasOptimized: false,
        }
      }
    },
    [targetSize, autoOptimize, showToasts]
  )

  // Optimize multiple images
  const optimizeImages = useCallback(
    async (files: File[]): Promise<OptimizedImage[]> => {
      if (files.length === 0) return []

      setOptimizing(true)
      const results: OptimizedImage[] = []

      for (const file of files) {
        try {
          const result = await optimizeImage(file)
          results.push(result)
        } catch (error) {
          console.error(`Failed to optimize ${file.name}:`, error)
          // Add failed file to results
          results.push({
            file,
            originalSize: file.size,
            optimizedSize: file.size,
            compressionRatio: 0,
            wasOptimized: false,
          })
        }
      }

      setOptimizing(false)
      return results
    },
    [optimizeImage]
  )

  // Batch optimize with progress tracking
  const optimizeImagesWithProgress = useCallback(
    async (
      files: File[],
      onProgress?: (completed: number, total: number) => void
    ): Promise<OptimizedImage[]> => {
      if (files.length === 0) return []

      setOptimizing(true)
      const results: OptimizedImage[] = []
      let completed = 0

      for (const file of files) {
        try {
          const result = await optimizeImage(file)
          results.push(result)
          completed++

          if (onProgress) {
            onProgress(completed, files.length)
          }
        } catch (error) {
          console.error(`Failed to optimize ${file.name}:`, error)
          results.push({
            file,
            originalSize: file.size,
            optimizedSize: file.size,
            compressionRatio: 0,
            wasOptimized: false,
          })
          completed++

          if (onProgress) {
            onProgress(completed, files.length)
          }
        }
      }

      setOptimizing(false)
      return results
    },
    [optimizeImage]
  )

  // Clear progress for a specific file
  const clearProgress = useCallback((fileName: string) => {
    setProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }, [])

  // Clear all progress
  const clearAllProgress = useCallback(() => {
    setProgress({})
  }, [])

  // Get optimization stats
  const getOptimizationStats = useCallback(() => {
    const entries = Object.values(progress)
    const totalFiles = entries.length
    const optimizedFiles = entries.filter(
      p => p.status === 'optimized' && p.wasOptimized
    ).length
    const failedFiles = entries.filter(p => p.status === 'failed').length
    const totalOriginalSize = entries.reduce(
      (sum, p) => sum + p.originalSize,
      0
    )
    const totalOptimizedSize = entries.reduce(
      (sum, p) => sum + (p.optimizedSize || p.originalSize),
      0
    )
    const totalSavings = totalOriginalSize - totalOptimizedSize
    const averageCompression = (totalSavings / totalOriginalSize) * 100

    return {
      totalFiles,
      optimizedFiles,
      failedFiles,
      totalOriginalSize,
      totalOptimizedSize,
      totalSavings,
      averageCompression,
      formatOriginalSize: formatFileSize(totalOriginalSize),
      formatOptimizedSize: formatFileSize(totalOptimizedSize),
      formatSavings: formatFileSize(totalSavings),
    }
  }, [progress])

  return {
    optimizing,
    progress,
    optimizeImage,
    optimizeImages,
    optimizeImagesWithProgress,
    clearProgress,
    clearAllProgress,
    getOptimizationStats,
    validateFile,
  }
}

// Specialized hook for car photo optimization
export function useCarPhotoOptimization(options?: UseImageOptimizationOptions) {
  const {
    optimizeImage: baseOptimizeImage,
    optimizeImages: baseOptimizeImages,
    ...rest
  } = useImageOptimization({
    targetSize: 1.5 * 1024 * 1024, // 1.5MB for car photos
    maxOriginalSize: 10 * 1024 * 1024, // 10MB max
    showToasts: true,
    autoOptimize: true,
    ...options,
  })

  // Optimize car photo with specific settings
  const optimizeCarPhoto = useCallback(
    async (file: File) => {
      // Validate file type for car photos
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
      ]
      if (!validTypes.includes(file.type)) {
        throw new Error(
          'Invalid file type. Only JPEG, PNG, WebP, and GIF are supported.'
        )
      }

      return baseOptimizeImage(file)
    },
    [baseOptimizeImage]
  )

  // Optimize multiple car photos
  const optimizeCarPhotos = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter(file => {
        const validTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',
        ]
        return validTypes.includes(file.type)
      })

      if (validFiles.length !== files.length) {
        const invalidCount = files.length - validFiles.length
        toast.warning(`${invalidCount} file(s) skipped - invalid image format`)
      }

      return baseOptimizeImages(validFiles)
    },
    [baseOptimizeImages]
  )

  return {
    ...rest,
    optimizeImage: optimizeCarPhoto,
    optimizeImages: optimizeCarPhotos,
  }
}
