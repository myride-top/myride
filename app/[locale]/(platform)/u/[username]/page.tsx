import { notFound } from 'next/navigation'
import { getProfileByUsername } from '@/lib/database/profiles'
import ProfileGaragePageClient from './garage-page-client'

type ProfilePageProps = {
  params: Promise<{ username: string }>
}

export default async function ProfileGaragePage({ params }: ProfilePageProps) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) {
    notFound()
  }

  return <ProfileGaragePageClient />
}
