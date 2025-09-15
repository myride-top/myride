import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconWrapperProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'gradient' | 'muted' | 'custom'
  color?: string
  bgColor?: string
  className?: string
  showHoverEffect?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export default function IconWrapper({
  icon: Icon,
  size = 'md',
  variant = 'default',
  color,
  bgColor,
  className = '',
  showHoverEffect = false,
  rounded = 'lg',
}: IconWrapperProps) {
  const IconComponent = Icon

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  }

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  const variantClasses = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    gradient: 'bg-gradient-to-br from-primary/20 to-secondary/20 text-primary',
    muted: 'bg-muted text-muted-foreground',
    custom: '',
  }

  const hoverClasses = showHoverEffect ? 'group-hover:scale-110 transition-transform duration-300' : ''

  return (
    <div
      className={cn(
        'flex items-center justify-center transition-all duration-300',
        sizeClasses[size],
        roundedClasses[rounded],
        variant === 'custom' ? '' : variantClasses[variant],
        hoverClasses,
        className
      )}
      style={{
        backgroundColor: variant === 'custom' ? bgColor : undefined,
        color: variant === 'custom' ? color : undefined,
      }}
    >
      <IconComponent
        className={cn(
          iconSizeClasses[size],
          variant === 'gradient' ? 'text-primary' : ''
        )}
      />
    </div>
  )
}
