'use client'

import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BaseNavbar, { NavItem } from './base-navbar'

const navItems: NavItem[] = [
  { name: 'Features', href: '/#features' },
  { name: 'Community', href: '/#community' },
  { name: 'Reviews', href: '/#reviews' },
  { name: 'Browse Cars', href: '/browse' },
]

// Custom component to handle anchor links properly
function AnchorLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (onClick) {
      onClick()
    }

    // If it's an anchor link (starts with /#)
    if (href.startsWith('/#')) {
      const targetId = href.substring(2) // Remove /#

      // If we're already on the homepage, just scroll to the section
      if (window.location.pathname === '/') {
        const element = document.getElementById(targetId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        // Navigate to homepage and then scroll to section
        router.push('/')

        // Use a more robust approach to wait for navigation
        const checkAndScroll = () => {
          const element = document.getElementById(targetId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          } else {
            // If element not found yet, try again after a short delay
            setTimeout(checkAndScroll, 50)
          }
        }

        // Start checking after navigation
        setTimeout(checkAndScroll, 200)
      }
    } else {
      // Regular link, just navigate
      router.push(href)
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <BaseNavbar
        variant='transparent'
        navItems={navItems}
        className='animate-in slide-in-from-top duration-500'
        renderNavItem={item => (
          <AnchorLink
            href={item.href}
            className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
          >
            {item.name}
          </AnchorLink>
        )}
      >
        {/* CTA Buttons */}
        <div className='hidden md:flex items-center gap-4'>
          <Link
            href='/login'
            className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
          >
            Sign In
          </Link>
          <Link
            href='/register'
            className='px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors duration-300'
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='md:hidden p-2 rounded-lg hover:bg-muted transition-colors'
        >
          {isMenuOpen ? (
            <X className='h-6 w-6 text-foreground' />
          ) : (
            <Menu className='h-6 w-6 text-foreground' />
          )}
        </button>
      </BaseNavbar>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4'>
          <div className='py-4 space-y-4'>
            {navItems.map(item => (
              <AnchorLink
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className='block text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
              >
                {item.name}
              </AnchorLink>
            ))}
            <div className='pt-4 space-y-3 border-t border-border/50'>
              <Link
                href='/login'
                onClick={() => setIsMenuOpen(false)}
                className='block text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
              >
                Sign In
              </Link>
              <Link
                href='/register'
                onClick={() => setIsMenuOpen(false)}
                className='block px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors duration-300 text-center'
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
