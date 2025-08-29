'use client'

import React from 'react'
import { Car } from 'lucide-react'
import Link from 'next/link'

export interface NavItem {
  name: string
  href: string
  external?: boolean
}

export interface BaseNavbarProps {
  variant?: 'solid' | 'transparent' | 'minimal'
  navItems?: NavItem[]
  showLogo?: boolean
  logoHref?: string
  children?: React.ReactNode
  className?: string
  renderNavItem?: (item: NavItem) => React.ReactNode
  layout?: 'centered' | 'left-aligned' | 'right-aligned'
}

export default function BaseNavbar({
  variant = 'solid',
  navItems = [],
  showLogo = true,
  logoHref = '/',
  children,
  className = '',
  renderNavItem,
  layout = 'centered',
}: BaseNavbarProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'transparent':
        return 'bg-background/80 backdrop-blur-md border-b border-border/50'
      case 'minimal':
        return 'bg-card/50 backdrop-blur-sm border-b border-border/30'
      case 'solid':
      default:
        return 'bg-card shadow-sm border-b border-border'
    }
  }

  const getHeightStyles = () => {
    switch (variant) {
      case 'transparent':
      case 'minimal':
        return 'h-16'
      case 'solid':
      default:
        return 'py-4'
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${getVariantStyles()} ${className}`}
    >
      <div className='max-w-7xl mx-auto px-4'>
        <div
          className={`flex items-center justify-between ${getHeightStyles()}`}
        >
          {/* Logo */}
          {showLogo && (
            <Link
              href={logoHref}
              className='flex items-center gap-2 hover:scale-105 transition-transform'
            >
              <Car className='h-8 w-8 text-primary' />
              <span className='text-xl md:text-2xl font-black text-primary'>
                MyRide
              </span>
            </Link>
          )}

          {/* Desktop Navigation */}
          {navItems.length > 0 && layout === 'centered' && (
            <div className='hidden md:flex items-center gap-8'>
              {navItems.map(item =>
                renderNavItem ? (
                  <React.Fragment key={item.name}>
                    {renderNavItem(item)}
                  </React.Fragment>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          )}

          {/* Right side content (auth, theme toggle, etc.) */}
          <div className='flex items-center space-x-4'>
            {/* Navigation items for right-aligned layout */}
            {navItems.length > 0 && layout === 'right-aligned' && (
              <div className='hidden md:flex items-center gap-8'>
                {navItems.map(item =>
                  renderNavItem ? (
                    <React.Fragment key={item.name}>
                      {renderNavItem(item)}
                    </React.Fragment>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </nav>
  )
}
