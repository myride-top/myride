import React from 'react'
import { cn } from '@/lib/utils'

interface FormStepProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  size?: 'sm' | 'md' | 'lg'
  showDivider?: boolean
}

export const FormStep = ({
  title,
  description,
  children,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  size = 'md',
  showDivider = false,
}: FormStepProps) => {
  const sizeClasses = {
    sm: {
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-4',
    },
    md: {
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-6',
    },
    lg: {
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-8',
    },
  }

  const currentSize = sizeClasses[size]

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 duration-300',
        className
      )}
    >
      <div className={cn('mb-6', currentSize.spacing)}>
        <h3
          className={cn(
            'font-semibold text-foreground mb-2',
            currentSize.title,
            titleClassName
          )}
        >
          {title}
        </h3>

        {description && (
          <p
            className={cn(
              'text-muted-foreground',
              currentSize.description,
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}
      </div>

      <div className={currentSize.spacing}>{children}</div>

      {showDivider && <div className='w-full h-px bg-border mt-8' />}
    </div>
  )
}

// Extended component with step number
interface FormStepWithNumberProps extends FormStepProps {
  stepNumber: number
  totalSteps: number
  showStepNumber?: boolean
}

export function FormStepWithNumber({
  stepNumber,
  totalSteps,
  showStepNumber = true,
  ...props
}: FormStepWithNumberProps) {
  return (
    <FormStep {...props}>
      {showStepNumber && (
        <div className='flex items-center gap-3 mb-4'>
          <div className='flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold'>
            {stepNumber}
          </div>
          <div className='flex-1'>
            <div className='text-sm text-muted-foreground'>
              Step {stepNumber} of {totalSteps}
            </div>
          </div>
        </div>
      )}
      {props.children}
    </FormStep>
  )
}

// Grid layout for form fields
interface FormStepGridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FormStepGrid({
  children,
  cols = 2,
  gap = 'md',
  className = '',
}: FormStepGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }

  return (
    <div className={cn('grid', gridCols[cols], gapClasses[gap], className)}>
      {children}
    </div>
  )
}
