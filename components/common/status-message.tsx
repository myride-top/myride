import React from 'react'
import { LucideIcon, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type StatusType = 'error' | 'loading' | 'empty' | 'success'

export interface StatusMessageProps {
  type: StatusType
  title?: string
  message: string
  icon?: LucideIcon
  action?: React.ReactNode
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'minimal' | 'fullscreen' | 'card'
  size?: 'sm' | 'md' | 'lg'
}

export default function StatusMessage({
  type,
  title,
  message,
  icon,
  action,
  onRetry,
  className = '',
  variant = 'default',
  size = 'md',
}: StatusMessageProps) {
  const defaultIcons = {
    error: AlertCircle,
    loading: Loader2,
    empty: icon || AlertCircle,
    success: icon || RefreshCw,
  }

  const defaultTitles = {
    error: 'Something went wrong',
    loading: 'Loading...',
    empty: 'No data found',
    success: 'Success!',
  }

  const Icon = icon || defaultIcons[type]
  const displayTitle = title || defaultTitles[type]

  const variantClasses = {
    default: 'text-center py-12',
    minimal: 'text-center py-6',
    fullscreen: 'min-h-screen bg-background flex items-center justify-center',
    card: 'text-center p-6 bg-card border border-border rounded-lg',
  }

  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-20',
  }

  const iconClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const iconColorClasses = {
    error: 'text-destructive',
    loading: 'text-primary animate-spin',
    empty: 'text-muted-foreground',
    success: 'text-green-600',
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else if (type === 'error') {
      window.location.reload()
    }
  }

  const renderContent = () => (
    <>
      <div className='flex justify-center mb-4'>
        <Icon className={cn(iconClasses[size], iconColorClasses[type])} />
      </div>
      
      <h3 className={cn(
        'font-semibold mb-2',
        size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-base',
        'text-foreground'
      )}>
        {displayTitle}
      </h3>
      
      <p className={cn(
        'text-muted-foreground mb-6 max-w-md mx-auto',
        size === 'lg' ? 'text-base' : 'text-sm'
      )}>
        {message}
      </p>
      
      {/* Action buttons */}
      <div className='flex flex-col sm:flex-row gap-3 justify-center'>
        {type === 'error' && onRetry && (
          <Button
            onClick={handleRetry}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        
        {action && action}
      </div>
    </>
  )

  if (variant === 'fullscreen') {
    return (
      <div className={cn(variantClasses.fullscreen, className)}>
        <div className="text-center max-w-md mx-auto px-4">
          {renderContent()}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      variantClasses[variant],
      variant !== 'card' && sizeClasses[size],
      className
    )}>
      {renderContent()}
    </div>
  )
}

// Convenience components for backward compatibility
export function ErrorState(props: Omit<StatusMessageProps, 'type'>) {
  return <StatusMessage {...props} type="error" />
}

export function LoadingState(props: Omit<StatusMessageProps, 'type'>) {
  return <StatusMessage {...props} type="loading" />
}

export function EmptyState(props: Omit<StatusMessageProps, 'type'>) {
  return <StatusMessage {...props} type="empty" />
}
