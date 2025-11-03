import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  children: React.ReactNode
  className?: string
  titleClassName?: string
  showBorder?: boolean
}

export const FormSection = ({
  title,
  children,
  className,
  titleClassName,
  showBorder = true,
}: FormSectionProps) => {
  return (
    <div className={cn('space-y-6', showBorder && 'border-t pt-6', className)}>
      <h4 className={cn('text-lg font-medium text-foreground', titleClassName)}>
        {title}
      </h4>
      {children}
    </div>
  )
}
