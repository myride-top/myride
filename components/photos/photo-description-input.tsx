import React from 'react'
import { cn } from '@/lib/utils'
import { FormField } from '@/components/forms/form-field'

interface PhotoDescription {
  url: string
  description: string
}

interface PhotoDescriptionInputProps {
  photos: PhotoDescription[]
  onDescriptionChange: (url: string, description: string) => void
  onRemove?: (url: string) => void
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  showRemoveButton?: boolean
  placeholder?: string
  maxLength?: number
  autoFocus?: boolean
  disabled?: boolean
}

export default function PhotoDescriptionInput({
  photos,
  onDescriptionChange,
  onRemove,
  className = '',
  variant = 'default',
  showRemoveButton = false,
  placeholder = 'Describe this photo (optional)',
  maxLength = 200,
  autoFocus = false,
  disabled = false,
}: PhotoDescriptionInputProps) {
  if (photos.length === 0) return null

  const variantClasses = {
    default: 'space-y-4',
    compact: 'space-y-3',
    minimal: 'space-y-2',
  }

  const photoClasses = {
    default: 'flex items-start gap-4 p-4 bg-muted/20 rounded-lg',
    compact: 'flex items-start gap-3 p-3 bg-muted/20 rounded-lg',
    minimal: 'flex items-start gap-2 p-2 bg-muted/20 rounded-lg',
  }

  const imageSizes = {
    default: 'w-20 h-20',
    compact: 'w-16 h-16',
    minimal: 'w-12 h-12',
  }

  const currentVariant = variantClasses[variant]
  const currentPhotoClasses = photoClasses[variant]
  const currentImageSize = imageSizes[variant]

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-card-foreground">
          Photo Descriptions ({photos.length})
        </h4>
        {photos.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Optional - add descriptions to help organize your photos
          </span>
        )}
      </div>

      {/* Photo Descriptions */}
      <div className={currentVariant}>
        {photos.map((photo, index) => (
          <div key={photo.url} className={currentPhotoClasses}>
            {/* Photo Thumbnail */}
            <div className="flex-shrink-0">
              <img
                src={photo.url}
                alt="Photo preview"
                className={cn(
                  'object-cover rounded-md border border-border',
                  currentImageSize
                )}
              />
            </div>

            {/* Description Input */}
            <div className="flex-1 min-w-0">
              <FormField
                label={`Photo ${index + 1}`}
                name={`description-${index}`}
                value={photo.description}
                onChange={(e) => onDescriptionChange(photo.url, e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                autoFocus={autoFocus && index === 0}
                maxLength={maxLength}
                variant="outline"
                size="sm"
                className="mb-0"
              />
              
              {/* Character Count */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {photo.description.length}/{maxLength} characters
                </span>
                
                {/* Remove Button */}
                {showRemoveButton && onRemove && (
                  <button
                    onClick={() => onRemove(photo.url)}
                    disabled={disabled}
                    className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Descriptions help organize and categorize your photos</p>
        <p>• You can edit these later in the photo management section</p>
        <p>• Leave blank if no description is needed</p>
      </div>
    </div>
  )
}

// Extended component with category selection
interface PhotoDescriptionWithCategory extends PhotoDescription {
  category?: string
}

interface PhotoDescriptionWithCategoryInputProps extends Omit<PhotoDescriptionInputProps, 'photos'> {
  photos: PhotoDescriptionWithCategory[]
  onCategoryChange?: (url: string, category: string) => void
  categories?: string[]
  showCategorySelect?: boolean
}

export function PhotoDescriptionWithCategoryInput({
  photos,
  onDescriptionChange,
  onCategoryChange,
  onRemove,
  categories = ['other', 'exterior', 'interior', 'engine', 'wheels', 'suspension'],
  showCategorySelect = true,
  ...props
}: PhotoDescriptionWithCategoryInputProps) {
  return (
    <div className="space-y-4">
      <PhotoDescriptionInput
        photos={photos}
        onDescriptionChange={onDescriptionChange}
        onRemove={onRemove}
        {...props}
      />

      {/* Category Selection */}
      {showCategorySelect && onCategoryChange && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-card-foreground">
            Photo Categories
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div key={photo.url} className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Photo {index + 1}
                </label>
                <select
                  value={photo.category || 'other'}
                  onChange={(e) => onCategoryChange(photo.url, e.target.value)}
                  disabled={props.disabled}
                  className="w-full px-2 py-1 text-xs border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for inline use
interface CompactPhotoDescriptionProps {
  photo: PhotoDescription
  onDescriptionChange: (url: string, description: string) => void
  onRemove?: (url: string) => void
  className?: string
  placeholder?: string
  maxLength?: number
  disabled?: boolean
}

export function CompactPhotoDescription({
  photo,
  onDescriptionChange,
  onRemove,
  className = '',
  placeholder = 'Add description...',
  maxLength = 100,
  disabled = false,
}: CompactPhotoDescriptionProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Photo Thumbnail */}
      <img
        src={photo.url}
        alt="Photo preview"
        className="w-12 h-12 object-cover rounded-md border border-border flex-shrink-0"
      />

      {/* Description Input */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={photo.description}
          onChange={(e) => onDescriptionChange(photo.url, e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={() => onRemove(photo.url)}
          disabled={disabled}
          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
          title="Remove photo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
