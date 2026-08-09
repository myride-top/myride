import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  description?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  as?: 'h2' | 'h3'
  actions?: React.ReactNode
}

export const SectionHeader = ({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  as: Tag = 'h2',
  actions,
}: SectionHeaderProps) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-6',
        className
      )}
    >
      <div className='min-w-0'>
        <Tag
          className={cn(
            'text-xl sm:text-2xl font-bold text-foreground tracking-tight',
            titleClassName
          )}
        >
          {title}
        </Tag>
        {description && (
          <p
            className={cn(
              'mt-1 text-sm text-muted-foreground',
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className='flex items-center gap-2 shrink-0'>{actions}</div>}
    </div>
  )
}
