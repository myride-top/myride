import { MinimalFooter } from '@/components/common/minimal-footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Premium - MyRide',
  description:
    'Upgrade to MyRide Premium for unlimited cars, advanced analytics, garage sharing, and exclusive features. Only $10 for lifetime access.',
  keywords:
    'premium, upgrade, unlimited cars, analytics, garage sharing, car showcase, premium features',
  openGraph: {
    title: 'MyRide Premium - Unlimited Cars & Analytics',
    description:
      'Upgrade to MyRide Premium for unlimited cars, advanced analytics, garage sharing, and exclusive features. Only $10 for lifetime access.',
    type: 'website',
    url: 'https://myride.top/premium',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'MyRide Premium Features',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRide Premium - Unlimited Cars & Analytics',
    description:
      'Upgrade to MyRide Premium for unlimited cars, advanced analytics, garage sharing, and exclusive features. Only $10 for lifetime access.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <MinimalFooter />
    </>
  )
}
