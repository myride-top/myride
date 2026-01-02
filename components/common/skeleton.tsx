import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export const Skeleton = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  style,
  ...props
}: SkeletonProps) => {
  const baseClasses = 'bg-muted'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const customStyle = {
    ...style,
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={customStyle}
      aria-hidden='true'
      {...props}
    />
  )
}

// Pre-built skeleton components
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('bg-card border border-border rounded-lg overflow-hidden', className)}>
    <Skeleton variant='rectangular' height={200} />
    <div className='p-4 space-y-3'>
      <Skeleton variant='text' width='80%' />
      <Skeleton variant='text' width='60%' />
      <div className='flex gap-2 mt-4'>
        <Skeleton variant='rectangular' width={60} height={24} />
        <Skeleton variant='rectangular' width={60} height={24} />
      </div>
    </div>
  </div>
)

export const SkeletonText = ({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant='text'
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
)

export const SkeletonAvatar = ({
  size = 40,
  className,
}: {
  size?: number
  className?: string
}) => (
  <Skeleton
    variant='circular'
    width={size}
    height={size}
    className={className}
  />
)

