import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Activate premium status for a user
export async function activatePremiumUser(
  userId: string,
  stripeCustomerId?: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('activate_premium_user', {
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
    })

    if (error) {
      return false
    }

    return data || false
  } catch {
    return false
  }
}

// Deactivate premium status for a user
export async function deactivatePremiumUser(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('deactivate_premium_user', {
      user_id: userId,
    })

    if (error) {
      return false
    }

    return data || false
  } catch {
    return false
  }
}

// Check if user has premium status
export async function isUserPremium(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single()

    if (error) {
      return false
    }

    return data?.is_premium || false
  } catch {
    return false
  }
}

// Get user's premium purchase date
export async function getPremiumPurchaseDate(
  userId: string
): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('premium_purchased_at')
      .eq('id', userId)
      .single()

    if (error || !data?.premium_purchased_at) {
      return null
    }

    return new Date(data.premium_purchased_at)
  } catch {
    return null
  }
}

// Get user's Stripe customer ID
export async function getStripeCustomerId(
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (error || !data?.stripe_customer_id) {
      return null
    }

    return data.stripe_customer_id
  } catch {
    return null
  }
}

// Add a car slot to user (for $2 purchases)
export async function addCarSlot(userId: string): Promise<boolean> {
  try {
    // First get current value
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('car_slots_purchased')
      .eq('id', userId)
      .single()

    if (fetchError) {
      return false
    }

    const currentSlots = currentProfile?.car_slots_purchased || 0
    const newSlots = currentSlots + 1

    // Update with new value
    const { error } = await supabase
      .from('profiles')
      .update({
        car_slots_purchased: newSlots,
      })
      .eq('id', userId)
      .select('car_slots_purchased')
      .single()

    if (error) {
      return false
    }

    return true
  } catch {
    return false
  }
}

// Get user's car slot information
export async function getUserCarSlots(userId: string): Promise<{
  currentCars: number
  maxAllowedCars: number
  purchasedSlots: number
  isPremium: boolean
}> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, car_slots_purchased')
      .eq('id', userId)
      .single()

    if (profileError) {
      return {
        currentCars: 0,
        maxAllowedCars: 1,
        purchasedSlots: 0,
        isPremium: false,
      }
    }

    const isPremium = profile?.is_premium || false
    const purchasedSlots = profile?.car_slots_purchased || 0

    // Get current car count
    const { count, error: carError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (carError) {
      return {
        currentCars: 0,
        maxAllowedCars: isPremium ? 999 : 1 + purchasedSlots,
        purchasedSlots,
        isPremium,
      }
    }

    const currentCars = count || 0
    const maxAllowedCars = isPremium ? 999 : 1 + purchasedSlots

    return {
      currentCars,
      maxAllowedCars,
      purchasedSlots,
      isPremium,
    }
  } catch {
    return {
      currentCars: 0,
      maxAllowedCars: 1,
      purchasedSlots: 0,
      isPremium: false,
    }
  }
}
