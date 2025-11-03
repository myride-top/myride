'use client'

import Link from 'next/link'
import { BaseNavbar } from './base-navbar'
import type { NavItem } from '@/lib/types/navbar'

const navItems: NavItem[] = [
  { name: 'Features', href: '/#features' },
  { name: 'Browse Cars', href: '/browse' },
]

export const LandingNavbar = () => {
  return (
    <BaseNavbar
      variant='transparent'
      navItems={navItems}
      className='animate-in slide-in-from-top duration-500'
      renderNavItem={item => (
        <Link
          href={item.href}
          className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium'
        >
          {item.name}
        </Link>
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
