import { Metadata } from 'next'
import MinimalFooter from '@/components/common/minimal-footer'

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'Manage your cars, view statistics, and track your MyRide profile. Your personal automotive showcase dashboard.',
  keywords:
    'dashboard, car management, profile, statistics, my cars, automotive showcase',
  openGraph: {
    title: 'MyRide - Dashboard',
    description:
      'Manage your cars, view statistics, and track your MyRide profile. Your personal automotive showcase dashboard.',
    type: 'website',
    url: 'https://myride.top/dashboard',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'MyRide Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRide - Dashboard',
    description:
      'Manage your cars, view statistics, and track your MyRide profile. Your personal automotive showcase dashboard.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
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
