import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CTASectionProps {
  title: string
  description?: string
  primaryButton: {
    text: string
    href?: string
    onClick?: () => void
    variant?: 'default' | 'gradient'
  }
  secondaryButton?: {
    text: string
    href?: string
    onClick?: () => void
    variant?: 'outline' | 'ghost'
  }
  className?: string
  variant?: 'default' | 'highlighted' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
}

export default function CTASection({
  title,
  description,
  primaryButton,
  secondaryButton,
  className = '',
  variant = 'default',
  size = 'md',
}: CTASectionProps) {
  const variantClasses = {
    default: 'bg-card border border-border/50',
    highlighted: 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20',
    minimal: 'bg-transparent border-none',
  }

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const renderButton = (button: typeof primaryButton | typeof secondaryButton, isPrimary: boolean) => {
    if (button.href) {
      return (
        <Button
          variant={button.variant || (isPrimary ? 'default' : 'outline')}
          size={size === 'lg' ? 'lg' : 'default'}
          rounded="full"
          className={cn(
            isPrimary && 'hover:scale-105 active:scale-95',
            'transition-all duration-200'
          )}
          asChild
        >
          <a href={button.href}>{button.text}</a>
        </Button>
      )
    }

    return (
      <Button
        variant={button.variant || (isPrimary ? 'default' : 'outline')}
        size={size === 'lg' ? 'lg' : 'default'}
        rounded="full"
        className={cn(
          isPrimary && 'hover:scale-105 active:scale-95',
          'transition-all duration-200'
        )}
        onClick={button.onClick}
      >
        {button.text}
      </Button>
    )
  }

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <div className='text-center'>
        <h3 className={cn(
          'font-semibold mb-2',
          size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-base',
          'text-foreground'
        )}>
          {title}
        </h3>
        
        {description && (
          <p className={cn(
            'text-muted-foreground mb-4',
            size === 'lg' ? 'text-base' : 'text-sm'
          )}>
            {description}
          </p>
        )}
        
        <div className={cn(
          'flex flex-col sm:flex-row gap-3 justify-center',
          size === 'lg' ? 'gap-4' : 'gap-3'
        )}>
          {renderButton(primaryButton, true)}
          {secondaryButton && renderButton(secondaryButton, false)}
        </div>
      </div>
    </div>
  )
}
