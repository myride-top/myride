import { Metadata } from 'next'
import { MinimalFooter } from '@/components/common/minimal-footer'

export const metadata: Metadata = {
  title: 'Clubs',
  description: 'View and manage your car clubs on MyRide.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ClubsLayout({
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
