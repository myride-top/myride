import { createClient } from '@/lib/supabase/client'
import { WaitlistEntry } from '@/lib/types/database'

export async function addToWaitlist(email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.toLowerCase().trim() })

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - email already exists
        return {
          success: false,
          error: 'This email is already on the waitlist!',
        }
      }
      return { success: false, error: 'Failed to add email to waitlist' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const supabase = createClient()

    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return 0
    }

    return count || 0
  } catch {
    return 0
  }
}

export async function getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return []
    }

    return data || []
  } catch {
    return []
  }
}
