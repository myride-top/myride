import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AlertType =
  | 'default'
  | 'destructive'
  | 'warning'
  | 'success'
  | 'info'

export interface AlertProps {
  type?: AlertType
  title?: string
  message: string
  className?: string
  showIcon?: boolean
  onDismiss?: () => void
  variant?: 'default' | 'bordered' | 'filled'
}

export const Alert = ({
  type = 'default',
  title,
  message,
  className = '',
  showIcon = true,
  onDismiss,
  variant = 'default',
}: AlertProps) => {
  const typeConfig = {
    default: {
      icon: Info,
      classes: 'bg-muted/50 border-muted text-muted-foreground',
      iconColor: 'text-muted-foreground',
    },
    destructive: {
      icon: AlertCircle,
      classes: 'bg-destructive/10 border-destructive/20 text-destructive',
      iconColor: 'text-destructive',
    },
    warning: {
      icon: AlertTriangle,
      classes:
        'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    success: {
      icon: CheckCircle,
      classes:
        'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    info: {
      icon: Info,
      classes:
        'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  }

  const variantClasses = {
    default: 'rounded-md p-4',
    bordered: 'rounded-md p-4 border',
    filled: 'rounded-md p-4 border-0',
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className={cn(variantClasses[variant], config.classes, className)}>
      <div className='flex'>
        {showIcon && (
          <div className='flex-shrink-0'>
            <Icon className={cn('h-5 w-5', config.iconColor)} />
          </div>
        )}

        <div className={cn(showIcon ? 'ml-3' : 'ml-0', 'flex-1')}>
          {title && <h4 className='text-sm font-medium mb-1'>{title}</h4>}
          <p className='text-sm'>{message}</p>
        </div>

        {onDismiss && (
          <div className='ml-auto pl-3'>
            <button
              onClick={onDismiss}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                'focus:ring-current text-current hover:bg-current/20 transition-colors'
              )}
            >
              <span className='sr-only'>Dismiss</span>
              <X className='h-4 w-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Convenience components for backward compatibility
export function ErrorAlert(props: Omit<AlertProps, 'type'>) {
  return <Alert {...props} type='destructive' />
}

export function WarningAlert(props: Omit<AlertProps, 'type'>) {
  return <Alert {...props} type='warning' />
}

export function SuccessAlert(props: Omit<AlertProps, 'type'>) {
  return <Alert {...props} type='success' />
}

export function InfoAlert(props: Omit<AlertProps, 'type'>) {
  return <Alert {...props} type='info' />
}
