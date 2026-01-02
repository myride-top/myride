import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/database'

export async function getProfileByUserIdClient(
  userId: string
): Promise<Profile | null> {
  const supabase = createClient()

  // Select only needed fields for better performance
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
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
    return null
  }

  return data
}

export async function updateProfileClient(
  userId: string,
  updates: Partial<Profile>
): Promise<{ success: boolean; error?: string; data?: Profile }> {
  const supabase = createClient()

  // First, check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)

  if (fetchError) {
    return {
      success: false,
      error: 'Failed to check existing profile',
    }
  }

  // If no profile exists, create one
  if (!existingProfile || existingProfile.length === 0) {
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
      return {
        success: false,
        error: 'Failed to create profile',
      }
    }

    return { success: true, data: createdProfile }
  }

  // Update the existing profile
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
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

// Mark user as supporter
export async function markUserAsSupporter(
  userId: string,
  supportType: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        is_supporter: true,
        supporter_type: supportType,
        supporter_since: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error marking user as supporter:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error marking user as supporter:', error)
    return false
  }
}
