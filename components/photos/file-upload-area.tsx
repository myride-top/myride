import React from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  isDragOver?: boolean
  disabled?: boolean
  multiple?: boolean
  accept?: string
  maxSize?: number
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  title?: string
  subtitle?: string
  description?: string
  icon?: React.ReactNode
  showFileInfo?: boolean
}

export default function FileUploadArea({
  onFilesSelected,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver = false,
  disabled = false,
  multiple = true,
  accept = 'image/*',
  maxSize,
  className = '',
  variant = 'default',
  title = 'Upload files',
  subtitle = 'or drag and drop',
  description,
  icon = <Upload className="h-12 w-12" />,
  showFileInfo = true,
}: FileUploadAreaProps) {
  const variantClasses = {
    default: 'p-6',
    compact: 'p-4',
    minimal: 'p-3',
  }

  const iconSizes = {
    default: 'h-12 w-12',
    compact: 'h-8 w-8',
    minimal: 'h-6 w-6',
  }

  const textSizes = {
    default: 'text-sm',
    compact: 'text-sm',
    minimal: 'text-xs',
  }

  const currentVariant = variantClasses[variant]
  const currentIconSize = iconSizes[variant]
  const currentTextSize = textSizes[variant]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver?.(e)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    onDragLeave?.(e)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop?.(e)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg text-center transition-all duration-200',
        currentVariant,
        isDragOver
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-muted/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-3">
        {/* Icon */}
        <div className={cn(
          'mx-auto text-muted-foreground',
          currentIconSize
        )}>
          {icon}
        </div>

        {/* Title and Upload Button */}
        <div className="space-y-2">
          <div className={cn(
            'text-muted-foreground',
            currentTextSize
          )}>
            <label
              htmlFor="file-input"
              className={cn(
                'relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary/80 transition-colors',
                'focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <span>{title}</span>
              <input
                id="file-input"
                name="file-input"
                type="file"
                className="sr-only"
                multiple={multiple}
                accept={accept}
                onChange={handleFileSelect}
                disabled={disabled}
              />
            </label>
            <span className="pl-1">{subtitle}</span>
          </div>

          {/* Description */}
          {description && (
            <p className={cn(
              'text-muted-foreground',
              variant === 'minimal' ? 'text-xs' : 'text-sm'
            )}>
              {description}
            </p>
          )}

          {/* File Info */}
          {showFileInfo && (
            <div className={cn(
              'text-muted-foreground space-y-1',
              variant === 'minimal' ? 'text-xs' : 'text-sm'
            )}>
              {accept && (
                <p>Supported formats: {accept}</p>
              )}
              {maxSize && (
                <p>Maximum size: {formatFileSize(maxSize)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/5 border-2 border-primary rounded-lg flex items-center justify-center">
          <div className="text-primary font-medium">Drop files here</div>
        </div>
      )}
    </div>
  )
}

// Specialized components for common use cases
interface ImageUploadAreaProps extends Omit<FileUploadAreaProps, 'accept' | 'icon'> {
  maxImageSize?: number
  showOptimizationInfo?: boolean
}

export function ImageUploadArea({
  maxImageSize = 10 * 1024 * 1024, // 10MB
  showOptimizationInfo = true,
  ...props
}: ImageUploadAreaProps) {
  const description = showOptimizationInfo
    ? 'PNG, JPG, GIF, WebP (auto-optimized to 1.5MB)'
    : 'PNG, JPG, GIF, WebP'

  return (
    <FileUploadArea
      {...props}
      accept="image/*"
      maxSize={maxImageSize}
      description={description}
      icon={<Upload className="h-12 w-12" />}
    />
  )
}

interface DocumentUploadAreaProps extends Omit<FileUploadAreaProps, 'accept' | 'icon'> {
  maxDocumentSize?: number
  allowedTypes?: string[]
}

export function DocumentUploadArea({
  maxDocumentSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['pdf', 'doc', 'docx', 'txt'],
  ...props
}: DocumentUploadAreaProps) {
  const accept = allowedTypes.map(type => `.${type}`).join(',')
  const description = `Supported formats: ${allowedTypes.join(', ').toUpperCase()}`

  return (
    <FileUploadArea
      {...props}
      accept={accept}
      maxSize={maxDocumentSize}
      description={description}
      icon={<Upload className="h-12 w-12" />}
    />
  )
}
