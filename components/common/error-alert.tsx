import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorAlertProps {
  message: string
  className?: string
  variant?: 'default' | 'destructive' | 'warning'
  showIcon?: boolean
  onDismiss?: () => void
}

export const ErrorAlert = ({
  message,
  className = '',
  variant = 'destructive',
  showIcon = true,
  onDismiss,
}: ErrorAlertProps) => {
  const variantClasses = {
    default: 'bg-muted/50 border-muted text-muted-foreground',
    destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
    warning:
      'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  }

  return (
    <div
      className={cn(
        'rounded-md p-4 border',
        variantClasses[variant],
        className
      )}
    >
      <div className='flex'>
        {showIcon && (
          <div className='flex-shrink-0'>
            <AlertCircle
              className={cn(
                'h-5 w-5',
                variant === 'destructive' ? 'text-destructive' : 'text-current'
              )}
            />
          </div>
        )}

        <div className={cn(showIcon ? 'ml-3' : 'ml-0', 'flex-1')}>
          <p className='text-sm'>{message}</p>
        </div>

        {onDismiss && (
          <div className='ml-auto pl-3'>
            <button
              onClick={onDismiss}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                variant === 'destructive'
                  ? 'focus:ring-destructive text-destructive hover:bg-destructive/20'
                  : 'focus:ring-current text-current hover:bg-current/20'
              )}
            >
              <span className='sr-only'>Dismiss</span>
              <svg
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
