'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'

interface SupportButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

export default function SupportButton({
  variant = 'default',
  size = 'md',
  className = '',
  children,
}: SupportButtonProps) {
  const baseClasses =
    'inline-flex items-center gap-2 font-medium transition-all duration-200'

  const variantClasses = {
    default:
      'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    outline:
      'border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white',
    ghost: 'text-pink-500 hover:bg-pink-500/10 hover:text-pink-600',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  }

  return (
    <Link
      href='/support'
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <Heart
        className={`${
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
        }`}
      />
      {children || 'Support MyRide'}
    </Link>
  )
}
