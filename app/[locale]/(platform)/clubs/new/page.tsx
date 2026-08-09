'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/context/auth-context'
import { getProfileByUserIdClient } from '@/lib/database/profiles-client'
import { createClubClient } from '@/lib/database/clubs-client'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/layout/page-layout'
import { PageHeader } from '@/components/layout/page-header'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n/provider'
import { buildLocalePath } from '@/lib/i18n/config'
import type { Profile } from '@/lib/types/database'

export default function CreateClubPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { t, locale } = useI18n()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user) return

      try {
        const userProfile = await getProfileByUserIdClient(user.id)
        setProfile(userProfile)
      } catch {
        toast.error(t('clubs.error.loadFailed', 'Failed to load profile'))
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      toast.error(
        t('clubs.error.nameTooShort', 'Club name must be at least 2 characters')
      )
      return
    }

    setSubmitting(true)
    try {
      const result = await createClubClient({
        name: trimmedName,
        description: description.trim() || null,
        founderId: user.id,
      })

      if (!result.success || !result.club) {
        toast.error(
          result.error || t('clubs.error.createFailed', 'Failed to create club')
        )
        return
      }

      toast.success(t('clubs.toast.created', 'Club created successfully'))
      router.push(
        buildLocalePath(locale, `/c/${result.club.slug}/manage`)
      )
    } catch {
      toast.error(t('clubs.error.createFailed', 'Failed to create club'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <PageLayout showCreateButton maxWidth='3xl'>
        <PageHeader
          title={t('clubs.createTitle', 'Create a club')}
          description={t(
            'clubs.createDescription',
            'Start a community for enthusiasts who share your passion.'
          )}
          showBackButton
          backHref={buildLocalePath(locale, '/clubs')}
        />

        {loading ? (
          <LoadingSpinner message={t('clubs.loading', 'Loading...')} />
        ) : !profile?.is_premium ? (
          <div className='rounded-lg border border-border bg-card p-8 text-center shadow-sm'>
            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500'>
              <Crown className='h-7 w-7 text-white' />
            </div>
            <h2 className='text-xl font-semibold text-foreground'>
              {t('clubs.premium.required', 'Premium required')}
            </h2>
            <p className='mx-auto mt-2 max-w-md text-muted-foreground'>
              {t(
                'clubs.premium.createDescription',
                'Premium members can create and manage car clubs with custom badges.'
              )}
            </p>
            <Button
              className='mt-6'
              variant='gradient'
              onClick={() => router.push(buildLocalePath(locale, '/premium'))}
            >
              <Crown className='h-4 w-4' />
              {t('clubs.premium.upgrade', 'Upgrade to Premium')}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className='space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm'
          >
            <div className='space-y-2'>
              <Label htmlFor='club-name'>
                {t('clubs.form.name', 'Club name')} *
              </Label>
              <Input
                id='club-name'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('clubs.form.namePlaceholder', 'e.g. Midnight Runners')}
                maxLength={80}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='club-description'>
                {t('clubs.form.description', 'Description')}
              </Label>
              <textarea
                id='club-description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t(
                  'clubs.form.descriptionPlaceholder',
                  'Tell others what your club is about...'
                )}
                rows={4}
                className='flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
              />
            </div>

            <div className='flex justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push(buildLocalePath(locale, '/clubs'))}
              >
                {t('clubs.form.cancel', 'Cancel')}
              </Button>
              <Button type='submit' disabled={submitting}>
                {submitting
                  ? t('clubs.form.creating', 'Creating...')
                  : t('clubs.create', 'Create club')}
              </Button>
            </div>
          </form>
        )}
      </PageLayout>
    </ProtectedRoute>
  )
}
