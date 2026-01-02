import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  className?: string
  fullScreen?: boolean
  variant?: 'spinner' | 'dots' | 'pulse'
}

export const LoadingSpinner = ({
  size = 'lg',
  message = 'Loading...',
  className,
  fullScreen = false,
  variant = 'spinner',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className='flex items-center justify-center gap-1.5'>
            <div className='h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]' />
            <div className='h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]' />
            <div className='h-2 w-2 bg-primary rounded-full animate-bounce' />
          </div>
        )
      case 'pulse':
        return (
          <div
            className={cn(
              'rounded-full bg-primary animate-pulse',
              sizeClasses[size]
            )}
          />
        )
      default:
        return (
          <Loader2
            className={cn(
              'animate-spin text-primary',
              sizeClasses[size]
            )}
            aria-hidden='true'
          />
        )
    }
  }

  const spinner = (
    <div
      className={cn('text-center', className)}
      role='status'
      aria-live='polite'
      aria-label={message}
    >
      <div className='flex justify-center mb-3'>{renderSpinner()}</div>
      {message && (
        <p
          className={cn(
            'text-muted-foreground animate-pulse',
            textSizeClasses[size]
          )}
        >
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        {spinner}
      </div>
    )
  }

  return spinner
}
