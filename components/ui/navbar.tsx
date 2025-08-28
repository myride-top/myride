'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { canUserCreateCarClient } from '@/lib/database/cars-client'
import { Profile } from '@/lib/types/database'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User,
  LogOut,
  Plus,
  Crown,
  Heart,
  Settings,
  ChevronDown,
  Car,
  AlertCircle,
} from 'lucide-react'

interface NavbarProps {
  showCreateButton?: boolean
}

export default function Navbar({ showCreateButton = false }: NavbarProps) {
  const { user, signOut } = useAuth()
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
            canUserCreateCarClient(user.id),
          ])
          setProfile(userProfile)
          setCanCreateCar(canCreate)
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      }
    }

    loadProfile()
  }, [user])

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
        // TODO: Implement premium purchase
        console.log('Premium purchase not implemented yet')
        break
      case 'support':
        // TODO: Implement support creator
        console.log('Support creator not implemented yet')
        break
    }
  }

  return (
    <header className='bg-card shadow-sm border-b border-border fixed top-0 left-0 right-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          <div className='flex items-center'>
            <Link
              href={user ? '/dashboard' : '/'}
              className='flex items-center cursor-pointer'
            >
              <Car className='w-8 h-8 text-primary mr-2' />
              <h1 className='text-3xl font-bold text-foreground'>MyRide</h1>
            </Link>
          </div>

          <div className='flex items-center space-x-4'>
            {showCreateButton &&
              user &&
              (canCreateCar ? (
                <Link
                  href='/create'
                  className='md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring hidden'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add New Car
                </Link>
              ) : (
                <div className='md:inline-flex hidden items-center px-4 py-2 border border-orange-200 dark:border-orange-800 text-sm font-medium rounded-md shadow-sm text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950 cursor-not-allowed'>
                  <AlertCircle className='w-4 h-4 mr-2' />
                  Car Limit Reached
                </div>
              ))}

            {user ? (
              <div className='flex items-center space-x-2'>
                <ThemeToggle />
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
                    <span className='hidden md:block text-sm font-medium'>
                      {profile?.username || user.email}
                    </span>
                    <ChevronDown className='w-4 h-4' />
                  </button>

                  {isDropdownOpen && (
                    <div className='absolute right-0 mt-2 w-56 bg-popover rounded-md shadow-lg ring-1 ring-border z-50'>
                      <div className='py-1'>
                        <div className='px-4 py-2 border-b border-border'>
                          <p className='text-sm font-medium text-popover-foreground'>
                            {profile?.full_name ||
                              profile?.username ||
                              user.email}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {user.email}
                          </p>
                        </div>

                        <button
                          onClick={() => handleOptionClick('dashboard')}
                          className='flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer'
                        >
                          <Car className='w-4 h-4 mr-3' />
                          Dashboard
                        </button>

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
                          <div className='flex items-center w-full px-4 py-2 text-sm text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-950'>
                            <AlertCircle className='w-4 h-4 mr-3' />
                            Car Limit Reached
                          </div>
                        )}

                        <div className='border-t border-border my-1'></div>

                        <button
                          onClick={() => handleOptionClick('premium')}
                          className='flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer'
                        >
                          <Crown className='w-4 h-4 mr-3 text-yellow-500' />
                          Buy Premium
                        </button>

                        <button
                          onClick={() => handleOptionClick('support')}
                          className='flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent cursor-pointer'
                        >
                          <Heart className='w-4 h-4 mr-3 text-red-500' />
                          Support Creator
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
              </div>
            ) : (
              <div className='flex items-center space-x-4'>
                <Link
                  href='/login'
                  className='text-foreground hover:text-foreground/80 px-3 py-2 rounded-md text-sm font-medium cursor-pointer'
                >
                  Sign In
                </Link>
                <Link
                  href='/register'
                  className='bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 cursor-pointer'
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
