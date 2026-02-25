import { Metadata } from 'next'
import { MinimalFooter } from '@/components/common/minimal-footer'

export const metadata: Metadata = {
  title: 'Events Map',
  description:
    'Discover car events near you. View events on the map, RSVP, and connect with fellow car enthusiasts.',
  keywords:
    'car events, meetups, car shows, automotive events, map, location',
  openGraph: {
    title: 'MyRide - Events Map',
    description:
      'Discover car events near you. View events on the map, RSVP, and connect with fellow car enthusiasts.',
    type: 'website',
    url: 'https://myride.top/map',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'MyRide Events Map',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRide - Events Map',
    description:
      'Discover car events near you. View events on the map, RSVP, and connect with fellow car enthusiasts.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function MapLayout({
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

