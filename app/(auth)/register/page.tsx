import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Create your MyRide account to start showcasing your cars and join the automotive community.',
  openGraph: {
    title: 'MyRide - Create Account',
    description:
      'Create your MyRide account to start showcasing your cars and join the automotive community.',
  },
  twitter: {
    title: 'MyRide - Create Account',
    description:
      'Create your MyRide account to start showcasing your cars and join the automotive community.',
  },
}

export default function RegisterPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-foreground'>
            Create your account
          </h2>
          <p className='mt-2 text-center text-sm text-muted-foreground'>
            Or{' '}
            <Link
              href='/login'
              className='font-medium text-primary hover:text-primary/80 cursor-pointer'
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
