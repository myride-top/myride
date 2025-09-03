import React from 'react'
import { CTAButton as UnifiedCTAButton } from './button'

interface CTAButtonProps {
  href?: string
  external?: boolean
  showArrow?: boolean
  gradient?: boolean
  className?: string
  children: React.ReactNode
  [key: string]: any // Allow other props to pass through
}

export default function CTAButton(props: CTAButtonProps) {
  return <UnifiedCTAButton {...props} />
}
