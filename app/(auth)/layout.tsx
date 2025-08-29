import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Authentication | MyRide',
    template: '%s | MyRide',
  },
  description:
    'Sign in or create your MyRide account to start showcasing your cars to the automotive community.',
  keywords: 'login, register, sign up, authentication, car showcase account',
  openGraph: {
    title: 'Authentication - MyRide',
    description:
      'Sign in or create your MyRide account to start showcasing your cars to the automotive community.',
    type: 'website',
    url: 'https://myride.top',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'MyRide Authentication',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Authentication - MyRide',
    description:
      'Sign in or create your MyRide account to start showcasing your cars to the automotive community.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
