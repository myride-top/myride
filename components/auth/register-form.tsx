'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUsernameClient } from '@/lib/database/profiles-client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const RegisterForm = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<{
    email?: string
    username?: string
    password?: string
    confirmPassword?: string
  }>({})
  const { signUp } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!username) {
      newErrors.username = 'Username is required'
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkUsername = async (value: string) => {
    if (value.length < 3) {
      setUsernameAvailable(null)
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameAvailable(false)
      return
    }

    setCheckingUsername(true)
    try {
      const existingProfile = await getProfileByUsernameClient(value)
      setUsernameAvailable(!existingProfile)
    } catch {
      setUsernameAvailable(null)
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (usernameAvailable === false) {
      toast.error('Username is already taken. Please choose a different username.')
      return
    }

    setLoading(true)
    setErrors({})

    // Double-check username availability
    const existingProfile = await getProfileByUsernameClient(username)
    if (existingProfile) {
      toast.error('Username is already taken. Please choose a different username.')
      setErrors(prev => ({ ...prev, username: 'Username is already taken' }))
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password, username)

    if (error) {
      toast.error(error.message || 'Failed to create account. Please try again.')
      setLoading(false)
    } else {
      toast.success('Account created successfully!')
      router.push('/dashboard')
    }
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-5' noValidate>
        <div className='space-y-2'>
          <Label htmlFor='username' className='text-foreground'>
            Username
          </Label>
          <div className='space-y-1'>
            <div className='relative'>
              <Input
                id='username'
                type='text'
                value={username}
                onChange={e => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                  setUsername(value)
                  if (errors.username) {
                    setErrors(prev => ({ ...prev, username: undefined }))
                  }
                  checkUsername(value)
                }}
                required
                minLength={3}
                autoComplete='username'
                aria-invalid={!!errors.username || usernameAvailable === false}
                aria-describedby={
                  errors.username || usernameAvailable !== null
                    ? 'username-error'
                    : undefined
                }
                className={cn(
                  'transition-all pr-8',
                  errors.username || usernameAvailable === false
                    ? 'border-destructive focus-visible:ring-destructive/20'
                    : usernameAvailable === true
                    ? 'border-green-500 focus-visible:ring-green-500/20'
                    : ''
                )}
                placeholder='Choose a unique username'
              />
              {checkingUsername && (
                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                  <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                </div>
              )}
              {!checkingUsername && usernameAvailable === true && username.length >= 3 && (
                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                  <CheckCircle2 className='h-4 w-4 text-green-500' aria-hidden='true' />
                </div>
              )}
            </div>
            {(errors.username || usernameAvailable === false) && (
              <div
                id='username-error'
                className='flex items-center gap-1.5 text-sm text-destructive'
                role='alert'
              >
                <AlertCircle className='h-3.5 w-3.5' aria-hidden='true' />
                <span>
                  {errors.username ||
                    'Username is already taken. Please choose another.'}
                </span>
              </div>
            )}
            {usernameAvailable === true && !errors.username && (
              <div className='flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400'>
                <CheckCircle2 className='h-3.5 w-3.5' aria-hidden='true' />
                <span>Username is available</span>
              </div>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email' className='text-foreground'>
            Email
          </Label>
          <div className='space-y-1'>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }))
                }
              }}
              required
              autoComplete='email'
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={cn(
                'transition-all',
                errors.email && 'border-destructive focus-visible:ring-destructive/20'
              )}
              placeholder='you@example.com'
            />
            {errors.email && (
              <div
                id='email-error'
                className='flex items-center gap-1.5 text-sm text-destructive'
                role='alert'
              >
                <AlertCircle className='h-3.5 w-3.5' aria-hidden='true' />
                <span>{errors.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password' className='text-foreground'>
            Password
          </Label>
          <div className='space-y-1'>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }))
                }
                if (errors.confirmPassword && confirmPassword) {
                  setErrors(prev => ({
                    ...prev,
                    confirmPassword:
                      e.target.value !== confirmPassword
                        ? 'Passwords do not match'
                        : undefined,
                  }))
                }
              }}
              required
              minLength={6}
              autoComplete='new-password'
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={cn(
                'transition-all',
                errors.password && 'border-destructive focus-visible:ring-destructive/20'
              )}
              placeholder='At least 6 characters'
            />
            {errors.password && (
              <div
                id='password-error'
                className='flex items-center gap-1.5 text-sm text-destructive'
                role='alert'
              >
                <AlertCircle className='h-3.5 w-3.5' aria-hidden='true' />
                <span>{errors.password}</span>
              </div>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='confirmPassword' className='text-foreground'>
            Confirm Password
          </Label>
          <div className='space-y-1'>
            <Input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors(prev => ({
                    ...prev,
                    confirmPassword:
                      e.target.value !== password
                        ? 'Passwords do not match'
                        : undefined,
                  }))
                }
              }}
              required
              minLength={6}
              autoComplete='new-password'
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? 'confirm-password-error' : undefined
              }
              className={cn(
                'transition-all',
                errors.confirmPassword &&
                  'border-destructive focus-visible:ring-destructive/20'
              )}
              placeholder='Confirm your password'
            />
            {errors.confirmPassword && (
              <div
                id='confirm-password-error'
                className='flex items-center gap-1.5 text-sm text-destructive'
                role='alert'
              >
                <AlertCircle className='h-3.5 w-3.5' aria-hidden='true' />
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>
        </div>

        <Button
          type='submit'
          disabled={loading || checkingUsername || usernameAvailable === false}
          className='w-full'
          loading={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  )
}
