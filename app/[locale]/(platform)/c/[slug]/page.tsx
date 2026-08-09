'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Settings, Shield } from 'lucide-react'
import { useAuth } from '@/lib/context/auth-context'
import {
  getClubBySlugClient,
  getClubMembersClient,
  getMyClubRoleClient,
} from '@/lib/database/clubs-client'
import { PageLayout } from '@/components/layout/page-layout'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { SectionHeader } from '@/components/layout/section-header'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/provider'
import { buildLocalePath } from '@/lib/i18n/config'
import type {
  ClubMemberRole,
  ClubMemberWithProfile,
  ClubWithMeta,
} from '@/lib/types/database'
import { cn } from '@/lib/utils'

function isManager(role: ClubMemberRole | null): boolean {
  return role === 'founder' || role === 'admin'
}

function roleLabel(
  role: ClubMemberRole,
  t: (key: string, fallback: string) => string
): string {
  switch (role) {
    case 'founder':
      return t('clubs.roles.founder', 'Founder')
    case 'admin':
      return t('clubs.roles.admin', 'Admin')
    case 'member':
      return t('clubs.roles.member', 'Member')
  }
}

export default function ClubPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const { t, locale } = useI18n()
  const [club, setClub] = useState<ClubWithMeta | null>(null)
  const [members, setMembers] = useState<ClubMemberWithProfile[]>([])
  const [myRole, setMyRole] = useState<ClubMemberRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setNotFound(false)

        const clubData = await getClubBySlugClient(slug)
        if (!clubData) {
          setNotFound(true)
          return
        }

        setClub(clubData)

        const [membersData, role] = await Promise.all([
          getClubMembersClient(clubData.id),
          user
            ? getMyClubRoleClient(clubData.id, user.id)
            : Promise.resolve(null),
        ])

        setMembers(membersData)
        setMyRole(role)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug, user])

  if (loading) {
    return (
      <PageLayout maxWidth='5xl'>
        <LoadingSpinner message={t('clubs.loading', 'Loading club...')} />
      </PageLayout>
    )
  }

  if (notFound || !club) {
    return (
      <PageLayout maxWidth='5xl'>
        <EmptyState
          icon={Users}
          title={t('clubs.error.notFound', 'Club not found')}
          description={t(
            'clubs.error.notFoundDescription',
            'This club does not exist or may have been removed.'
          )}
          variant='card'
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout maxWidth='5xl'>
      <div className='space-y-8'>
        <header className='flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex items-start gap-4'>
            <div className='relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-border'>
              {club.badge_url ? (
                <Image
                  src={club.badge_url}
                  alt={club.name}
                  width={80}
                  height={80}
                  className='h-full w-full object-cover'
                  unoptimized
                />
              ) : (
                <Users className='h-10 w-10 text-muted-foreground' />
              )}
            </div>

            <div className='min-w-0'>
              <h1 className='text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
                {club.name}
              </h1>
              {club.description && (
                <p className='mt-2 max-w-2xl text-muted-foreground'>
                  {club.description}
                </p>
              )}
              <p className='mt-3 text-sm text-muted-foreground'>
                {t('clubs.memberCount', '{count} members').replace(
                  '{count}',
                  String(club.member_count ?? members.length)
                )}
              </p>
            </div>
          </div>

          {isManager(myRole) && (
            <Button asChild variant='outline' className='shrink-0'>
              <Link href={buildLocalePath(locale, `/c/${club.slug}/manage`)}>
                <Settings className='h-4 w-4' />
                {t('clubs.manage', 'Manage')}
              </Link>
            </Button>
          )}
        </header>

        <section>
          <SectionHeader
            title={t('clubs.members', 'Members')}
            description={t(
              'clubs.membersDescription',
              'People who belong to this club'
            )}
          />

          {members.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t('clubs.emptyMembers.title', 'No members yet')}
              description={t(
                'clubs.emptyMembers.description',
                'This club has no members to display.'
              )}
              variant='muted'
              size='sm'
            />
          ) : (
            <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {members.map(member => {
                const username = member.profile?.username
                const profileHref = username
                  ? buildLocalePath(locale, `/u/${username}`)
                  : undefined

                return (
                  <li
                    key={member.id}
                    className='flex items-center gap-3 rounded-lg border border-border bg-card p-3'
                  >
                    {profileHref ? (
                      <Link href={profileHref} className='shrink-0'>
                        <UserAvatar
                          avatarUrl={member.profile?.avatar_url}
                          username={username ?? 'user'}
                          size='lg'
                        />
                      </Link>
                    ) : (
                      <UserAvatar
                        avatarUrl={member.profile?.avatar_url}
                        username={username ?? 'user'}
                        size='lg'
                      />
                    )}

                    <div className='min-w-0 flex-1'>
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className='block truncate font-medium text-foreground hover:text-primary'
                        >
                          @{username}
                        </Link>
                      ) : (
                        <span className='block truncate font-medium text-muted-foreground'>
                          {t('clubs.unknownMember', 'Unknown member')}
                        </span>
                      )}

                      {member.profile?.full_name && (
                        <p className='truncate text-sm text-muted-foreground'>
                          {member.profile.full_name}
                        </p>
                      )}
                    </div>

                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                        member.role === 'founder' &&
                          'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                        member.role === 'admin' &&
                          'bg-primary/10 text-primary',
                        member.role === 'member' &&
                          'bg-muted text-muted-foreground'
                      )}
                    >
                      {member.role !== 'member' && (
                        <Shield className='h-3 w-3' />
                      )}
                      {roleLabel(member.role, t)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </PageLayout>
  )
}
