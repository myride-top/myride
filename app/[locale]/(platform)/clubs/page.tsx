'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Plus, Shield, Star, Compass } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import {
  getClubsForUserClient,
  getClubBySlugClient,
  setPrimaryClubClient,
} from '@/lib/database/clubs-client'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/layout/page-layout'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { PremiumButton } from '@/components/common/premium-button'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/provider'
import { buildLocalePath } from '@/lib/i18n/config'
import type { ClubMemberRole, ClubWithMeta, Profile } from '@/lib/types/database'
import { cn } from '@/lib/utils'

function roleLabel(
  role: ClubMemberRole | null | undefined,
  t: (key: string, fallback: string) => string
): string {
  switch (role) {
    case 'founder':
      return t('clubs.roles.founder', 'Founder')
    case 'admin':
      return t('clubs.roles.admin', 'Admin')
    case 'member':
      return t('clubs.roles.member', 'Member')
    default:
      return ''
  }
}

export default function ClubsPage() {
  const { user } = useAuth()
  const { t, locale } = useI18n()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clubs, setClubs] = useState<ClubWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) return

      try {
        setLoading(true)
        const [userProfile, userClubs] = await Promise.all([
          getProfileByUserIdClient(user.id),
          getClubsForUserClient(user.id),
        ])
        setProfile(userProfile)

        const withCounts = await Promise.all(
          userClubs.map(async club => {
            const detailed = await getClubBySlugClient(club.slug)
            return {
              ...club,
              member_count: detailed?.member_count ?? club.member_count,
            }
          })
        )
        setClubs(withCounts)
      } catch {
        toast.error(t('clubs.error.loadFailed', 'Failed to load clubs'))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user, t])

  const handleSetPrimary = async (
    e: React.MouseEvent,
    clubId: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return

    setSettingPrimaryId(clubId)
    try {
      const result = await setPrimaryClubClient(user.id, clubId)
      if (!result.success) {
        toast.error(
          result.error ||
            t('clubs.error.setPrimaryFailed', 'Failed to set primary club')
        )
        return
      }

      setClubs(current =>
        current.map(club => ({
          ...club,
          is_primary: club.id === clubId,
        }))
      )
      toast.success(t('clubs.toast.primarySet', 'Primary club updated'))
    } catch {
      toast.error(
        t('clubs.error.setPrimaryFailed', 'Failed to set primary club')
      )
    } finally {
      setSettingPrimaryId(null)
    }
  }

  const createAction = profile?.is_premium ? (
    <Button asChild>
      <Link href={buildLocalePath(locale, '/clubs/new')}>
        <Plus className='w-4 h-4' />
        {t('clubs.create', 'Create club')}
      </Link>
    </Button>
  ) : (
    <PremiumButton
      featureName={t('clubs.premium.featureName', 'Create a Club')}
      featureDescription={t(
        'clubs.premium.createDescription',
        'Premium members can create and manage car clubs with custom badges.'
      )}
    >
      {t('clubs.create', 'Create club')}
    </PremiumButton>
  )

  return (
    <ProtectedRoute>
      <PageLayout showCreateButton maxWidth='4xl'>
        <PageHeader
          title={t('clubs.title', 'My Clubs')}
          description={t(
            'clubs.description',
            'Clubs you belong to and manage on MyRide'
          )}
        />

        {!loading && (
          <div className='mb-4 flex justify-end'>
            <Button asChild variant='outline'>
              <Link href={buildLocalePath(locale, '/clubs/explore')}>
                <Compass className='w-4 h-4' />
                {t('clubs.explore.link', 'Explore clubs')}
              </Link>
            </Button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner message={t('clubs.loading', 'Loading clubs...')} />
        ) : clubs.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('clubs.empty.title', 'No clubs yet')}
            description={t(
              'clubs.empty.description',
              'Join a club or create your own to connect with other enthusiasts.'
            )}
            action={
              <div className='flex flex-col gap-2 sm:flex-row'>
                <Button asChild variant='outline'>
                  <Link href={buildLocalePath(locale, '/clubs/explore')}>
                    <Compass className='w-4 h-4' />
                    {t('clubs.explore.link', 'Explore clubs')}
                  </Link>
                </Button>
                {createAction}
              </div>
            }
            variant='card'
          />
        ) : (
          <div className='space-y-6'>
            <div className='flex flex-wrap justify-end gap-2'>
              <Button asChild variant='outline'>
                <Link href={buildLocalePath(locale, '/clubs/explore')}>
                  <Compass className='w-4 h-4' />
                  {t('clubs.explore.link', 'Explore clubs')}
                </Link>
              </Button>
              {createAction}
            </div>

            <ul className='grid gap-4 sm:grid-cols-2'>
              {clubs.map(club => (
                <li key={club.id} className='relative'>
                  <Link
                    href={buildLocalePath(locale, `/c/${club.slug}`)}
                    className='group block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/30'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border'>
                        {club.badge_url ? (
                          <Image
                            src={club.badge_url}
                            alt={club.name}
                            width={48}
                            height={48}
                            className='h-full w-full object-cover'
                            unoptimized
                          />
                        ) : (
                          <Users className='h-6 w-6 text-muted-foreground' />
                        )}
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-2'>
                          <h2 className='truncate font-semibold text-foreground group-hover:text-primary'>
                            {club.name}
                          </h2>
                          {club.is_primary && (
                            <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                              <Star className='h-3 w-3 fill-current' />
                              {t('clubs.primaryBadge', 'Primary')}
                            </span>
                          )}
                        </div>
                        {club.description && (
                          <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                            {club.description}
                          </p>
                        )}
                        <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                          {club.my_role && (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                                club.my_role === 'founder' &&
                                  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                                club.my_role === 'admin' &&
                                  'bg-primary/10 text-primary',
                                club.my_role === 'member' &&
                                  'bg-muted text-muted-foreground'
                              )}
                            >
                              {club.my_role !== 'member' && (
                                <Shield className='h-3 w-3' />
                              )}
                              {roleLabel(club.my_role, t)}
                            </span>
                          )}
                          {typeof club.member_count === 'number' && (
                            <span>
                              {t('clubs.memberCount', '{count} members').replace(
                                '{count}',
                                String(club.member_count)
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {!club.is_primary && (
                    <Button
                      type='button'
                      size='sm'
                      variant='ghost'
                      className='absolute bottom-3 right-3'
                      onClick={e => handleSetPrimary(e, club.id)}
                      disabled={settingPrimaryId === club.id}
                    >
                      <Star className='h-3.5 w-3.5' />
                      {settingPrimaryId === club.id
                        ? t('clubs.settingPrimary', 'Setting...')
                        : t('clubs.setPrimary', 'Set as primary')}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageLayout>
    </ProtectedRoute>
  )
}
