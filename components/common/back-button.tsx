import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  href?: string
  onClick?: () => void
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'lg' | 'xl' | 'icon' | 'default'
  showText?: boolean
  children?: React.ReactNode
}

export default function BackButton({
  href,
  onClick,
  className = '',
  variant = 'ghost',
  size = 'default',
  showText = true,
  children,
}: BackButtonProps) {
  const buttonContent = (
    <div className='inline-flex items-center gap-2'>
      <ArrowLeft className='h-4 w-4' />
      {showText && (children || 'Back')}
    </div>
  )

  if (href) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('inline-flex items-center gap-2', className)}
        asChild
      >
        <a href={href}>{buttonContent}</a>
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('inline-flex items-center gap-2 cursor-pointer', className)}
      onClick={onClick}
    >
      {buttonContent}
    </Button>
  )
}
