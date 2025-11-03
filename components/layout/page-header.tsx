import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  size?: 'sm' | 'md' | 'lg'
  showDivider?: boolean
}

export const PageHeader = ({
  title,
  description,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  size = 'md',
  showDivider = false,
}: PageHeaderProps) => {
  const sizeClasses = {
    sm: {
      title: 'text-2xl md:text-3xl',
      description: 'text-base',
      spacing: 'mb-4',
    },
    md: {
      title: 'text-3xl md:text-4xl',
      description: 'text-lg',
      spacing: 'mb-6',
    },
    lg: {
      title: 'text-4xl md:text-5xl',
      description: 'text-xl',
      spacing: 'mb-8',
    },
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={cn('mb-6', currentSize.spacing, className)}>
      <h1
        className={cn(
          'font-bold text-foreground mb-2',
          currentSize.title,
          titleClassName
        )}
      >
        {title}
      </h1>

      {description && (
        <p
          className={cn(
            'text-muted-foreground',
            currentSize.description,
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}

      {showDivider && <div className='w-full h-px bg-border mt-6' />}
    </div>
  )
}
