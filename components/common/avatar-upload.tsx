'use client'

import { useState, useRef, useCallback } from 'react'
import { uploadProfileAvatar, deleteProfileAvatar } from '@/lib/storage/photos'
import { toast } from 'sonner'
import { Camera, X, Loader2, User } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId: string
  onAvatarUpdate: (avatarUrl: string) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function AvatarUpload({
  currentAvatarUrl,
  userId,
  onAvatarUpdate,
  size = 'md',
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatarUrl || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (2MB limit for avatars)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = e => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to storage
      setUploading(true)
      try {
        const avatarUrl = await uploadProfileAvatar(file, userId)
        if (avatarUrl) {
          setPreviewUrl(avatarUrl)
          onAvatarUpdate(avatarUrl)
          toast.success('Avatar updated successfully!')
        } else {
          toast.error('Failed to upload avatar')
          setPreviewUrl(currentAvatarUrl || null)
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
        toast.error('Failed to upload avatar')
        setPreviewUrl(currentAvatarUrl || null)
      } finally {
        setUploading(false)
      }
    },
    [userId, onAvatarUpdate, currentAvatarUrl]
  )

  const handleRemoveAvatar = async () => {
    setUploading(true)
    try {
      await deleteProfileAvatar(userId)
      setPreviewUrl(null)
      onAvatarUpdate('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast.success('Avatar removed successfully!')
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='relative group'>
        <div
          className={`${
            sizeClasses[size]
          } rounded-full overflow-hidden border-2 border-border bg-muted cursor-pointer transition-all duration-200 group-hover:border-primary/50 ${
            uploading ? 'opacity-50' : ''
          }`}
          onClick={handleClick}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt='Profile avatar'
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <User className='w-1/2 h-1/2 text-muted-foreground' />
            </div>
          )}

          {/* Upload overlay */}
          <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-full'>
            <Camera className='w-6 h-6 text-white' />
          </div>

          {/* Loading overlay */}
          {uploading && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <Loader2 className='w-6 h-6 text-white animate-spin' />
            </div>
          )}
        </div>

        {/* Remove button */}
        {previewUrl && !uploading && (
          <button
            onClick={handleRemoveAvatar}
            className='absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors'
            type='button'
          >
            <X className='w-3 h-3' />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        className='hidden'
      />

      <div className='text-center'>
        <button
          type='button'
          onClick={handleClick}
          disabled={uploading}
          className='text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {uploading ? 'Uploading...' : 'Change Avatar'}
        </button>
        <p className='text-xs text-muted-foreground mt-1'>
          JPG, PNG, GIF up to 2MB
        </p>
      </div>
    </div>
  )
}
