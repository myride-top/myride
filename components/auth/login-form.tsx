'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const { signIn } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    const { error } = await signIn(email, password)

    if (error) {
      toast.error(error.message || 'Failed to sign in. Please check your credentials.')
      setLoading(false)
    } else {
      toast.success('Signed in successfully!')
      router.push('/dashboard')
    }
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-5' noValidate>
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
              }}
              required
              autoComplete='current-password'
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={cn(
                'transition-all',
                errors.password && 'border-destructive focus-visible:ring-destructive/20'
              )}
              placeholder='Enter your password'
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

        <Button
          type='submit'
          disabled={loading}
          className='w-full'
          loading={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
