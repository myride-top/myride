import React from 'react'
import { CTAButton as UnifiedCTAButton } from './button'

interface CTAButtonProps {
  href?: string
  external?: boolean
  showArrow?: boolean
  gradient?: boolean
  className?: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function CTAButton(props: CTAButtonProps) {
  return <UnifiedCTAButton {...props} />
}
