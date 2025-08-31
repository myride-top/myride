import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Testimonial {
  name: string
  role: string
  company?: string
  content: string
  rating: number
  avatar?: string
}

interface TestimonialCardProps {
  testimonial: Testimonial
  className?: string
  variant?: 'default' | 'featured' | 'minimal'
}

export default function TestimonialCard({
  testimonial,
  className = '',
  variant = 'default',
}: TestimonialCardProps) {
  const { name, role, company, content, rating, avatar } = testimonial

  const variantClasses = {
    default: 'bg-card border border-border/50 hover:border-primary/50',
    featured: 'bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20',
    minimal: 'bg-transparent border-none',
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'w-4 h-4',
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        )}
      />
    ))
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
      {/* Rating */}
      <div className='flex items-center gap-1 mb-4'>
        {renderStars(rating)}
      </div>

      {/* Content */}
      <blockquote className='text-muted-foreground leading-relaxed mb-6 italic'>
        "{content}"
      </blockquote>

      {/* Author */}
      <div className='flex items-center gap-3'>
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className='w-12 h-12 rounded-full object-cover'
          />
        ) : (
          <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
            <span className='text-primary font-semibold text-lg'>
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div>
          <div className='font-semibold text-foreground'>{name}</div>
          <div className='text-sm text-muted-foreground'>
            {role}
            {company && ` at ${company}`}
          </div>
        </div>
      </div>
    </div>
  )
}
