import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/database'

export async function getProfileByUserIdClient(
  userId: string
): Promise<Profile | null> {
  const supabase = createClient()

  console.log('Fetching profile for user:', userId)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  console.log('Profile query result:', { data, error, userId })

  if (error) {
    console.error('Error fetching profile:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return null
  }

  return data
}

export async function getProfileByUsernameClient(
  username: string
): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching profile by username:', error)
    return null
  }

  return data
}

export async function createProfileClient(
  profileData: Omit<Profile, 'created_at' | 'updated_at'>
): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    return null
  }

  return data
}

export async function updateProfileClient(
  userId: string,
  updates: Partial<Profile>
): Promise<{ success: boolean; error?: string; data?: Profile }> {
  const supabase = createClient()

  console.log('Updating profile for user:', userId, 'with updates:', updates)

  // First, check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)

  if (fetchError) {
    console.error('Error checking existing profile:', fetchError)
    return {
      success: false,
      error: 'Failed to check existing profile',
    }
  }

  // If no profile exists, create one
  if (!existingProfile || existingProfile.length === 0) {
    console.log('No profile found, creating new profile for user:', userId)

    const newProfile = {
      id: userId,
      username: updates.username || `user_${userId.slice(0, 8)}`,
      full_name: updates.full_name || '',
      avatar_url: updates.avatar_url || null,
    }

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
      return {
        success: false,
        error: 'Failed to create profile',
      }
    }

    return { success: true, data: createdProfile }
  }

  // If multiple profiles exist, use the first one (this shouldn't happen with proper constraints)
  const profileToUpdate = existingProfile[0]

  // Update the existing profile
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  console.log('Profile update result:', { data, error, userId })

  if (error) {
    console.error('Error updating profile:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })

    // Check for specific error types
    if (error.code === '23505') {
      return {
        success: false,
        error: 'Username already exists. Please choose a different username.',
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to update profile',
    }
  }

  return { success: true, data }
}
