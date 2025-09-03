import React from 'react'
import { cn } from '@/lib/utils'
import { Button as UIButton, ButtonProps as UIButtonProps } from '@/components/ui/button'
import { ArrowRight, ExternalLink } from 'lucide-react'

export interface ButtonProps extends Omit<UIButtonProps, 'variant' | 'size'> {
  href?: string
  external?: boolean
  showArrow?: boolean
  showExternalIcon?: boolean
  gradient?: boolean
  className?: string
  children: React.ReactNode
  variant?: 'default' | 'gradient' | 'support' | 'orange' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link'
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'icon'
  rounded?: 'default' | 'full' | 'lg' | 'xl' | '2xl'
}

export default function Button({
  href,
  external = false,
  showArrow = false,
  showExternalIcon = false,
  gradient = false,
  className,
  children,
  variant = 'default',
  size = 'default',
  rounded = 'default',
  ...props
}: ButtonProps) {
  const buttonContent = (
    <div className="inline-flex items-center gap-2">
      {children}
      {showArrow && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
      {showExternalIcon && <ExternalLink className="h-4 w-4" />}
    </div>
  )

  const buttonVariant = gradient ? 'gradient' : variant
  const buttonSize = size === 'xl' ? 'lg' : size

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(className)}
        >
          <UIButton
            variant={buttonVariant}
            size={buttonSize}
            rounded={rounded}
            className={cn(
              "group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl",
              className
            )}
            {...props}
          >
            {buttonContent}
          </UIButton>
        </a>
      )
    }

    return (
      <UIButton
        variant={buttonVariant}
        size={buttonSize}
        rounded={rounded}
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
      </UIButton>
    )
  }

  return (
    <UIButton
      variant={buttonVariant}
      size={buttonSize}
      rounded={rounded}
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl",
        className
      )}
      {...props}
    >
      {buttonContent}
    </UIButton>
  )
}

// Convenience components for common button types
export function CTAButton(props: Omit<ButtonProps, 'showArrow' | 'gradient'>) {
  return <Button {...props} showArrow={true} gradient={true} />
}

export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="default" />
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="outline" />
}

export function SupportButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="support" />
}
