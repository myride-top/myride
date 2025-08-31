import React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  description?: string
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  centered?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function SectionHeader({
  title,
  description,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  centered = true,
  size = 'md',
}: SectionHeaderProps) {
  const sizeClasses = {
    sm: {
      title: 'text-2xl md:text-3xl',
      description: 'text-base',
      spacing: 'mb-8',
    },
    md: {
      title: 'text-3xl md:text-4xl',
      description: 'text-lg',
      spacing: 'mb-12',
    },
    lg: {
      title: 'text-4xl md:text-5xl',
      description: 'text-xl',
      spacing: 'mb-16',
    },
  }

  const currentSize = sizeClasses[size]

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 duration-700',
        currentSize.spacing,
        centered && 'text-center',
        className
      )}
    >
      <h2
        className={cn(
          'font-bold text-foreground mb-4',
          currentSize.title,
          titleClassName
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            'text-muted-foreground max-w-2xl',
            currentSize.description,
            centered && 'mx-auto',
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
