import { notFound } from 'next/navigation'
import { getCarByUrlSlugAndUsername } from '@/lib/database/cars'
import CarDetailPageClient from './car-page-client'

type CarPageProps = {
  params: Promise<{ username: string; car: string }>
}

export default async function CarDetailPage({ params }: CarPageProps) {
  const { username, car: carSlug } = await params
  const car = await getCarByUrlSlugAndUsername(carSlug, username)

  if (!car) {
    notFound()
  }

  return <CarDetailPageClient />
}
