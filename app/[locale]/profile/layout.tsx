import { Metadata } from 'next'
import { MinimalFooter } from '@/components/common/minimal-footer'

export const metadata: Metadata = {
  title: 'Edit Profile',
  description:
    'Update your MyRide profile settings, avatar, and preferences. Customize your automotive showcase experience.',
  keywords:
    'profile settings, account management, user preferences, avatar upload, unit preferences',
  openGraph: {
    title: 'MyRide - Edit Profile',
    description:
      'Update your MyRide profile settings, avatar, and preferences. Customize your automotive showcase experience.',
    type: 'website',
    url: 'https://myride.top/profile',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'Edit Profile on MyRide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRide - Edit Profile',
    description:
      'Update your MyRide profile settings, avatar, and preferences. Customize your automotive showcase experience.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-1'>{children}</main>
      <MinimalFooter />
    </div>
  )
}
