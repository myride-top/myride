'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import type { NavItem } from '@/lib/types/navbar'

export interface BaseNavbarProps {
  variant?: 'solid' | 'transparent' | 'minimal'
  navItems?: NavItem[]
  showLogo?: boolean
  logoHref?: string
  children?: React.ReactNode
  className?: string
  renderNavItem?: (item: NavItem) => React.ReactNode
  layout?: 'centered' | 'left-aligned' | 'right-aligned'
  rightNavContent?: React.ReactNode
}

export const BaseNavbar = ({
  variant = 'solid',
  navItems = [],
  showLogo = true,
  logoHref = '/',
  children,
  className = '',
  renderNavItem,
  layout = 'centered',
  rightNavContent,
}: BaseNavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const isMobileMenuOpenRef = useRef(isMobileMenuOpen)

  // Keep ref in sync with state
  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen
  }, [isMobileMenuOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        isMobileMenuOpenRef.current
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpenRef.current) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
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
        return 'py-3'
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${getVariantStyles()} ${className}`}
    >
      <div className='max-w-7xl mx-auto px-3 md:px-4'>
        <div
          className={`flex items-center justify-between gap-2 ${getHeightStyles()}`}
        >
          {/* Logo */}
          {showLogo && (
            <Link
              href={logoHref}
              className='flex items-center hover:scale-105 transition-transform flex-shrink-0'
            >
              <img src='/logo.svg' alt='MyRide' className='h-7 md:h-8 w-auto' />
            </Link>
          )}

          {/* Desktop Navigation */}
          {navItems.length > 0 && layout === 'centered' && (
            <div className='hidden md:flex items-center gap-4'>
              {navItems.map(item =>
                renderNavItem ? (
                  <Fragment key={item.name}>{renderNavItem(item)}</Fragment>
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
          <div className='flex items-center gap-2 md:gap-4 flex-shrink-0'>
            {/* Desktop: Theme toggle */}
            {rightNavContent && (
              <div className='hidden md:flex items-center'>
                {rightNavContent}
              </div>
            )}

            {/* Desktop: Navigation items for right-aligned layout */}
            {navItems.length > 0 && layout === 'right-aligned' && (
              <div className='hidden md:flex items-center gap-4'>
                {navItems.map(item =>
                  renderNavItem ? (
                    <Fragment key={item.name}>{renderNavItem(item)}</Fragment>
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

            {/* Mobile: Theme toggle and menu button */}
            <div className='md:hidden flex items-center gap-2'>
              {rightNavContent}
              {navItems.length > 0 && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className='p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-accent active:scale-95 flex-shrink-0'
                  aria-label='Toggle mobile menu'
                >
                  {isMobileMenuOpen ? (
                    <X className='h-5 w-5' />
                  ) : (
                    <Menu className='h-5 w-5' />
                  )}
                </button>
              )}
            </div>

            {children}
          </div>
        </div>

        {/* Mobile Navigation Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className='fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden'
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Navigation Menu */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden fixed top-0 left-0 h-full w-64 max-w-[85vw] bg-card border-r border-border shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen && navItems.length > 0
              ? 'translate-x-0'
              : '-translate-x-full'
          }`}
        >
          <div className='flex flex-col h-full'>
            {/* Mobile Menu Header */}
            <div className='flex items-center justify-between p-4 border-b border-border'>
              <Link
                href={logoHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className='flex items-center'
              >
                <img src='/logo.svg' alt='MyRide' className='h-7 w-auto' />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className='p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md'
                aria-label='Close menu'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Mobile Menu Items */}
            {navItems.length > 0 && (
              <div className='flex-1 overflow-y-auto px-3 py-4 space-y-1'>
                {navItems.map(item =>
                  renderNavItem ? (
                    <div
                      key={item.name}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {renderNavItem(item)}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className='flex items-center px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-lg transition-all duration-200 active:scale-[0.98]'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
