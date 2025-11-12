import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In',
  description:
    'Sign in to your MyRide account to manage your cars and connect with the automotive community.',
  openGraph: {
    title: 'MyRide - Sign In',
    description:
      'Sign in to your MyRide account to manage your cars and connect with the automotive community.',
  },
  twitter: {
    title: 'MyRide - Sign In',
    description:
      'Sign in to your MyRide account to manage your cars and connect with the automotive community.',
  },
}

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 pt-24'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-foreground'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-center text-sm text-muted-foreground'>
            Or{' '}
            <Link
              href='/register'
              className='font-medium text-primary hover:text-primary/80 cursor-pointer'
            >
              create a new account
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
