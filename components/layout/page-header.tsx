import { cn } from '@/lib/utils'
import { BackButton } from '@/components/common/back-button'

interface PageHeaderProps {
  title: string
  description?: string
  onBack?: () => void
  backHref?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  size?: 'sm' | 'md' | 'lg'
  showDivider?: boolean
  showBackButton?: boolean
  containerClassName?: string
}

export const PageHeader = ({
  title,
  description,
  onBack,
  backHref,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  size = 'md',
  showDivider = false,
  showBackButton = false,
  containerClassName = '',
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

  // Back-button mode: content only (no outer container/padding).
  // Use inside PageLayout, or wrap yourself when outside the shared shell.
  if (showBackButton) {
    return (
      <div
        className={cn(
          currentSize.spacing,
          containerClassName,
          className
        )}
      >
        <div className='flex items-center'>
          <div className='mr-4'>
            <BackButton
              href={backHref}
              onClick={onBack}
              variant='ghost'
              size='sm'
              showText={false}
            />
          </div>

          <div className='flex-1 min-w-0'>
            <h1
              className={cn(
                'font-bold text-foreground tracking-tight',
                currentSize.title,
                titleClassName
              )}
            >
              {title}
            </h1>

            {description && (
              <p
                className={cn(
                  'text-muted-foreground mt-2',
                  currentSize.description,
                  descriptionClassName
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default layout without back button
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
