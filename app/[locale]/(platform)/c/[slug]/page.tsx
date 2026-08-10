'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  Settings,
  Shield,
  Car,
  Calendar,
  Star,
  UserPlus,
  Clock,
  MapPin,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/context/auth-context'
import {
  getClubBySlugClient,
  getClubMembersClient,
  getMyClubMembershipClient,
  getClubCarsClient,
  getClubEventsClient,
  getMyJoinRequestClient,
  requestJoinClubClient,
  setPrimaryClubClient,
} from '@/lib/database/clubs-client'
import { PageLayout } from '@/components/layout/page-layout'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { SectionHeader } from '@/components/layout/section-header'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CarCard } from '@/components/cars/car-card'
import { useI18n } from '@/lib/i18n/provider'
import { buildLocalePath } from '@/lib/i18n/config'
import { getCountryByCode } from '@/lib/utils/countries'
import type {
  ClubJoinRequest,
  ClubMemberRole,
  ClubMemberWithProfile,
  ClubWithMeta,
  Event,
} from '@/lib/types/database'
import type { ClubCarWithProfile } from '@/lib/database/clubs-client'
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

function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ClubPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const { t, locale } = useI18n()
  const [club, setClub] = useState<ClubWithMeta | null>(null)
  const [members, setMembers] = useState<ClubMemberWithProfile[]>([])
  const [cars, setCars] = useState<ClubCarWithProfile[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [myRole, setMyRole] = useState<ClubMemberRole | null>(null)
  const [isPrimary, setIsPrimary] = useState(false)
  const [joinRequest, setJoinRequest] = useState<ClubJoinRequest | null>(null)
  const [joinMessage, setJoinMessage] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [primaryLoading, setPrimaryLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const loadClub = useCallback(async () => {
    if (!slug) return

    const clubData = await getClubBySlugClient(slug)
    if (!clubData) {
      setNotFound(true)
      return
    }

    setClub(clubData)
    setNotFound(false)

    const [membersData, carsData, eventsData, membership, request] =
      await Promise.all([
        getClubMembersClient(clubData.id),
        getClubCarsClient(clubData.id),
        getClubEventsClient(clubData.id),
        user
          ? getMyClubMembershipClient(clubData.id, user.id)
          : Promise.resolve(null),
        user
          ? getMyJoinRequestClient(clubData.id, user.id)
          : Promise.resolve(null),
      ])

    setMembers(membersData)
    setCars(carsData)
    setEvents(eventsData)
    setMyRole(membership?.role ?? null)
    setIsPrimary(Boolean(membership?.is_primary))
    setJoinRequest(request)
  }, [slug, user])

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        await loadClub()
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [loadClub])

  const handleRequestJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!club || !user) return

    setJoinLoading(true)
    try {
      const result = await requestJoinClubClient(club.id, joinMessage)
      if (!result.success) {
        toast.error(
          result.error ||
            t('clubs.error.joinRequestFailed', 'Failed to submit join request')
        )
        return
      }

      toast.success(
        t('clubs.toast.joinRequested', 'Join request submitted')
      )
      setShowJoinForm(false)
      setJoinMessage('')
      const request = await getMyJoinRequestClient(club.id, user.id)
      setJoinRequest(request)
    } catch {
      toast.error(
        t('clubs.error.joinRequestFailed', 'Failed to submit join request')
      )
    } finally {
      setJoinLoading(false)
    }
  }

  const handleSetPrimary = async () => {
    if (!club || !user) return

    setPrimaryLoading(true)
    try {
      const result = await setPrimaryClubClient(user.id, club.id)
      if (!result.success) {
        toast.error(
          result.error ||
            t('clubs.error.setPrimaryFailed', 'Failed to set primary club')
        )
        return
      }

      setIsPrimary(true)
      toast.success(
        t('clubs.toast.primarySet', 'Primary club updated')
      )
    } catch {
      toast.error(
        t('clubs.error.setPrimaryFailed', 'Failed to set primary club')
      )
    } finally {
      setPrimaryLoading(false)
    }
  }

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

  const country = club.country ? getCountryByCode(club.country) : null
  const isMember = myRole !== null

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
              <div className='mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                <span>
                  {t('clubs.memberCount', '{count} members').replace(
                    '{count}',
                    String(club.member_count ?? members.length)
                  )}
                </span>
                {country && (
                  <span>
                    {country.flag} {country.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-2 shrink-0'>
            {isManager(myRole) && (
              <Button asChild variant='outline'>
                <Link href={buildLocalePath(locale, `/c/${club.slug}/manage`)}>
                  <Settings className='h-4 w-4' />
                  {t('clubs.manage', 'Manage')}
                </Link>
              </Button>
            )}

            {user && !isMember && joinRequest?.status !== 'pending' && (
              <Button
                variant='default'
                onClick={() => setShowJoinForm(current => !current)}
              >
                <UserPlus className='h-4 w-4' />
                {t('clubs.requestJoin', 'Request to join')}
              </Button>
            )}

            {user && !isMember && joinRequest?.status === 'pending' && (
              <Button variant='secondary' disabled>
                <Clock className='h-4 w-4' />
                {t('clubs.joinPending', 'Request pending')}
              </Button>
            )}

            {user && isMember && !isPrimary && (
              <Button
                variant='outline'
                onClick={handleSetPrimary}
                disabled={primaryLoading}
              >
                <Star className='h-4 w-4' />
                {primaryLoading
                  ? t('clubs.settingPrimary', 'Setting...')
                  : t('clubs.setPrimary', 'Set as primary')}
              </Button>
            )}

            {user && isMember && isPrimary && (
              <span className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary'>
                <Star className='h-3.5 w-3.5 fill-current' />
                {t('clubs.primaryBadge', 'Primary club')}
              </span>
            )}
          </div>
        </header>

        {showJoinForm && user && !isMember && (
          <form
            onSubmit={handleRequestJoin}
            className='rounded-lg border border-border bg-card p-4 space-y-3'
          >
            <p className='text-sm text-muted-foreground'>
              {t(
                'clubs.joinMessageHint',
                'Optional message for club managers'
              )}
            </p>
            <Input
              value={joinMessage}
              onChange={e => setJoinMessage(e.target.value)}
              placeholder={t(
                'clubs.joinMessagePlaceholder',
                'Why do you want to join?'
              )}
              maxLength={500}
            />
            <div className='flex gap-2 justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowJoinForm(false)}
              >
                {t('clubs.form.cancel', 'Cancel')}
              </Button>
              <Button type='submit' disabled={joinLoading}>
                {joinLoading
                  ? t('clubs.submittingJoin', 'Submitting...')
                  : t('clubs.submitJoin', 'Submit request')}
              </Button>
            </div>
          </form>
        )}

        <section>
          <SectionHeader
            title={t('clubs.garage', 'Garage')}
            description={t(
              'clubs.garageDescription',
              'Cars from club members'
            )}
          />

          {cars.length === 0 ? (
            <EmptyState
              icon={Car}
              title={t('clubs.emptyGarage.title', 'No cars yet')}
              description={t(
                'clubs.emptyGarage.description',
                'Club members have not added any cars to their garages.'
              )}
              variant='muted'
              size='sm'
            />
          ) : (
            <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {cars.map(({ car, profile }) => (
                <li key={car.id}>
                  <CarCard
                    car={car}
                    profile={profile}
                    showActions={false}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader
            title={t('clubs.events', 'Events')}
            description={t(
              'clubs.eventsDescription',
              'Upcoming events linked to this club'
            )}
          />

          {events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t('clubs.emptyEvents.title', 'No upcoming events')}
              description={t(
                'clubs.emptyEvents.description',
                'This club has no upcoming events on the map.'
              )}
              variant='muted'
              size='sm'
            />
          ) : (
            <ul className='grid gap-3 sm:grid-cols-2'>
              {events.map(event => (
                <li key={event.id}>
                  <Link
                    href={buildLocalePath(
                      locale,
                      `/map?club=${club.slug}&event=${event.id}`
                    )}
                    className='block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30'
                  >
                    <h3 className='font-semibold text-foreground'>
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                        {event.description}
                      </p>
                    )}
                    <div className='mt-3 flex items-center gap-2 text-xs text-muted-foreground'>
                      <Calendar className='h-3.5 w-3.5' />
                      {formatEventDate(event.event_date)}
                    </div>
                    <div className='mt-1 flex items-center gap-2 text-xs text-primary'>
                      <MapPin className='h-3.5 w-3.5' />
                      {t('clubs.viewOnMap', 'View on map')}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

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
