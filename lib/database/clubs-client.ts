import { createBrowserClient } from '@supabase/ssr'
import type {
  Car,
  Club,
  ClubBadgeInfo,
  ClubJoinRequest,
  ClubJoinRequestWithProfile,
  ClubMember,
  ClubMemberRole,
  ClubMemberWithProfile,
  ClubWithMeta,
  Event,
  Profile,
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

async function ensurePrimaryIfNone(
  userId: string,
  clubId: string
): Promise<void> {
  const { data: existingPrimary } = await supabase
    .from('club_members')
    .select('id')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .maybeSingle()

  if (!existingPrimary) {
    await supabase
      .from('club_members')
      .update({ is_primary: true })
      .eq('club_id', clubId)
      .eq('user_id', userId)
    invalidateClubBadgesCache(userId)
  }
}

function sortBadgesPrimaryFirst(badges: ClubBadgeInfo[]): ClubBadgeInfo[] {
  return [...badges].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.name.localeCompare(b.name)
  })
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

    const club = data as Club
    await ensurePrimaryIfNone(input.founderId, club.id)

    return { success: true, club }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create club',
    }
  }
}

export async function updateClubClient(
  clubId: string,
  updates: Partial<
    Pick<Club, 'name' | 'description' | 'badge_url' | 'slug' | 'country'>
  >
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

    if (updates.country !== undefined) {
      payload.country = updates.country || null
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
      is_primary,
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
      is_primary: Boolean(row.is_primary),
      created_at: row.created_at,
      updated_at: row.updated_at,
      profile,
    }
  })
}

export async function getMyClubMembershipClient(
  clubId: string,
  userId: string
): Promise<ClubMember | null> {
  const { data } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .maybeSingle()

  return data ? (data as ClubMember) : null
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
      is_primary,
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
        is_primary: Boolean(row.is_primary),
      }
      return result
    })
    .filter((club): club is ClubWithMeta => club !== null)
}

export async function getManagedClubsForUserClient(
  userId: string
): Promise<ClubWithMeta[]> {
  const clubs = await getClubsForUserClient(userId)
  return clubs.filter(
    club => club.my_role === 'founder' || club.my_role === 'admin'
  )
}

