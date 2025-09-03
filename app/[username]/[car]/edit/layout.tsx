import { Metadata } from 'next'
import { getCarByUrlSlugAndUsernameClient } from '@/lib/database/cars-client'
import MinimalFooter from '@/components/common/minimal-footer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; car: string }>
}): Promise<Metadata> {
  try {
    const { username, car: carSlug } = await params
    const car = await getCarByUrlSlugAndUsernameClient(carSlug, username)
    const carName = car?.name || 'Car'

    return {
      title: `Editing ${carName} | MyRide`,
      description: `Edit your ${carName} details, specifications, and photos on MyRide. Update your automotive showcase with the latest information.`,
      keywords:
        'edit car, car specifications, car photos, vehicle modifications, automotive showcase',
      openGraph: {
        title: `MyRide - Editing ${carName}`,
        description: `Edit your ${carName} details, specifications, and photos on MyRide. Update your automotive showcase with the latest information.`,
        type: 'website',
        url: 'https://myride.top',
        siteName: 'MyRide',
        images: [
          {
            url: '/og-image-default.svg',
            width: 1200,
            height: 630,
            alt: `Edit ${carName} on MyRide`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `MyRide - Editing ${carName}`,
        description: `Edit your ${carName} details, specifications, and photos on MyRide. Update your automotive showcase with the latest information.`,
        images: ['/og-image-default.svg'],
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  } catch {
    return {
      title: 'Editing Car | MyRide',
      description:
        'Edit your car details, specifications, and photos on MyRide. Update your automotive showcase with the latest information.',
      keywords:
        'edit car, car specifications, car photos, vehicle modifications, automotive showcase',
      openGraph: {
        title: 'MyRide - Editing Car',
        description:
          'Edit your car details, specifications, and photos on MyRide. Update your automotive showcase with the latest information.',
        type: 'website',
        url: 'https://myride.top',
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
        title: 'MyRide - Editing Car',
        description:
          'Edit your car details, specifications, and photos on MyRide. Update your automotive showcase with the latest information.',
        images: ['/og-image-default.svg'],
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }
}

export default function EditCarLayout({
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
