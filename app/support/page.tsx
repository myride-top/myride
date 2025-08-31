import { Metadata } from 'next'
import { Heart, Users, Code, Server, Zap } from 'lucide-react'
import SupportCreator from '@/components/common/support-creator'
import { MainNavbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Support Creator',
  description:
    'Support MyRide development and help keep the platform free for car enthusiasts worldwide. Contribute to the automotive community showcase platform.',
  keywords:
    'support, donate, car enthusiasts, automotive community, free platform, car showcase',
  openGraph: {
    title: 'MyRide - Support Creator',
    description:
      'Support MyRide development and help keep the platform free for car enthusiasts worldwide. Contribute to the automotive community showcase platform.',
    type: 'website',
    url: 'https://myride.top/support',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'Support MyRide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRide - Support Creator',
    description:
      'Support MyRide development and help keep the platform free for car enthusiasts worldwide. Contribute to the automotive community showcase platform.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SupportPage() {
  return (
    <div className='min-h-screen bg-background'>
      <MainNavbar showCreateButton={true} />

      {/* Simple Header */}
      <div className='bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-b border-border/50 pt-24'>
        <div className='max-w-3xl mx-auto px-4 py-12'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl mb-4'>
              <Heart className='h-6 w-6 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-foreground mb-3'>
              Support MyRide
            </h1>
            <p className='text-muted-foreground'>
              Help keep the platform free for car enthusiasts
            </p>
          </div>
        </div>
      </div>

      <div className='max-w-3xl mx-auto px-4 py-12'>
        {/* Main Support Form */}
        <div className='bg-card border border-border rounded-xl p-8 mb-8 shadow-sm'>
          <h2 className='text-xl font-semibold text-foreground mb-6 text-center'>
            Make a Contribution
          </h2>
          <SupportCreator />
        </div>

        {/* Simple Info Grid */}
        <div className='mb-8'>
          <h2 className='text-xl font-semibold text-foreground mb-6 text-center'>
            What Your Support Helps With
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-card border border-border rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                  <Code className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <h3 className='font-medium text-foreground'>Development</h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Fund new features and platform improvements
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg'>
                  <Server className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <h3 className='font-medium text-foreground'>Infrastructure</h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Keep servers running and platform stable
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
                  <Zap className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <h3 className='font-medium text-foreground'>Performance</h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Maintain fast loading and smooth experience
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg'>
                  <Users className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                </div>
                <h3 className='font-medium text-foreground'>Community</h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Grow the car enthusiast platform
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className='mb-8'>
          <h2 className='text-xl font-semibold text-foreground mb-6 text-center'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                Is MyRide free to use?
              </h3>
              <p className='text-sm text-muted-foreground'>
                Yes! MyRide has a generous free tier with core features
                available to everyone. Your support helps fund development and
                future improvements.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                How much should I contribute?
              </h3>
              <p className='text-sm text-muted-foreground'>
                Any amount helps, choose what feels right for you.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                Is my payment secure?
              </h3>
              <p className='text-sm text-muted-foreground'>
                Yes! We use Stripe for secure payments.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-medium text-foreground mb-2'>
                Will I get any special benefits?
              </h3>
              <p className='text-sm text-muted-foreground'>
                Yes! Supporters get a visible badge on their car detail pages,
                plus our gratitude for helping fund platform development. We may
                introduce more supporter perks in the future.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className='text-center mt-8 pt-6 border-t border-border'>
          <p className='text-xs text-muted-foreground'>
            MyRide remains free for everyone. Your support helps us grow.
          </p>
        </div>
      </div>
    </div>
  )
}
