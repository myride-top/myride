import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconWrapper } from './icon-wrapper'
import { Card } from './card'

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

export const FeatureCard = ({
  feature,
  className = '',
  showGradient = false,
  showHoverEffect = true,
  index = 0,
}: FeatureCardProps) => {
  const {
    icon,
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
      <Card
        variant={showGradient ? 'gradient' : 'default'}
        padding='lg'
        rounded='2xl'
        hover={showHoverEffect}
        className='h-full relative'
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
        <div className='relative mb-4'>
          <IconWrapper
            icon={icon}
            size='md'
            variant={showGradient ? 'gradient' : 'custom'}
            bgColor={bgColor}
            color={showGradient ? undefined : 'text-primary'}
            showHoverEffect={showHoverEffect}
            rounded='xl'
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
      </Card>
    </div>
  )
}
