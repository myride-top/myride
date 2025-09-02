import React from 'react'
import { Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OptimizationStatus {
  status: 'pending' | 'optimizing' | 'optimized' | 'failed'
  details?: string
  error?: string
}

export interface UploadProgressItem {
  fileName: string
  progress: number
  optimization?: OptimizationStatus
  error?: string
}

interface UploadProgressProps {
  items: UploadProgressItem[]
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  showOptimizationStatus?: boolean
  showProgressBar?: boolean
  showFileNames?: boolean
  title?: string
}

export default function UploadProgress({
  items,
  className = '',
  variant = 'default',
  showOptimizationStatus = true,
  showProgressBar = true,
  showFileNames = true,
  title = 'Upload Progress',
}: UploadProgressProps) {
  if (items.length === 0) return null

  const variantClasses = {
    default: 'space-y-3',
    compact: 'space-y-2',
    minimal: 'space-y-1',
  }

  const itemClasses = {
    default: 'space-y-2',
    compact: 'space-y-1',
    minimal: 'space-y-1',
  }

  const textSizes = {
    default: 'text-sm',
    compact: 'text-xs',
    minimal: 'text-xs',
  }

  const currentVariant = variantClasses[variant]
  const currentItemClasses = itemClasses[variant]
  const currentTextSize = textSizes[variant]

  const getOptimizationIcon = (status: OptimizationStatus['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className='w-3 h-3 rounded-full border-2 border-muted-foreground' />
        )
      case 'optimizing':
        return <Zap className='w-3 h-3 animate-pulse text-blue-600' />
      case 'optimized':
        return <CheckCircle className='w-3 h-3 text-green-600' />
      case 'failed':
        return <AlertCircle className='w-3 h-3 text-orange-600' />
      default:
        return null
    }
  }

  const getOptimizationColor = (status: OptimizationStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'text-muted-foreground'
      case 'optimizing':
        return 'text-blue-600'
      case 'optimized':
        return 'text-green-600'
      case 'failed':
        return 'text-orange-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Title */}
      {title && (
        <h4 className={cn('font-medium text-foreground', currentTextSize)}>
          {title}
        </h4>
      )}

      {/* Progress Items */}
      <div className={currentVariant}>
        {items.map(item => (
          <div key={item.fileName} className={currentItemClasses}>
            {/* File Name and Progress */}
            {showFileNames && (
              <div
                className={cn(
                  'flex justify-between',
                  currentTextSize,
                  'text-muted-foreground'
                )}
              >
                <span className='truncate flex-1 mr-2'>{item.fileName}</span>
                <span className='flex-shrink-0'>{item.progress}%</span>
              </div>
            )}

            {/* Optimization Status */}
            {showOptimizationStatus && item.optimization && (
              <div
                className={cn(
                  'flex items-center gap-2',
                  currentTextSize,
                  getOptimizationColor(item.optimization.status)
                )}
              >
                {getOptimizationIcon(item.optimization.status)}
                <span className='truncate'>
                  {item.optimization.status === 'pending' &&
                    'Pending optimization...'}
                  {item.optimization.status === 'optimizing' &&
                    item.optimization.details}
                  {item.optimization.status === 'optimized' &&
                    item.optimization.details}
                  {item.optimization.status === 'failed' &&
                    (item.optimization.details || 'Optimization failed')}
                </span>
              </div>
            )}

            {/* Error Message */}
            {item.error && (
              <div
                className={cn(
                  'flex items-center gap-2 text-red-600',
                  currentTextSize
                )}
              >
                <AlertCircle className='w-3 h-3' />
                <span>{item.error}</span>
              </div>
            )}

            {/* Progress Bar */}
            {showProgressBar && (
              <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    item.error ? 'bg-red-500' : 'bg-primary'
                  )}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Specialized progress components
interface ImageUploadProgressProps extends Omit<UploadProgressProps, 'items'> {
  items: Array<
    UploadProgressItem & {
      originalSize?: number
      optimizedSize?: number
      compressionRatio?: number
    }
  >
  showCompressionInfo?: boolean
}

export function ImageUploadProgress({
  items,
  showCompressionInfo = true,
  ...props
}: ImageUploadProgressProps) {
  const enhancedItems = items.map(item => ({
    ...item,
    optimization: item.optimization || {
      status: 'pending' as const,
      details: 'Processing image...',
    },
  }))

  return (
    <UploadProgress
      {...props}
      items={enhancedItems}
      showOptimizationStatus={true}
    />
  )
}

// Progress item with loading state
interface LoadingProgressItemProps {
  fileName: string
  status: 'uploading' | 'processing' | 'complete' | 'error'
  message?: string
  className?: string
}

export function LoadingProgressItem({
  fileName,
  status,
  message,
  className = '',
}: LoadingProgressItemProps) {
  const statusConfig = {
    uploading: {
      icon: <Loader2 className='w-4 h-4 animate-spin text-blue-600' />,
      color: 'text-blue-600',
      defaultMessage: 'Uploading...',
    },
    processing: {
      icon: <Zap className='w-4 h-4 animate-pulse text-yellow-600' />,
      color: 'text-yellow-600',
      defaultMessage: 'Processing...',
    },
    complete: {
      icon: <CheckCircle className='w-4 h-4 text-green-600' />,
      color: 'text-green-600',
      defaultMessage: 'Complete',
    },
    error: {
      icon: <AlertCircle className='w-4 h-4 text-red-600' />,
      color: 'text-red-600',
      defaultMessage: 'Error occurred',
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 bg-muted/20 rounded-lg',
        className
      )}
    >
      {config.icon}
      <div className='flex-1 min-w-0'>
        <div className='text-sm font-medium text-foreground truncate'>
          {fileName}
        </div>
        <div className={cn('text-xs', config.color)}>
          {message || config.defaultMessage}
        </div>
      </div>
    </div>
  )
}
