interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
  format?: 'jpeg' | 'webp'
}

interface OptimizedImage {
  blob: Blob
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  dimensions: { width: number; height: number }
}

/**
 * Optimizes an image file to reduce size while maintaining quality
 * Target: Max 1500KB with reasonable quality
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.9, // Start with higher quality
    maxSizeKB = 1500,
    format = 'jpeg',
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        const { width, height } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        )

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and resize image
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to blob with specified quality
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }

            const originalSize = file.size
            const optimizedSize = blob.size
            const compressionRatio = (1 - optimizedSize / originalSize) * 100

            resolve({
              blob,
              originalSize,
              optimizedSize,
              compressionRatio,
              dimensions: { width, height },
            })
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Further compresses image if it's still over the target size
 */
export async function compressToTargetSize(
  file: File,
  targetSizeKB: number = 1500
): Promise<OptimizedImage> {
  let currentQuality = 0.9 // Start with higher quality
  let minQuality = 0.3 // Allow lower quality as fallback
  let maxAttempts = 8 // Fewer attempts needed
  let attempt = 0

  while (attempt < maxAttempts) {
    try {
      const result = await optimizeImage(file, { quality: currentQuality })

      // If we're under target size, return the result
      if (result.optimizedSize <= targetSizeKB * 1024) {
        return result
      }

      // Reduce quality more gradually for better results
      currentQuality = Math.max(minQuality, currentQuality - 0.15)
      attempt++
    } catch (error) {
      console.error('Compression attempt failed:', error)
      break
    }
  }

  // If we still can't get under target size, return the best attempt
  return optimizeImage(file, { quality: minQuality })
}

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight }

  // Scale down if image is larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height

    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }
  }

  return { width: Math.round(width), height: Math.round(height) }
}

/**
 * Converts file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Checks if image needs optimization
 */
export function needsOptimization(
  file: File,
  targetSizeKB: number = 1500
): boolean {
  return file.size > targetSizeKB * 1024
}

/**
 * Gets image dimensions without loading the full image
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