export async function exploreClubsClient(options: {
  search?: string
  country?: string
  sort?: 'members' | 'name' | 'newest'
  limit?: number
}): Promise<ClubWithMeta[]> {
  const limit = options.limit ?? 50
  let query = supabase.from('clubs').select('*')

  const search = options.search?.trim()
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (options.country) {
    query = query.eq('country', options.country)
  }

  if (options.sort === 'name') {
    query = query.order('name', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.limit(limit)

  const { data: clubs, error } = await query
  if (error || !clubs) {
    return []
  }

  const clubIds = clubs.map(club => club.id)
  const { data: memberRows } = await supabase
    .from('club_members')
    .select('club_id')
    .in('club_id', clubIds)

  const countMap = new Map<string, number>()
  memberRows?.forEach(row => {
    countMap.set(row.club_id, (countMap.get(row.club_id) ?? 0) + 1)
  })

  const withCounts: ClubWithMeta[] = clubs.map(club => ({
    ...(club as Club),
    member_count: countMap.get(club.id) ?? 0,
  }))

  if (options.sort === 'members') {
    withCounts.sort((a, b) => (b.member_count ?? 0) - (a.member_count ?? 0))
  }

  return withCounts
}

export interface ClubCarWithProfile {
  car: Car
  profile: Profile
}

export async function getClubCarsClient(
  clubId: string
): Promise<ClubCarWithProfile[]> {
  const { data: members, error: membersError } = await supabase
    .from('club_members')
    .select('user_id')
    .eq('club_id', clubId)

  if (membersError || !members?.length) {
    return []
  }

  const userIds = members.map(member => member.user_id)

  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select(
      `
      *,
      profile:profiles (
        id,
        username,
        full_name,
        avatar_url,
        is_premium,
        nationality,
        unit_preference,
        created_at,
        updated_at,
        premium_purchased_at,
        car_slots_purchased,
        stripe_customer_id,
        stripe_subscription_id,
        total_supported_amount,
        is_supporter,
        bio,
        location,
        instagram_handle,
        youtube_channel,
        website_url,
        garage_description
      )
    `
    )
    .in('user_id', userIds)
    .order('created_at', { ascending: false })

  if (carsError || !cars) {
    return []
  }

  const carIds = cars.map(car => car.id)
  const { data: likeCounts } = await supabase
    .from('car_likes')
    .select('car_id')
    .in('car_id', carIds)

  const likeCountMap = new Map<string, number>()
  likeCounts?.forEach(like => {
    likeCountMap.set(like.car_id, (likeCountMap.get(like.car_id) ?? 0) + 1)
  })

  return cars
    .map(row => {
      const profileValue = row.profile
      const profile = Array.isArray(profileValue)
        ? profileValue[0]
        : profileValue
      if (!profile) return null

      const car = {
        ...(row as Car),
        like_count: likeCountMap.get(row.id) ?? 0,
      }

      return { car, profile: profile as Profile }
    })
    .filter((item): item is ClubCarWithProfile => item !== null)
}

export async function getClubEventsClient(clubId: string): Promise<Event[]> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('club_id', clubId)
    .or(`end_date.gte.${now},and(end_date.is.null,event_date.gte.${now})`)
    .order('event_date', { ascending: true })

  if (error || !data) {
    return []
  }

  return data as Event[]
}

export async function requestJoinClubClient(
  clubId: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in' }
    }

    const trimmedMessage = message?.trim() || null

    const existing = await getMyJoinRequestClient(clubId, user.id)
    if (existing?.status === 'pending') {
      return { success: false, error: 'You already have a pending request' }
    }

    if (existing?.status === 'approved') {
      return { success: false, error: 'You are already a member' }
    }

    if (existing?.status === 'rejected') {
      const { error } = await supabase
        .from('club_join_requests')
        .update({
          status: 'pending',
          message: trimmedMessage,
          reviewed_at: null,
          reviewed_by: null,
        })
        .eq('id', existing.id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    }

    const { error } = await supabase.from('club_join_requests').insert({
      club_id: clubId,
      user_id: user.id,
      status: 'pending',
      message: trimmedMessage,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to submit request',
    }
  }
}

export async function getMyJoinRequestClient(
  clubId: string,
  userId: string
): Promise<ClubJoinRequest | null> {
  const { data, error } = await supabase
    .from('club_join_requests')
    .select('*')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as ClubJoinRequest
}

export async function getPendingJoinRequestsClient(
  clubId: string
): Promise<ClubJoinRequestWithProfile[]> {
  const { data, error } = await supabase
    .from('club_join_requests')
    .select(
      `
      *,
      profile:profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq('club_id', clubId)
    .eq('status', 'pending')
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
      ...(row as ClubJoinRequest),
      profile,
    }
  })
}

export async function reviewJoinRequestClient(input: {
  requestId: string
  clubId: string
  approve: boolean
  reviewerId: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: request, error: requestError } = await supabase
      .from('club_join_requests')
      .select('*')
      .eq('id', input.requestId)
      .eq('club_id', input.clubId)
      .eq('status', 'pending')
      .maybeSingle()

    if (requestError || !request) {
      return { success: false, error: 'Join request not found' }
    }

    const now = new Date().toISOString()
    const newStatus = input.approve ? 'approved' : 'rejected'

    if (input.approve) {
      const { error: memberError } = await supabase.from('club_members').insert({
        club_id: input.clubId,
        user_id: request.user_id,
        role: 'member',
      })

      if (memberError && memberError.code !== '23505') {
        return { success: false, error: memberError.message }
      }

      await ensurePrimaryIfNone(request.user_id, input.clubId)
    }

    const { error: updateError } = await supabase
      .from('club_join_requests')
      .update({
        status: newStatus,
        reviewed_at: now,
        reviewed_by: input.reviewerId,
      })
      .eq('id', input.requestId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    invalidateClubBadgesCache(request.user_id)
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to review request',
    }
  }
}

export async function setPrimaryClubClient(
  userId: string,
  clubId: string
): Promise<{ success: boolean; error?: string }> {
  const membership = await getMyClubMembershipClient(clubId, userId)
  if (!membership) {
    return { success: false, error: 'You are not a member of this club' }
  }

  const { error: unsetError } = await supabase
    .from('club_members')
    .update({ is_primary: false })
    .eq('user_id', userId)
    .eq('is_primary', true)

  if (unsetError) {
    return { success: false, error: unsetError.message }
  }

  const { error: setError } = await supabase
    .from('club_members')
    .update({ is_primary: true })
    .eq('user_id', userId)
    .eq('club_id', clubId)

  if (setError) {
    return { success: false, error: setError.message }
  }

  invalidateClubBadgesCache(userId)
  return { success: true }
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
      is_primary,
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
        is_primary: Boolean(row.is_primary),
      })
    }
  }

  const sorted = sortBadgesPrimaryFirst(badges)
  badgeCache.set(userId, { data: sorted, timestamp: Date.now() })
  return sorted
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
      is_primary,
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
      is_primary: Boolean(row.is_primary),
    })
  }

  for (const userId of Object.keys(result)) {
    result[userId] = sortBadgesPrimaryFirst(result[userId])
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

    await ensurePrimaryIfNone(profile.id, input.clubId)

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
