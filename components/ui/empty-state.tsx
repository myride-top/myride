import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  variant?: 'default' | 'muted'
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const containerClasses = cn(
    'text-center py-12',
    variant === 'muted' && 'bg-muted rounded-lg',
    className
  )

  return (
    <div className={containerClasses}>
      {Icon && (
        <Icon className='mx-auto h-12 w-12 text-muted-foreground' />
      )}
      <h3 className='mt-2 text-sm font-medium text-foreground'>{title}</h3>
      {description && (
        <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
      )}
      {action && <div className='mt-6'>{action}</div>}
    </div>
  )
}
