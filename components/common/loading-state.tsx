import React from 'react'
import { cn } from '@/lib/utils'
import LoadingSpinner from './loading-spinner'

interface LoadingStateProps {
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'fullscreen'
}

export default function LoadingState({
  message = 'Loading...',
  className = '',
  size = 'md',
  variant = 'default',
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-20',
  }

  const variantClasses = {
    default: 'bg-background',
    minimal: 'bg-transparent',
    fullscreen: 'min-h-screen bg-background flex items-center justify-center',
  }

  if (variant === 'fullscreen') {
    return (
      <div className={cn(variantClasses.fullscreen, className)}>
        <LoadingSpinner message={message} size={size} />
      </div>
    )
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <LoadingSpinner message={message} size={size} />
    </div>
  )
}
