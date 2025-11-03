import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  className?: string
  fullScreen?: boolean
}

export const LoadingSpinner = ({
  size = 'lg',
  message = 'Loading...',
  className,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-32 w-32',
    xl: 'h-48 w-48',
  }

  const spinner = (
    <div className={cn('text-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-b-2 border-primary mx-auto',
          sizeClasses[size]
        )}
      />
      {message && (
        <p
          className={cn(
            'mt-4 text-muted-foreground',
            size === 'sm' && 'text-sm'
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
