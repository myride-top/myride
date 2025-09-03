import { Metadata } from 'next'
import MinimalFooter from '@/components/common/minimal-footer'

export const metadata: Metadata = {
  title: 'Add New Car',
  description:
    'Add your car to the MyRide community. Share detailed specifications, photos, and modifications with fellow car enthusiasts.',
  keywords:
    'add car, car showcase, vehicle profile, car specifications, car photos, car modifications',
  openGraph: {
    title: 'MyRide - Add New Car',
    description:
      'Add your car to the MyRide community. Share detailed specifications, photos, and modifications with fellow car enthusiasts.',
    type: 'website',
    url: 'https://myride.top/create',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'Add New Car on MyRide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRide - Add New Car',
    description:
      'Add your car to the MyRide community. Share detailed specifications, photos, and modifications with fellow car enthusiasts.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function CreateLayout({
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
