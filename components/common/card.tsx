import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated' | 'gradient' | 'muted'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  hover?: boolean
  interactive?: boolean
}

export const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  hover = false,
  interactive = false,
}: CardProps) => {
  const variantClasses = {
    default: 'bg-card border border-border/50',
    outlined: 'bg-transparent border border-border',
    elevated: 'bg-card shadow-lg border-0',
    gradient:
      'bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20',
    muted: 'bg-muted/50 border border-muted',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }

  const hoverClasses = hover
    ? 'hover:shadow-lg hover:border-primary/50 transition-all duration-200'
    : ''
  const interactiveClasses = interactive
    ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150'
    : ''

  return (
    <div
      className={cn(
        'transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        roundedClasses[rounded],
        hoverClasses,
        interactiveClasses,
        className
      )}
    >
      {children}
    </div>
  )
}

// Card sub-components for better composition
export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  )
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('pt-0', className)}>{children}</div>
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center pt-4', className)}>{children}</div>
  )
}
