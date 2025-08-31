import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'minimal' | 'fullscreen'
  showRetry?: boolean
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
  variant = 'default',
  showRetry = true,
}: ErrorStateProps) {
  const variantClasses = {
    default: 'text-center py-12',
    minimal: 'text-center py-6',
    fullscreen: 'min-h-screen bg-background flex items-center justify-center',
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const content = (
    <>
      <div className='flex justify-center mb-4'>
        <AlertCircle className='h-12 w-12 text-destructive' />
      </div>
      
      <h3 className='text-lg font-semibold text-foreground mb-2'>
        {title}
      </h3>
      
      <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
        {message}
      </p>
      
      {showRetry && (
        <Button
          onClick={handleRetry}
          variant="outline"
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </>
  )

  if (variant === 'fullscreen') {
    return (
      <div className={cn(variantClasses.fullscreen, className)}>
        <div className="text-center max-w-md mx-auto px-4">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(variantClasses[variant], className)}>
      {content}
    </div>
  )
}
