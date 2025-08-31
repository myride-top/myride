import { createPageMetadata } from '@/components/common/metadata'
import { WaitlistForm } from '@/components/common/waitlist-form'
import SocialLinks from '@/components/common/social-links'
import { SocialLink } from '@/components/common/social-links'

export const metadata = createPageMetadata(
  'Coming Soon',
  'The ultimate platform for car enthusiasts is coming soon. Join the waitlist to be the first to know when we launch.',
  'car showcase, vehicle gallery, car enthusiasts, automotive community, coming soon'
)

const socialLinks: SocialLink[] = [
  {
    platform: 'instagram',
    url: 'https://instagram.com/myride.top',
    label: 'Instagram',
  },
  {
    platform: 'twitter',
    url: 'https://x.com/myride_top',
    label: 'Twitter',
  },
  {
    platform: 'tiktok',
    url: 'https://tiktok.com/@myride.top',
    label: 'TikTok',
  },
]

export default function ComingSoonPage() {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4 pt-20'>
      <div className='max-w-4xl mx-auto text-center'>
        {/* Logo */}
        <div className='mb-8'>
          <img src='/logo.svg' alt='MyRide' className='h-16 w-auto mx-auto' />
        </div>

        {/* Main Content */}
        <div className='mb-16'>
          <h1 className='text-4xl md:text-6xl font-bold text-foreground mb-3'>
            Coming Soon
          </h1>

          <p className='text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            The ultimate platform for car enthusiasts is almost ready.
          </p>

          {/* Waitlist Form */}
          <div className='max-w-md mx-auto my-20'>
            <h2 className='text-lg font-semibold text-foreground mb-3'>
              Get notified when we launch
            </h2>
            <WaitlistForm />
          </div>
        </div>

        {/* Preview Image */}
        <div className='mb-16'>
          <img
            src='/soon.webp'
            alt='Dashboard Preview'
            className='rounded-lg shadow-lg max-w-full h-auto border border-border'
          />
        </div>

        {/* Social Links */}
        <SocialLinks links={socialLinks} className='mb-8' size={24} />

        {/* Footer */}
        <div className='pt-8 border-t border-border'>
          <p className='text-muted-foreground text-sm'>
            &copy; {new Date().getFullYear()} MyRide. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
