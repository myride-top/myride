import React from 'react'
import { cn } from '@/lib/utils'
import Container from './container'

interface SectionProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  background?: 'default' | 'muted' | 'card' | 'gradient'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  id?: string
}

export default function Section({
  children,
  className = '',
  containerClassName = '',
  background = 'default',
  padding = 'lg',
  id,
}: SectionProps) {
  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    card: 'bg-card',
    gradient: 'bg-gradient-to-br from-background via-background to-muted/20',
  }

  const paddingClasses = {
    sm: 'py-8',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24',
  }

  return (
    <section
      id={id}
      className={cn(
        backgroundClasses[background],
        paddingClasses[padding],
        className
      )}
    >
      <Container className={containerClassName}>
        {children}
      </Container>
    </section>
  )
}
