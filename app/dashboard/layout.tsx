import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - MyRide',
  description: 'Manage your cars, view statistics, and track your MyRide profile. Your personal automotive showcase dashboard.',
  keywords: 'dashboard, car management, profile, statistics, my cars, automotive showcase',
  openGraph: {
    title: 'Dashboard - MyRide',
    description: 'Manage your cars, view statistics, and track your MyRide profile. Your personal automotive showcase dashboard.',
    type: 'website',
    url: 'https://myride.cz/dashboard',
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
    title: 'Dashboard - MyRide',
    description: 'Manage your cars, view statistics, and track your MyRide profile. Your personal automotive showcase dashboard.',
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
  return children
}
