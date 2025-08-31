import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Stat {
  icon: LucideIcon
  value: string | number
  label: string
  description?: string
  color?: string
}

interface StatsCardProps {
  stat: Stat
  className?: string
  showIcon?: boolean
  showDescription?: boolean
  variant?: 'default' | 'highlighted' | 'minimal'
}

export default function StatsCard({
  stat,
  className = '',
  showIcon = true,
  showDescription = true,
  variant = 'default',
}: StatsCardProps) {
  const { icon: Icon, value, label, description, color = 'text-primary' } = stat

  const variantClasses = {
    default: 'bg-card border border-border/50 hover:border-primary/50',
    highlighted: 'bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20',
    minimal: 'bg-transparent border-none',
  }

  return (
    <div
      className={cn(
        'p-6 rounded-2xl transition-all duration-300 group',
        variantClasses[variant],
        'hover:scale-105 hover:shadow-lg',
        className
      )}
    >
      <div className='text-center'>
        {showIcon && (
          <div className={cn(
            'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-transform duration-300',
            'bg-primary/10 group-hover:scale-110',
            color
          )}>
            <Icon className='w-8 h-8' />
          </div>
        )}
        
        <div className={cn(
          'text-3xl md:text-4xl font-bold mb-2',
          variant === 'highlighted' ? 'text-primary' : 'text-foreground'
        )}>
          {value}
        </div>
        
        <div className={cn(
          'text-lg font-semibold mb-2',
          variant === 'highlighted' ? 'text-primary' : 'text-foreground'
        )}>
          {label}
        </div>
        
        {showDescription && description && (
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
