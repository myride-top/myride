'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Car, Menu, X } from 'lucide-react'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
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
              className='flex items-center hover:scale-105 transition-transform'
            >
              <img
                src='/logo.svg'
                alt='MyRide'
                className='h-8 w-auto'
              />
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

            {/* Mobile menu button */}
            {navItems.length > 0 && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='md:hidden p-2 text-muted-foreground hover:text-primary transition-colors'
                aria-label='Toggle mobile menu'
              >
                {isMobileMenuOpen ? (
                  <X className='h-6 w-6' />
                ) : (
                  <Menu className='h-6 w-6' />
                )}
              </button>
            )}

            {children}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && navItems.length > 0 && (
          <div
            ref={mobileMenuRef}
            className='md:hidden border-t border-border bg-card'
          >
            <div className='px-4 py-2 space-y-1'>
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
                    className='block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors duration-300 font-medium'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
