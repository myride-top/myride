import { Metadata } from 'next'
import { Instagram, Twitter } from 'lucide-react'

export const metadata: Metadata = {
  title: 'MyRide - Coming Soon',
  description:
    'The ultimate platform for car enthusiasts is coming soon. Join the waitlist to be the first to know when we launch.',
  keywords:
    'car showcase, vehicle gallery, car enthusiasts, automotive community, coming soon',
  authors: [{ name: 'MyRide Team' }],
  creator: 'MyRide',
  publisher: 'MyRide',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://myride.top'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myride.top',
    siteName: 'MyRide',
    title: 'MyRide - Coming Soon',
    description:
      'The ultimate platform for car enthusiasts is coming soon. Join the waitlist to be the first to know when we launch.',
  },
  twitter: {
    card: 'summary',
    site: '@myride',
    creator: '@myride',
    title: 'MyRide - Coming Soon',
    description:
      'The ultimate platform for car enthusiasts is coming soon. Join the waitlist to be the first to know when we launch.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'automotive',
  classification: 'car showcase platform',
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' />
  </svg>
)

export default function ComingSoonPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-zinc-50 via-gray-50 to-slate-50 flex items-center justify-center p-4'>
      <div className='max-w-2xl mx-auto text-center'>
        {/* Logo */}
        <div className='mb-8'>
          <img
            src='/logo.svg'
            alt='MyRide'
            className='h-16 w-auto mx-auto mb-4'
          />
        </div>

        {/* Main Content */}
        <h1 className='text-4xl md:text-6xl font-bold mb-6'>Coming Soon</h1>

        <p className='text-xl md:text-2xl text-gray-800 mb-8 leading-relaxed'>
          The ultimate platform for car enthusiasts to showcase their vehicles
          is almost ready.
        </p>

        <p className='text-lg text-gray-600 mb-12 max-w-lg mx-auto'>
          Share detailed specifications, photos, and connect with fellow car
          lovers worldwide. Fast, easy, and beautiful.
        </p>

        <img
          src='/soon.webp'
          alt='Dashboard Preview'
          className='border-primary border-2 mt-8 mb-14 rounded-md'
        />

        {/* Social Links */}
        <div className='flex justify-center space-x-6'>
          <a
            href='https://instagram.com/myride.top'
            target='_blank'
            rel='noopener noreferrer'
            className='text-gray-600 hover:text-gray-900 transition-colors duration-200'
          >
            <Instagram className='h-6 w-6' />
          </a>
          <a
            href='https://x.com/myride_top'
            target='_blank'
            rel='noopener noreferrer'
            className='text-gray-600 hover:text-gray-900 transition-colors duration-200'
          >
            <Twitter className='h-6 w-6' />
          </a>
          <a
            href='https://tiktok.com/@myride.top'
            target='_blank'
            rel='noopener noreferrer'
            className='text-gray-600 hover:text-gray-900 transition-colors duration-200'
          >
            <TikTokIcon className='h-6 w-6' />
          </a>
        </div>

        {/* Footer */}
        <div className='mt-12 pt-8 border-t border-white/10'>
          <p className='text-gray-500 text-sm'>
            &copy; {new Date().getFullYear()} MyRide. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
