'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { canUserCreateCarSimpleClient } from '@/lib/database/cars-client'
import { Profile } from '@/lib/types/database'
import { ThemeToggle } from '../theme/theme-toggle'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  LogOut,
  Plus,
  Crown,
  Settings,
  ChevronDown,
  AlertCircle,
  LayoutDashboard,
  CreditCard,
  BarChart3,
} from 'lucide-react'
import { BaseNavbar } from './base-navbar'

import type { NavItem } from '@/lib/types/navbar'

const navItems: NavItem[] = [
  { name: 'Browse Cars', href: '/browse' },
  { name: 'Map', href: '/map' },
]

interface MainNavbarProps {
  showCreateButton?: boolean
}

export const MainNavbar = ({ showCreateButton = false }: MainNavbarProps) => {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [canCreateCar, setCanCreateCar] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const [userProfile, canCreate] = await Promise.all([
            getProfileByUserIdClient(user.id),
            canUserCreateCarSimpleClient(user.id),
          ])
          setProfile(userProfile)
          setCanCreateCar(canCreate)
        } catch {}
      }
    }

    loadProfile()
  }, [user, showCreateButton])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
  }

  const handleOptionClick = (action: string) => {
    setIsDropdownOpen(false)

    switch (action) {
      case 'profile':
        router.push('/profile')
        break
      case 'create':
        router.push('/create')
        break
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'premium':
        router.push('/premium')
        break
      case 'payments':
        router.push('/payments')
        break
    }
  }

  const handleNavItemClick = (item: NavItem, e: React.MouseEvent) => {
    // Only redirect if auth has finished loading and user is not logged in
    // Otherwise, let the middleware handle authentication
    if (item.href === '/map' && !loading && !user) {
      e.preventDefault()
      router.push('/login')
      return
    }
  }

  const renderNavItem = (item: NavItem) => {
    if (item.href === '/map') {
      return (
        <Link
          href={item.href}
          onClick={e => handleNavItemClick(item, e)}
          className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium block md:inline-flex px-4 py-3 md:px-0 md:py-0 hover:bg-accent md:hover:bg-transparent rounded-lg md:rounded-none active:scale-[0.98]'
        >
          {item.name}
        </Link>
      )
    }
    return (
      <Link
        href={item.href}
        className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium block md:inline-flex px-4 py-3 md:px-0 md:py-0 hover:bg-accent md:hover:bg-transparent rounded-lg md:rounded-none active:scale-[0.98]'
      >
        {item.name}
      </Link>
    )
  }

  return (
    <BaseNavbar
      variant='solid'
      navItems={navItems}
      logoHref={user ? '/dashboard' : '/'}
      layout='right-aligned'
      renderNavItem={renderNavItem}
      rightNavContent={<ThemeToggle />}
    >
      <div className='flex items-center space-x-2'>
        {user ? (
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className='flex items-center space-x-2 text-foreground hover:text-foreground/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring rounded-md p-2 cursor-pointer'
            >
              <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username || user.email || 'User'}
                    className='w-8 h-8 rounded-full object-cover'
                  />
                ) : (
                  <User className='w-4 h-4 text-primary-foreground' />
                )}
              </div>
              <span className='hidden md:flex text-sm md:text-base font-medium font-atkinson items-center gap-2'>
                {profile?.is_premium && (
                  <Crown className='w-4 h-4 text-yellow-500' />
                )}
                {profile?.username || user.email}
              </span>
              <ChevronDown className='w-4 h-4' />
            </button>

            {isDropdownOpen && (
              <div className='absolute right-0 mt-2 w-56 bg-popover rounded-md shadow-lg ring-1 ring-border z-50'>
                <div className='py-1'>
                  <div className='px-4 py-2 border-b border-border'>
                    <p className='text-sm font-medium text-popover-foreground flex items-center gap-2'>
                      {profile?.full_name || profile?.username || user.email}
                      {profile?.is_premium && (
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-amber-500 text-white'>
                          <Crown className='w-3 h-3 mr-1' />
                          PREMIUM
                        </span>
                      )}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOptionClick('dashboard')}
                    className='flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer'
                  >
                    <LayoutDashboard className='w-4 h-4 mr-3' />
                    Dashboard
                  </button>

                  {profile?.is_premium && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        router.push('/analytics')
                      }}
                      className='flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer'
                    >
                      <BarChart3 className='w-4 h-4 mr-3' />
                      Analytics
                    </button>
                  )}

                  <button
                    onClick={() => handleOptionClick('profile')}
                    className='flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer'
                  >
                    <Settings className='w-4 h-4 mr-3' />
                    Edit Profile
                  </button>

                  {canCreateCar ? (
                    <button
                      onClick={() => handleOptionClick('create')}
                      className='flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer'
                    >
                      <Plus className='w-4 h-4 mr-3' />
                      Add New Car
                    </button>
                  ) : (
                    <div className='space-y-1'>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          router.push('/buy-car-slot')
                        }}
                        className='flex items-center w-full px-4 py-2 text-sm text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 dark:hover:bg-orange-900 cursor-pointer'
                      >
                        <AlertCircle className='w-4 h-4 mr-3' />
                        Car Limit Reached
                      </button>
                    </div>
                  )}

                  <div className='border-t border-border my-1'></div>

                  {!profile?.is_premium && (
                    <button
                      onClick={() => handleOptionClick('premium')}
                      className='flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer'
                    >
                      <Crown className='w-4 h-4 mr-3 text-yellow-500' />
                      Buy Premium
                    </button>
                  )}

                  <button
                    onClick={() => handleOptionClick('payments')}
                    className='flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer'
                  >
                    <CreditCard className='w-4 h-4 mr-3' />
                    Payment History
                  </button>

                  <div className='border-t border-border my-1'></div>

                  <button
                    onClick={handleSignOut}
                    className='flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 cursor-pointer'
                  >
                    <LogOut className='w-4 h-4 mr-3' />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className='flex items-center gap-2 md:gap-4'>
            <Link
              href='/login'
              className='text-muted-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-1.5 md:px-0 md:py-0 rounded-lg md:rounded-none hover:bg-accent md:hover:bg-transparent active:scale-[0.98] whitespace-nowrap text-sm md:text-base'
            >
              Sign In
            </Link>
            <Link
              href='/register'
              className='bg-primary text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm md:text-base font-medium hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0'
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </BaseNavbar>
  )
}
