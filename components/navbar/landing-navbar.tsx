'use client'

import React from 'react'
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
  return (
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
    </BaseNavbar>
  )
}
