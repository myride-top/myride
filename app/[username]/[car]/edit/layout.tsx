import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Car - MyRide',
  description: 'Edit your car details, specifications, and photos on MyRide. Update your automotive showcase with the latest information.',
  keywords: 'edit car, car specifications, car photos, vehicle modifications, automotive showcase',
  openGraph: {
    title: 'Edit Car - MyRide',
    description: 'Edit your car details, specifications, and photos on MyRide. Update your automotive showcase with the latest information.',
    type: 'website',
    url: 'https://myride.cz',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'Edit Car on MyRide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit Car - MyRide',
    description: 'Edit your car details, specifications, and photos on MyRide. Update your automotive showcase with the latest information.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function EditCarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
