'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Search, Globe } from 'lucide-react'
import { toast } from 'sonner'
import {
  exploreClubsClient,
} from '@/lib/database/clubs-client'
import { PageLayout } from '@/components/layout/page-layout'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/lib/i18n/provider'
import { buildLocalePath } from '@/lib/i18n/config'
import { COUNTRIES } from '@/lib/utils/countries'
import type { ClubWithMeta } from '@/lib/types/database'

export default function ExploreClubsPage() {
  const { t, locale } = useI18n()
  const [clubs, setClubs] = useState<ClubWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState<string>('all')
  const [sort, setSort] = useState<'members' | 'name' | 'newest'>('members')

  const loadClubs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await exploreClubsClient({
        search: search || undefined,
        country: country === 'all' ? undefined : country,
        sort,
        limit: 60,
      })
      setClubs(data)
    } catch {
      toast.error(t('clubs.error.loadFailed', 'Failed to load clubs'))
    } finally {
      setLoading(false)
    }
  }, [search, country, sort, t])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadClubs()
    }, 300)

    return () => clearTimeout(timer)
  }, [loadClubs])

  return (
    <PageLayout maxWidth='5xl'>
      <PageHeader
        title={t('clubs.explore.title', 'Explore clubs')}
        description={t(
          'clubs.explore.description',
          'Discover car enthusiast clubs on MyRide'
        )}
      />

      <div className='mb-4 flex justify-end'>
        <Button asChild variant='outline'>
          <Link href={buildLocalePath(locale, '/clubs')}>
            {t('clubs.explore.myClubs', 'My clubs')}
          </Link>
        </Button>
      </div>

      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t(
              'clubs.explore.searchPlaceholder',
              'Search clubs...'
            )}
            className='pl-9'
          />
        </div>

        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className='w-full sm:w-48'>
            <Globe className='h-4 w-4 mr-2 text-muted-foreground' />
            <SelectValue
              placeholder={t('clubs.explore.allCountries', 'All countries')}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              {t('clubs.explore.allCountries', 'All countries')}
            </SelectItem>
            {COUNTRIES.map(c => (
              <SelectItem key={c.code} value={c.code}>
                {c.flag} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={value =>
            setSort(value as 'members' | 'name' | 'newest')
          }
        >
          <SelectTrigger className='w-full sm:w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='members'>
              {t('clubs.explore.sortMembers', 'Most members')}
            </SelectItem>
            <SelectItem value='name'>
              {t('clubs.explore.sortName', 'Name A–Z')}
            </SelectItem>
            <SelectItem value='newest'>
              {t('clubs.explore.sortNewest', 'Newest')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner message={t('clubs.loading', 'Loading clubs...')} />
      ) : clubs.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('clubs.explore.empty.title', 'No clubs found')}
          description={t(
            'clubs.explore.empty.description',
            'Try adjusting your search or filters.'
          )}
          variant='card'
        />
      ) : (
        <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {clubs.map(club => (
            <li key={club.id}>
              <Link
                href={buildLocalePath(locale, `/c/${club.slug}`)}
                className='group block h-full rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/30'
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
                    <h2 className='truncate font-semibold text-foreground group-hover:text-primary'>
                      {club.name}
                    </h2>
                    {club.description && (
                      <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                        {club.description}
                      </p>
                    )}
                    <p className='mt-2 text-xs text-muted-foreground'>
                      {t('clubs.memberCount', '{count} members').replace(
                        '{count}',
                        String(club.member_count ?? 0)
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  )
}
