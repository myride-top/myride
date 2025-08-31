import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  color?: string
  bgColor?: string
}

interface FeatureCardProps {
  feature: Feature
  className?: string
  showGradient?: boolean
  showHoverEffect?: boolean
  index?: number
}

export default function FeatureCard({
  feature,
  className = '',
  showGradient = false,
  showHoverEffect = true,
  index = 0,
}: FeatureCardProps) {
  const {
    icon: Icon,
    title,
    description,
    color = 'from-primary to-secondary',
    bgColor = 'bg-primary/10',
  } = feature

  return (
    <div
      className={cn(
        'group relative transition-all duration-300',
        showHoverEffect && 'hover:-translate-y-1 hover:scale-[1.01]',
        className
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={cn(
          'relative p-6 rounded-2xl border border-border/50 transition-all duration-300 h-full',
          showHoverEffect && 'hover:border-primary/50',
          'bg-card'
        )}
      >
        {/* Background gradient on hover */}
        {showGradient && (
          <div
            className={cn(
              'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300',
              showHoverEffect && 'group-hover:opacity-5',
              color
            )}
          />
        )}

        {/* Icon */}
        <div
          className={cn(
            'relative p-3 rounded-xl w-fit mb-4 transition-transform duration-300',
            bgColor,
            showHoverEffect && 'group-hover:scale-110'
          )}
        >
          <Icon
            className={cn(
              'h-8 w-8',
              showGradient
                ? `bg-gradient-to-r ${color} bg-clip-text text-transparent`
                : 'text-primary'
            )}
          />
        </div>

        {/* Content */}
        <div className='relative'>
          <h3
            className={cn(
              'text-xl font-semibold mb-3 transition-colors',
              'text-foreground',
              showHoverEffect && 'group-hover:text-primary'
            )}
          >
            {title}
          </h3>
          <p className='text-muted-foreground leading-relaxed'>{description}</p>
        </div>

        {/* Hover effect overlay */}
        {showHoverEffect && (
          <div className='absolute inset-0 rounded-2xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        )}
      </div>
    </div>
  )
}
