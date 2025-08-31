import React from 'react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface CTAButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  href?: string
  external?: boolean
  showArrow?: boolean
  gradient?: boolean
  className?: string
  children: React.ReactNode
}

export default function CTAButton({
  href,
  external = false,
  showArrow = true,
  gradient = true,
  className,
  children,
  ...props
}: CTAButtonProps) {
  const buttonContent = (
    <div className="inline-flex items-center gap-2">
      {children}
      {showArrow && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
    </div>
  )

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(className)}
        >
          <Button
            variant={gradient ? 'gradient' : 'default'}
            size="xl"
            rounded="full"
            className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            {...props}
          >
            {buttonContent}
          </Button>
        </a>
      )
    }

    return (
      <Button
        variant={gradient ? 'gradient' : 'default'}
        size="xl"
        rounded="full"
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl",
          className
        )}
        asChild
        {...props}
      >
        <a href={href}>
          {buttonContent}
        </a>
      </Button>
    )
  }

  return (
    <Button
      variant={gradient ? 'gradient' : 'default'}
      size="xl"
      rounded="full"
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl",
        className
      )}
      {...props}
    >
      {buttonContent}
    </Button>
  )
}
