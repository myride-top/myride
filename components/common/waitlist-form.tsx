'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { addToWaitlist } from '@/lib/database/waitlist-client'
import { CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { LegalModal } from './legal-modal'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setStatus('idle')

    const result = await addToWaitlist(email)

    if (result.success) {
      setStatus('success')
      setMessage("We'll notify you when we launch.")
      setEmail('')
    } else {
      setStatus('error')
      setMessage(result.error || 'Something went wrong. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <div className='max-w-md mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-3'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Mail className='h-5 w-5 text-muted-foreground' />
          </div>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='Enter your email address'
            className='w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 text-foreground placeholder:text-muted-foreground/60 border-primary'
            disabled={isSubmitting}
          />
        </div>

        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
        </Button>
      </form>

      {/* Legal Notice */}
      <LegalModal />

      {/* Status Messages */}
      {status === 'success' && (
        <div className='mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2'>
          <CheckCircle className='h-4 w-4 text-green-600' />
          <p className='text-green-800 text-sm'>{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2'>
          <AlertCircle className='h-4 w-4 text-red-600' />
          <p className='text-red-800 text-sm'>{message}</p>
        </div>
      )}
    </div>
  )
}
