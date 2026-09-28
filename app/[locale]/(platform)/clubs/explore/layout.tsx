import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Clubs',
  description:
    'Discover car enthusiast clubs on MyRide. Browse public clubs by country, members, and name.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function ExploreClubsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
