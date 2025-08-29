import { Metadata } from 'next'
import { Heart, Users, Code, Server, Zap } from 'lucide-react'
import SupportCreator from '@/components/common/support-creator'

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

const features = [
  {
    icon: Code,
    title: 'New Features',
    description:
      'Your support helps fund new features and improvements to the platform.',
  },
  {
    icon: Server,
    title: 'Server Costs',
    description: 'Help cover hosting, storage, and infrastructure costs.',
  },
  {
    icon: Zap,
    title: 'Fast Performance',
    description: 'Keep the platform running smoothly and quickly for everyone.',
  },
  {
    icon: Users,
    title: 'Community Growth',
    description: 'Support the growth of the car enthusiast community.',
  },
]

export default function SupportPage() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 border-b border-border/50'>
        <div className='max-w-7xl mx-auto px-4 py-16'>
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-6'>
              <Heart className='h-10 w-10 text-white' />
            </div>
            <h1 className='text-4xl font-bold text-foreground mb-4'>
              Support MyRide
            </h1>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              Support the development and growth of the ultimate car enthusiast
              platform
            </p>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Support Creator Component */}
          <div>
            <SupportCreator />
          </div>

          {/* Information Section */}
          <div className='space-y-8'>
            {/* What Your Support Helps With */}
            <div>
              <h2 className='text-2xl font-bold text-foreground mb-6'>
                What Your Support Helps With
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className='bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='p-2 bg-primary/10 rounded-lg'>
                        <feature.icon className='h-5 w-5 text-primary' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-foreground mb-1'>
                          {feature.title}
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className='mt-16'>
          <h2 className='text-2xl font-bold text-foreground text-center mb-8'>
            Frequently Asked Questions
          </h2>
          <div className='max-w-3xl mx-auto space-y-6'>
            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-semibold text-foreground mb-2'>
                Is MyRide free to use?
              </h3>
              <p className='text-muted-foreground'>
                MyRide has a generous free tier with core features available to
                everyone. Your support helps fund development and may enable
                additional premium features in the future.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-semibold text-foreground mb-2'>
                How much should I contribute?
              </h3>
              <p className='text-muted-foreground'>
                Any amount is appreciated! We suggest $5-$25, but you can choose
                any amount that feels right for you.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-semibold text-foreground mb-2'>
                Is my payment secure?
              </h3>
              <p className='text-muted-foreground'>
                Absolutely! We use Stripe for all payments, which is the
                industry standard for secure online payments.
              </p>
            </div>

            <div className='bg-card border border-border rounded-lg p-6'>
              <h3 className='font-semibold text-foreground mb-2'>
                Will I get any special benefits?
              </h3>
              <p className='text-muted-foreground'>
                Currently, supporters receive our heartfelt gratitude and help
                fund platform development. We may introduce supporter perks in
                the future as the platform grows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
