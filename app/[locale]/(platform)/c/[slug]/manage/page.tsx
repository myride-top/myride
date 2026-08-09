'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  Shield,
  Trash2,
  LogOut,
  Upload,
  UserPlus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/context/auth-context'
import {
  getClubBySlugClient,
  getClubMembersClient,
  getMyClubRoleClient,
  updateClubClient,
  addClubMemberByUsernameClient,
  updateClubMemberRoleClient,
  removeClubMemberClient,
  leaveClubClient,
  deleteClubClient,
} from '@/lib/database/clubs-client'
import { uploadClubBadge, deleteClubBadge } from '@/lib/storage/photos'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/layout/page-layout'
import { PageHeader } from '@/components/layout/page-header'
import { SectionHeader } from '@/components/layout/section-header'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/lib/i18n/provider'
import { buildLocalePath } from '@/lib/i18n/config'
import type {
  Club,
  ClubMemberRole,
  ClubMemberWithProfile,
} from '@/lib/types/database'
import { cn } from '@/lib/utils'

const MAX_BADGE_SIZE = 2 * 1024 * 1024

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

export default function ManageClubPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()
  const { t, locale } = useI18n()

  const [club, setClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<ClubMemberWithProfile[]>([])
  const [myRole, setMyRole] = useState<ClubMemberRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingBadge, setUploadingBadge] = useState(false)

  const [newUsername, setNewUsername] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>(
    'member'
  )
  const [addingMember, setAddingMember] = useState(false)

  const loadClub = useCallback(async () => {
    if (!slug || !user) return

    const clubData = await getClubBySlugClient(slug)
    if (!clubData) {
      setNotFound(true)
      return
    }

    const [membersData, role] = await Promise.all([
      getClubMembersClient(clubData.id),
      getMyClubRoleClient(clubData.id, user.id),
    ])

    setClub(clubData)
    setMembers(membersData)
    setMyRole(role)
    setName(clubData.name)
    setDescription(clubData.description ?? '')
    setNotFound(false)
  }, [slug, user])

  useEffect(() => {
    const init = async () => {
      if (!user) return
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
  }, [user, loadClub])

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!club) return

    setSaving(true)
    try {
      const result = await updateClubClient(club.id, {
        name: name.trim(),
        description: description.trim() || null,
      })

      if (!result.success || !result.club) {
        toast.error(
          result.error || t('clubs.error.updateFailed', 'Failed to update club')
        )
        return
      }

      setClub(result.club)
      toast.success(t('clubs.toast.updated', 'Club updated'))
    } catch {
      toast.error(t('clubs.error.updateFailed', 'Failed to update club'))
    } finally {
      setSaving(false)
    }
  }

  const handleBadgeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !club) return

    if (!file.type.startsWith('image/')) {
      toast.error(t('clubs.error.badgeInvalidType', 'Please upload an image file'))
      e.target.value = ''
      return
    }

    if (file.size > MAX_BADGE_SIZE) {
      toast.error(
        t('clubs.error.badgeTooLarge', 'Badge image must be smaller than 2 MB')
      )
      e.target.value = ''
      return
    }

    setUploadingBadge(true)
    try {
      if (club.badge_url) {
        await deleteClubBadge(club.badge_url)
      }

      const badgeUrl = await uploadClubBadge(file, club.id)
      if (!badgeUrl) {
        toast.error(
          t('clubs.error.badgeUploadFailed', 'Failed to upload badge')
        )
        return
      }

      const result = await updateClubClient(club.id, { badge_url: badgeUrl })
      if (!result.success || !result.club) {
        toast.error(
          result.error || t('clubs.error.badgeUploadFailed', 'Failed to upload badge')
        )
        return
      }

      setClub(result.club)
      toast.success(t('clubs.toast.badgeUpdated', 'Badge updated'))
    } catch {
      toast.error(t('clubs.error.badgeUploadFailed', 'Failed to upload badge'))
    } finally {
      setUploadingBadge(false)
      e.target.value = ''
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!club) return

    setAddingMember(true)
    try {
      const result = await addClubMemberByUsernameClient({
        clubId: club.id,
        username: newUsername,
        role: myRole === 'founder' ? newMemberRole : 'member',
      })

      if (!result.success) {
        toast.error(
          result.error || t('clubs.error.addMemberFailed', 'Failed to add member')
        )
        return
      }

      toast.success(t('clubs.toast.memberAdded', 'Member added'))
      setNewUsername('')
      setNewMemberRole('member')
      await loadClub()
    } catch {
      toast.error(t('clubs.error.addMemberFailed', 'Failed to add member'))
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (member: ClubMemberWithProfile) => {
    if (!club || member.role === 'founder') return

    if (
      myRole === 'admin' &&
      (member.role === 'admin' || member.user_id === user?.id)
    ) {
      return
    }

    const confirmed = window.confirm(
      t('clubs.confirm.removeMember', 'Remove this member from the club?')
    )
    if (!confirmed) return

    const result = await removeClubMemberClient({
      clubId: club.id,
      memberId: member.id,
    })

    if (!result.success) {
      toast.error(
        result.error ||
          t('clubs.error.removeMemberFailed', 'Failed to remove member')
      )
      return
    }

    toast.success(t('clubs.toast.memberRemoved', 'Member removed'))
    await loadClub()
  }

  const handlePromoteDemote = async (
    member: ClubMemberWithProfile,
    newRole: 'admin' | 'member'
  ) => {
    if (!club || myRole !== 'founder' || member.role === 'founder') return

    const result = await updateClubMemberRoleClient({
      clubId: club.id,
      memberId: member.id,
      role: newRole,
    })

    if (!result.success) {
      toast.error(
        result.error ||
          t('clubs.error.roleUpdateFailed', 'Failed to update member role')
      )
      return
    }

    toast.success(t('clubs.toast.roleUpdated', 'Member role updated'))
    await loadClub()
  }

  const handleLeaveClub = async () => {
    if (!club || !user || myRole !== 'admin') return

    const confirmed = window.confirm(
      t('clubs.confirm.leave', 'Leave this club? You will lose admin access.')
    )
    if (!confirmed) return

    const result = await leaveClubClient({ clubId: club.id, userId: user.id })
    if (!result.success) {
      toast.error(
        result.error || t('clubs.error.leaveFailed', 'Failed to leave club')
      )
      return
    }

    toast.success(t('clubs.toast.left', 'You left the club'))
    router.push(buildLocalePath(locale, '/clubs'))
  }

  const handleDeleteClub = async () => {
    if (!club || myRole !== 'founder') return

    const confirmed = window.confirm(
      t(
        'clubs.confirm.delete',
        'Delete this club permanently? This cannot be undone.'
      )
    )
    if (!confirmed) return

    const result = await deleteClubClient(club.id)
    if (!result.success) {
      toast.error(
        result.error || t('clubs.error.deleteFailed', 'Failed to delete club')
      )
      return
    }

    toast.success(t('clubs.toast.deleted', 'Club deleted'))
    router.push(buildLocalePath(locale, '/clubs'))
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PageLayout showCreateButton maxWidth='4xl'>
          <LoadingSpinner message={t('clubs.loading', 'Loading club...')} />
        </PageLayout>
      </ProtectedRoute>
    )
  }

  if (notFound || !club) {
    return (
      <ProtectedRoute>
        <PageLayout showCreateButton maxWidth='4xl'>
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
      </ProtectedRoute>
    )
  }

  if (!isManager(myRole)) {
    return (
      <ProtectedRoute>
        <PageLayout showCreateButton maxWidth='4xl'>
          <EmptyState
            icon={Shield}
            title={t('clubs.error.noAccess', 'Access denied')}
            description={t(
              'clubs.error.noAccessDescription',
              'Only club founders and admins can manage this club.'
            )}
            action={
              <Button asChild variant='outline'>
                <Link href={buildLocalePath(locale, `/c/${club.slug}`)}>
                  {t('clubs.backToClub', 'Back to club')}
                </Link>
              </Button>
            }
            variant='card'
          />
        </PageLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PageLayout showCreateButton maxWidth='4xl'>
        <PageHeader
          title={t('clubs.manageTitle', 'Manage club')}
          description={club.name}
          showBackButton
          backHref={buildLocalePath(locale, `/c/${club.slug}`)}
        />

        <div className='space-y-10'>
          <section className='rounded-lg border border-border bg-card p-6 shadow-sm'>
            <SectionHeader
              as='h3'
              title={t('clubs.sections.details', 'Club details')}
            />
            <form onSubmit={handleSaveDetails} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='manage-name'>
                  {t('clubs.form.name', 'Club name')}
                </Label>
                <Input
                  id='manage-name'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={80}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='manage-description'>
                  {t('clubs.form.description', 'Description')}
                </Label>
                <textarea
                  id='manage-description'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                />
              </div>
              <div className='flex justify-end'>
                <Button type='submit' disabled={saving}>
                  {saving
                    ? t('clubs.form.saving', 'Saving...')
                    : t('clubs.form.save', 'Save changes')}
                </Button>
              </div>
            </form>
          </section>

          <section className='rounded-lg border border-border bg-card p-6 shadow-sm'>
            <SectionHeader
              as='h3'
              title={t('clubs.sections.badge', 'Club badge')}
              description={t(
                'clubs.badgeDescription',
                'Upload a square image shown next to member usernames. Max 2 MB.'
              )}
            />
            <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
              <div className='relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border'>
                {club.badge_url ? (
                  <Image
                    src={club.badge_url}
                    alt={club.name}
                    width={64}
                    height={64}
                    className='h-full w-full object-cover'
                    unoptimized
                  />
                ) : (
                  <Users className='h-8 w-8 text-muted-foreground' />
                )}
              </div>
              <div>
                <Label
                  htmlFor='badge-upload'
                  className='inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent'
                >
                  <Upload className='h-4 w-4' />
                  {uploadingBadge
                    ? t('clubs.badgeUploading', 'Uploading...')
                    : t('clubs.badgeUpload', 'Upload badge')}
                </Label>
                <Input
                  id='badge-upload'
                  type='file'
                  accept='image/*'
                  className='sr-only'
                  disabled={uploadingBadge}
                  onChange={handleBadgeUpload}
                />
              </div>
            </div>
          </section>

          <section className='rounded-lg border border-border bg-card p-6 shadow-sm'>
            <SectionHeader
              as='h3'
              title={t('clubs.sections.addMember', 'Add member')}
            />
            <form
              onSubmit={handleAddMember}
              className='flex flex-col gap-3 sm:flex-row sm:items-end'
            >
              <div className='flex-1 space-y-2'>
                <Label htmlFor='member-username'>
                  {t('clubs.form.username', 'Username')}
                </Label>
                <Input
                  id='member-username'
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder={t('clubs.form.usernamePlaceholder', '@username')}
                  required
                />
              </div>
              {myRole === 'founder' && (
                <div className='w-full space-y-2 sm:w-40'>
                  <Label>{t('clubs.form.role', 'Role')}</Label>
                  <Select
                    value={newMemberRole}
                    onValueChange={value =>
                      setNewMemberRole(value as 'admin' | 'member')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='member'>
                        {t('clubs.roles.member', 'Member')}
                      </SelectItem>
                      <SelectItem value='admin'>
                        {t('clubs.roles.admin', 'Admin')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type='submit' disabled={addingMember} className='shrink-0'>
                <UserPlus className='h-4 w-4' />
                {addingMember
                  ? t('clubs.form.adding', 'Adding...')
                  : t('clubs.form.addMember', 'Add member')}
              </Button>
            </form>
          </section>

          <section className='rounded-lg border border-border bg-card p-6 shadow-sm'>
            <SectionHeader
              as='h3'
              title={t('clubs.members', 'Members')}
            />
            <ul className='space-y-3'>
              {members.map(member => {
                const username = member.profile?.username ?? 'user'
                const canRemove =
                  member.role !== 'founder' &&
                  (myRole === 'founder' ||
                    (myRole === 'admin' && member.role === 'member'))

                return (
                  <li
                    key={member.id}
                    className='flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center'
                  >
                    <div className='flex min-w-0 flex-1 items-center gap-3'>
                      <UserAvatar
                        avatarUrl={member.profile?.avatar_url}
                        username={username}
                        size='md'
                      />
                      <div className='min-w-0'>
                        <p className='truncate font-medium'>@{username}</p>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                            member.role === 'founder' &&
                              'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                            member.role === 'admin' &&
                              'bg-primary/10 text-primary',
                            member.role === 'member' &&
                              'bg-muted text-muted-foreground'
                          )}
                        >
                          {roleLabel(member.role, t)}
                        </span>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-2'>
                      {myRole === 'founder' && member.role === 'member' && (
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          onClick={() => handlePromoteDemote(member, 'admin')}
                        >
                          <ArrowUp className='h-3.5 w-3.5' />
                          {t('clubs.actions.promote', 'Promote')}
                        </Button>
                      )}
                      {myRole === 'founder' && member.role === 'admin' && (
                        <Button
                          type='button'
                          size='sm'
                          variant='outline'
                          onClick={() => handlePromoteDemote(member, 'member')}
                        >
                          <ArrowDown className='h-3.5 w-3.5' />
                          {t('clubs.actions.demote', 'Demote')}
                        </Button>
                      )}
                      {canRemove && (
                        <Button
                          type='button'
                          size='sm'
                          variant='destructive'
                          onClick={() => handleRemoveMember(member)}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                          {t('clubs.actions.remove', 'Remove')}
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className='space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6'>
            <SectionHeader
              as='h3'
              title={t('clubs.sections.danger', 'Danger zone')}
              titleClassName='text-destructive'
            />

            {myRole === 'admin' && (
              <Button variant='outline' onClick={handleLeaveClub}>
                <LogOut className='h-4 w-4' />
                {t('clubs.actions.leave', 'Leave club')}
              </Button>
            )}

            {myRole === 'founder' && (
              <Button variant='destructive' onClick={handleDeleteClub}>
                <Trash2 className='h-4 w-4' />
                {t('clubs.actions.delete', 'Delete club')}
              </Button>
            )}
          </section>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
