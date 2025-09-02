import React from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Step {
  id: number
  title: string
  description?: string
  completed?: boolean
  disabled?: boolean
}

interface MultiStepNavigationProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  onNext?: () => void
  onPrevious?: () => void
  onComplete?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  showStepNumbers?: boolean
  showProgress?: boolean
  showNavigation?: boolean
  nextButtonText?: string
  previousButtonText?: string
  completeButtonText?: string
  loading?: boolean
}

export default function MultiStepNavigation({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onComplete,
  className = '',
  variant = 'default',
  showStepNumbers = true,
  showProgress = true,
  showNavigation = true,
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  completeButtonText = 'Complete',
  loading = false,
}: MultiStepNavigationProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const stepVariantClasses = {
    default: 'p-4 border rounded-lg',
    compact: 'p-2 border-b',
    minimal: 'p-1',
  }

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious()
    } else if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className='w-full'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-muted-foreground'>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className='text-sm font-medium text-foreground'>
              {Math.round(progress)}%
            </span>
          </div>
          <div className='w-full bg-muted rounded-full h-2'>
            <div
              className='bg-primary h-2 rounded-full transition-all duration-300 ease-out'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Indicators */}
      {variant !== 'minimal' && (
        <div
          className={cn(
            'grid gap-4',
            steps.length <= 4
              ? 'grid-cols-2 md:grid-cols-4'
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          )}
        >
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = step.completed || index < currentStep
            const isDisabled = step.disabled && !isCompleted

            return (
              <button
                key={step.id}
                onClick={() => !isDisabled && onStepChange(index)}
                disabled={isDisabled}
                className={cn(
                  'relative text-left transition-all duration-200',
                  stepVariantClasses[variant],
                  'hover:bg-muted/50',
                  isActive && 'bg-primary/10 border-primary/50',
                  isCompleted &&
                    'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  !isDisabled && 'cursor-pointer'
                )}
              >
                <div className='flex items-center gap-3'>
                  {showStepNumbers && (
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold',
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isCompleted ? <Check className='w-4 h-4' /> : step.id}
                    </div>
                  )}

                  <div className='flex-1 min-w-0'>
                    <div
                      className={cn(
                        'font-medium truncate',
                        isActive ? 'text-primary' : 'text-foreground',
                        isCompleted && 'text-green-700 dark:text-green-300'
                      )}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div className='text-xs text-muted-foreground truncate'>
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      {showNavigation && (
        <div
          className={cn(
            'flex items-center justify-between',
            variant === 'minimal' ? 'pt-4' : 'pt-6'
          )}
        >
          <Button
            variant='outline'
            onClick={handlePrevious}
            disabled={isFirstStep || loading}
            className='flex items-center gap-2'
          >
            <ChevronLeft className='w-4 h-4' />
            {previousButtonText}
          </Button>

          <div className='flex items-center gap-2'>
            {!isLastStep ? (
              <Button
                onClick={handleNext}
                disabled={loading || !currentStepData?.completed}
                className='flex items-center gap-2'
              >
                {nextButtonText}
                <ChevronRight className='w-4 h-4' />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading || !currentStepData?.completed}
                className='flex items-center gap-2'
              >
                {completeButtonText}
                <Check className='w-4 h-4' />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
