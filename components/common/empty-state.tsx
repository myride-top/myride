import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  variant?: 'default' | 'muted' | 'card'
  size?: 'sm' | 'md' | 'lg'
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
  size = 'md',
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-10 w-10',
      title: 'text-base',
      description: 'text-sm',
      spacing: 'mt-4',
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'mt-6',
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'mt-8',
    },
  }

  const currentSize = sizeClasses[size]

  const containerClasses = cn(
    'text-center',
    currentSize.container,
    variant === 'muted' && 'bg-muted/50 rounded-lg px-4',
    variant === 'card' &&
      'bg-card border border-border rounded-lg px-6 shadow-sm',
    className
  )

  return (
    <div className={containerClasses} role='status' aria-live='polite'>
      {Icon && (
        <Icon
          className={cn(
            'mx-auto text-muted-foreground/60 transition-colors',
            currentSize.icon
          )}
          aria-hidden='true'
        />
      )}
      <h3
        className={cn(
          'mt-4 font-semibold text-foreground',
          currentSize.title
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'mt-2 text-muted-foreground max-w-md mx-auto',
            currentSize.description
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <div className={cn('flex justify-center', currentSize.spacing)}>
          {action}
        </div>
      )}
    </div>
  )
}
