import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Cars - MyRide',
  description:
    'Discover amazing cars from the MyRide community. Browse through detailed car specifications, photos, and modifications shared by car enthusiasts worldwide.',
  keywords:
    'browse cars, car gallery, vehicle showcase, automotive community, car photos, car specifications, car modifications',
  openGraph: {
    title: 'Browse Cars - MyRide',
    description:
      'Discover amazing cars from the MyRide community. Browse through detailed car specifications, photos, and modifications shared by car enthusiasts worldwide.',
    type: 'website',
    url: 'https://myride.top/browse',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'Browse Cars on MyRide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Cars - MyRide',
    description:
      'Discover amazing cars from the MyRide community. Browse through detailed car specifications, photos, and modifications shared by car enthusiasts worldwide.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
