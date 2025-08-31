import { createClient } from '@/lib/supabase/client'
import { SupportTransaction } from '@/lib/types/database'

const supabase = createClient()

export async function createSupportTransaction(
  supporterId: string,
  creatorId: string,
  amount: number,
  paymentIntentId: string
): Promise<SupportTransaction | null> {
  try {
    const { data, error } = await supabase
      .from('support_transactions')
      .insert({
        supporter_id: supporterId,
        creator_id: creatorId,
        amount: amount,
        payment_intent_id: paymentIntentId,
        status: 'completed',
      })
      .select()
      .single()

    if (error) {
      return null
    }

    // Update the supporter's profile to reflect they are now a supporter
    await updateSupporterProfile(supporterId, amount)

    // Update the creator's profile to reflect total support received
    await updateCreatorProfile(creatorId, amount)

    return data
  } catch (error) {
    return null
  }
}

export async function getTotalSupportAmount(
  supporterId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('support_transactions')
      .select('amount')
      .eq('supporter_id', supporterId)
      .eq('status', 'completed')

    if (error) {
      return 0
    }

    return data.reduce((total, transaction) => total + transaction.amount, 0)
  } catch (error) {
    return 0
  }
}

export async function hasUserSupportedCreator(
  supporterId: string,
  creatorId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('support_transactions')
      .select('id')
      .eq('supporter_id', supporterId)
      .eq('creator_id', creatorId)
      .eq('status', 'completed')
      .limit(1)

    if (error) {
      return false
    }

    return data.length > 0
  } catch (error) {
    return false
  }
}

export async function getCreatorSupportStats(creatorId: string): Promise<{
  totalSupporters: number
  totalAmount: number
}> {
  try {
    const { data, error } = await supabase
      .from('support_transactions')
      .select('amount, supporter_id')
      .eq('creator_id', creatorId)
      .eq('status', 'completed')

    if (error) {
      return { totalSupporters: 0, totalAmount: 0 }
    }

    const totalAmount = data.reduce(
      (total, transaction) => total + transaction.amount,
      0
    )
    const uniqueSupporters = new Set(data.map(t => t.supporter_id)).size

    return {
      totalSupporters: uniqueSupporters,
      totalAmount,
    }
  } catch (error) {
    return { totalSupporters: 0, totalAmount: 0 }
  }
}

async function updateSupporterProfile(
  supporterId: string,
  amount: number
): Promise<void> {
  try {
    const currentTotal = await getTotalSupportAmount(supporterId)

    const { error } = await supabase
      .from('profiles')
      .update({
        total_supported_amount: currentTotal,
        is_supporter: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', supporterId)

    if (error) {
    }
  } catch (error) {}
}

async function updateCreatorProfile(
  creatorId: string,
  amount: number
): Promise<void> {
  try {
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('total_supported_amount')
      .eq('id', creatorId)
      .single()

    if (fetchError) {
      return
    }

    const currentTotal = currentProfile?.total_supported_amount || 0
    const newTotal = currentTotal + amount

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_supported_amount: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId)

    if (updateError) {
    }
  } catch (error) {}
}
