import React from 'react'
import { Metadata } from 'next'
import { MinimalFooter } from '@/components/common/minimal-footer'

export const metadata: Metadata = {
  title: 'Analytics',
  description:
    'Track your car performance with detailed analytics and insights. Monitor views, likes, shares, and comments to optimize your automotive showcase.',
  keywords:
    'car analytics, vehicle performance, car views, car likes, car shares, car comments, automotive metrics, car showcase analytics',
  openGraph: {
    title: 'MyRide - Analytics',
    description:
      'Track your car performance with detailed analytics and insights. Monitor views, likes, shares, and comments to optimize your automotive showcase.',
    type: 'website',
    url: 'https://myride.top/analytics',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'MyRide Analytics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRide - Analytics',
    description:
      'Track your car performance with detailed analytics and insights. Monitor views, likes, shares, and comments to optimize your automotive showcase.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <main className='flex-1'>{children}</main>
      <MinimalFooter />
    </div>
  )
}
