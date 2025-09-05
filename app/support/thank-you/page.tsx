import { Metadata } from 'next'
import Link from 'next/link'
import { Heart, CheckCircle, ArrowLeft, Home, Car } from 'lucide-react'
import MinimalFooter from '@/components/common/minimal-footer'

export const metadata: Metadata = {
  title: 'Thank You for Your Support',
  description:
    'Thank you for supporting MyRide development and helping keep the automotive showcase platform free for car enthusiasts worldwide.',
  keywords:
    'thank you, support, donation, car enthusiasts, automotive community, free platform',
  openGraph: {
    title: 'MyRide - Thank You for Your Support',
    description:
      'Thank you for supporting MyRide development and helping keep the automotive showcase platform free for car enthusiasts worldwide.',
    type: 'website',
    url: 'https://myride.top/support/thank-you',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'Thank You for Supporting MyRide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRide - Thank You for Your Support',
    description:
      'Thank you for supporting MyRide development and helping keep the automotive showcase platform free for car enthusiasts worldwide.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ThankYouPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='flex flex-col min-h-screen'>
        <div className='flex-1 flex items-center justify-center px-4 py-8'>
          <div className='max-w-md mx-auto text-center w-full'>
            <div className='mb-8'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6'>
                <CheckCircle className='h-10 w-10 text-white' />
              </div>
              <h1 className='text-3xl font-bold text-foreground mb-4'>
                Thank You!
              </h1>
              <p className='text-lg text-muted-foreground mb-6'>
                Your support means the world to us. You&apos;re helping keep
                MyRide free for car enthusiasts everywhere.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6 mb-8'>
              <div className='flex items-center justify-center gap-2 mb-4'>
                <Heart className='h-5 w-5 text-pink-500' />
                <span className='font-semibold text-foreground'>
                  What happens next?
                </span>
              </div>
              <ul className='text-sm text-muted-foreground space-y-2 text-left'>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  You&apos;ll receive a confirmation email from Stripe
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  Your support helps fund new features and improvements
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  We&apos;ll continue working hard to make MyRide even better
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  Keep enjoying the platform - it&apos;s free for everyone!
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <Link
                href='/dashboard'
                className='w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2'
              >
                <Home className='h-4 w-4' />
                Go to Dashboard
              </Link>

              <Link
                href='/browse'
                className='w-full bg-card border border-border hover:bg-muted text-foreground font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2'
              >
                <Car className='h-4 w-4' />
                Browse Cars
              </Link>

              <Link
                href='/'
                className='w-full text-muted-foreground hover:text-foreground font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Back to Home
              </Link>
            </div>

            <div className='mt-8 pt-6 border-t border-border'>
              <p className='text-sm text-muted-foreground'>
                Have questions? Contact us at{' '}
                <a
                  href='mailto:support@myride.top'
                  className='text-primary hover:underline'
                >
                  support@myride.top
                </a>
              </p>
            </div>
          </div>
        </div>

        <MinimalFooter />
      </div>
    </div>
  )
}
