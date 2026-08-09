import { createBrowserClient } from '@supabase/ssr'
import type {
  Club,
  ClubBadgeInfo,
  ClubMember,
  ClubMemberRole,
  ClubMemberWithProfile,
  ClubWithMeta,
} from '@/lib/types/database'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function slugifyClubName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug || 'club'
  let attempt = 0

  while (attempt < 50) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt + 1}`
    const { data, error } = await supabase
      .from('clubs')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return candidate
    }

    attempt += 1
  }

  return `${slug}-${Date.now().toString(36)}`
}

export async function createClubClient(input: {
  name: string
  description?: string | null
  founderId: string
}): Promise<{ success: boolean; club?: Club; error?: string }> {
  try {
    const name = input.name.trim()
    if (name.length < 2 || name.length > 80) {
      return { success: false, error: 'Club name must be 2–80 characters' }
    }

    const slug = await ensureUniqueSlug(slugifyClubName(name))

    const { data, error } = await supabase
      .from('clubs')
      .insert({
        name,
        slug,
        description: input.description?.trim() || null,
        founder_id: input.founderId,
        badge_url: null,
      })
      .select('*')
      .single()

    if (error) {
      if (error.message.includes('Premium') || error.code === '42501') {
        return {
          success: false,
          error: 'Only premium users can create clubs',
        }
      }
      return { success: false, error: error.message }
    }

    return { success: true, club: data as Club }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create club',
    }
  }
}

export async function updateClubClient(
  clubId: string,
  updates: Partial<Pick<Club, 'name' | 'description' | 'badge_url' | 'slug'>>
): Promise<{ success: boolean; club?: Club; error?: string }> {
  try {
    const payload: Record<string, string | null> = {}

    if (updates.name !== undefined) {
      const name = updates.name.trim()
      if (name.length < 2 || name.length > 80) {
        return { success: false, error: 'Club name must be 2–80 characters' }
      }
      payload.name = name
    }

    if (updates.description !== undefined) {
      payload.description = updates.description?.trim() || null
    }

    if (updates.badge_url !== undefined) {
      payload.badge_url = updates.badge_url
    }

    if (updates.slug !== undefined) {
      payload.slug = updates.slug
    }

    const { data, error } = await supabase
      .from('clubs')
      .update(payload)
      .eq('id', clubId)
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, club: data as Club }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update club',
    }
  }
}

export async function getClubBySlugClient(
  slug: string
): Promise<ClubWithMeta | null> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const { count } = await supabase
    .from('club_members')
    .select('id', { count: 'exact', head: true })
    .eq('club_id', data.id)

  return {
    ...(data as Club),
    member_count: count ?? 0,
  }
}

export async function getClubMembersClient(
  clubId: string
): Promise<ClubMemberWithProfile[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select(
      `
      id,
      club_id,
      user_id,
      role,
      created_at,
      updated_at,
      profile:profiles (
        id,
        username,
        full_name,
        avatar_url,
        is_premium,
        nationality
      )
    `
    )
    .eq('club_id', clubId)
    .order('created_at', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map(row => {
    const profileValue = row.profile
    const profile = Array.isArray(profileValue)
      ? profileValue[0] ?? null
      : profileValue ?? null

    return {
      id: row.id,
      club_id: row.club_id,
      user_id: row.user_id,
      role: row.role as ClubMemberRole,
      created_at: row.created_at,
      updated_at: row.updated_at,
      profile,
    }
  })
}

export async function getMyClubRoleClient(
  clubId: string,
  userId: string
): Promise<ClubMemberRole | null> {
  const { data } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .maybeSingle()

  return (data?.role as ClubMemberRole | undefined) ?? null
}

export async function getClubsForUserClient(
  userId: string
): Promise<ClubWithMeta[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select(
      `
      role,
      club:clubs (*)
    `
    )
    .eq('user_id', userId)

  if (error || !data) {
    return []
  }

  return data
    .map(row => {
      const clubValue = row.club
      const club = Array.isArray(clubValue) ? clubValue[0] : clubValue
      if (!club) return null
      const result: ClubWithMeta = {
        ...(club as Club),
        my_role: row.role as ClubMemberRole,
      }
      return result
    })
    .filter((club): club is ClubWithMeta => club !== null)
}

const badgeCache = new Map<
  string,
  { data: ClubBadgeInfo[]; timestamp: number }
>()
const BADGE_CACHE_MS = 60_000

export async function getClubBadgesForUserClient(
  userId: string
): Promise<ClubBadgeInfo[]> {
  const cached = badgeCache.get(userId)
  if (cached && Date.now() - cached.timestamp < BADGE_CACHE_MS) {
    return cached.data
  }

  const { data, error } = await supabase
    .from('club_members')
    .select(
      `
      club:clubs (
        id,
        name,
        slug,
        badge_url
      )
    `
    )
    .eq('user_id', userId)

  if (error || !data) {
    return []
  }

  const badges: ClubBadgeInfo[] = []

  for (const row of data) {
    const clubValue = row.club
    const club = Array.isArray(clubValue) ? clubValue[0] : clubValue
    if (club?.badge_url && club.id && club.name && club.slug) {
      badges.push({
        id: club.id,
        name: club.name,
        slug: club.slug,
        badge_url: club.badge_url,
      })
    }
  }

  badgeCache.set(userId, { data: badges, timestamp: Date.now() })
  return badges
}

export function invalidateClubBadgesCache(userId?: string) {
  if (userId) {
    badgeCache.delete(userId)
  } else {
    badgeCache.clear()
  }
}

export async function getClubBadgesForUsersClient(
  userIds: string[]
): Promise<Record<string, ClubBadgeInfo[]>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))]
  if (uniqueIds.length === 0) {
    return {}
  }

  const { data, error } = await supabase
    .from('club_members')
    .select(
      `
      user_id,
      club:clubs (
        id,
        name,
        slug,
        badge_url
      )
    `
    )
    .in('user_id', uniqueIds)

  if (error || !data) {
    return {}
  }

  const result: Record<string, ClubBadgeInfo[]> = {}

  for (const row of data) {
    const clubValue = row.club
    const club = Array.isArray(clubValue) ? clubValue[0] : clubValue
    if (!club?.badge_url || !row.user_id) continue

    if (!result[row.user_id]) {
      result[row.user_id] = []
    }

    result[row.user_id].push({
      id: club.id,
      name: club.name,
      slug: club.slug,
      badge_url: club.badge_url,
    })
  }

  return result
}

export async function addClubMemberByUsernameClient(input: {
  clubId: string
  username: string
  role: Extract<ClubMemberRole, 'admin' | 'member'>
}): Promise<{ success: boolean; member?: ClubMember; error?: string }> {
  try {
    const username = input.username.replace(/^@/, '').trim().toLowerCase()
    if (!username) {
      return { success: false, error: 'Username is required' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', username)
      .maybeSingle()

    if (profileError || !profile) {
      return { success: false, error: 'User not found' }
    }

    const { data, error } = await supabase
      .from('club_members')
      .insert({
        club_id: input.clubId,
        user_id: profile.id,
        role: input.role,
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'User is already a member' }
      }
      return { success: false, error: error.message }
    }

    return { success: true, member: data as ClubMember }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to add member',
    }
  }
}

export async function updateClubMemberRoleClient(input: {
  clubId: string
  memberId: string
  role: Extract<ClubMemberRole, 'admin' | 'member'>
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('club_members')
    .update({ role: input.role })
    .eq('id', input.memberId)
    .eq('club_id', input.clubId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function removeClubMemberClient(input: {
  clubId: string
  memberId: string
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('id', input.memberId)
    .eq('club_id', input.clubId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function leaveClubClient(input: {
  clubId: string
  userId: string
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('club_id', input.clubId)
    .eq('user_id', input.userId)
    .neq('role', 'founder')

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function deleteClubClient(
  clubId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('clubs').delete().eq('id', clubId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
