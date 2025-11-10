import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key for server-side operations
// This bypasses RLS and is safe for webhook handlers
// If service role key is not available, fall back to anon key (less secure but works)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Activate premium status for a user (server-side, for webhooks)
export async function activatePremiumUserServer(
  userId: string,
  stripeCustomerId?: string | null
): Promise<boolean> {
  try {
    // Try RPC function first
    const { data, error } = await supabaseAdmin.rpc('activate_premium_user', {
      user_id: userId,
      stripe_customer_id: stripeCustomerId || null,
    })

    if (error) {
      console.warn('RPC activate_premium_user failed, trying direct update:', {
        userId,
        stripeCustomerId,
        error: error.message,
      })
      
      // Fallback to direct update if RPC fails
      const updateData: {
        is_premium: boolean
        premium_purchased_at: string
        stripe_customer_id?: string | null
        updated_at: string
      } = {
        is_premium: true,
        premium_purchased_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Only update stripe_customer_id if provided
      if (stripeCustomerId) {
        updateData.stripe_customer_id = stripeCustomerId
      }

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      if (updateError) {
        console.error('Direct update also failed:', {
          userId,
          stripeCustomerId,
          error: updateError.message,
        })
        return false
      }

      console.log('Successfully activated premium for user (direct update):', {
        userId,
        stripeCustomerId,
      })
      return true
    }

    if (!data) {
      console.error('activate_premium_user returned false for user:', userId)
      return false
    }

    console.log('Successfully activated premium for user (RPC):', {
      userId,
      stripeCustomerId,
    })
    return true
  } catch (error) {
    console.error('Exception activating premium user:', {
      userId,
      stripeCustomerId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return false
  }
}

// Deactivate premium status for a user (server-side)
export async function deactivatePremiumUserServer(
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc('deactivate_premium_user', {
      user_id: userId,
    })

    if (error) {
      console.error('Error deactivating premium user:', {
        userId,
        error: error.message,
        details: error,
      })
      return false
    }

    return data || false
  } catch (error) {
    console.error('Exception deactivating premium user:', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

// Add a car slot to user (server-side, for webhooks)
export async function addCarSlotServer(userId: string): Promise<boolean> {
  try {
    // First get current value
    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('car_slots_purchased')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching profile for car slot:', {
        userId,
        error: fetchError.message,
      })
      return false
    }

    const currentSlots = currentProfile?.car_slots_purchased || 0
    const newSlots = currentSlots + 1

    // Update with new value
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        car_slots_purchased: newSlots,
      })
      .eq('id', userId)

    if (error) {
      console.error('Error adding car slot:', {
        userId,
        error: error.message,
      })
      return false
    }

    console.log('Successfully added car slot for user:', {
      userId,
      newSlots,
    })
    return true
  } catch (error) {
    console.error('Exception adding car slot:', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

