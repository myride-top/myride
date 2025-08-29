import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface PremiumStats {
  totalUsers: number
  premiumUsers: number
  freeUsers: number
  premiumConversionRate: number
}

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
      console.error('Error activating premium user:', error)
      return false
    }

    return data || false
  } catch (error) {
    console.error('Error activating premium user:', error)
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
      console.error('Error deactivating premium user:', error)
      return false
    }

    return data || false
  } catch (error) {
    console.error('Error deactivating premium user:', error)
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
      console.error('Error checking premium status:', error)
      return false
    }

    return data?.is_premium || false
  } catch (error) {
    console.error('Error checking premium status:', error)
    return false
  }
}

// Get premium statistics
export async function getPremiumStats(): Promise<PremiumStats> {
  try {
    const { data, error } = await supabase
      .from('premium_stats')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching premium stats:', error)
      return {
        totalUsers: 0,
        premiumUsers: 0,
        freeUsers: 0,
        premiumConversionRate: 0,
      }
    }

    return (
      data || {
        totalUsers: 0,
        premiumUsers: 0,
        freeUsers: 0,
        premiumConversionRate: 0,
      }
    )
  } catch (error) {
    console.error('Error fetching premium stats:', error)
    return {
      totalUsers: 0,
      premiumUsers: 0,
      freeUsers: 0,
      premiumConversionRate: 0,
    }
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
  } catch (error) {
    console.error('Error fetching premium purchase date:', error)
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
  } catch (error) {
    console.error('Error fetching Stripe customer ID:', error)
    return null
  }
}
