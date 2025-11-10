import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'
import { getStripeClient } from '@/lib/services/stripe-client'

const stripe = getStripeClient()

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = generalRateLimit.isAllowed(request)
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  }

  try {
    // Authenticate user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401)
    }

    // Get user's Stripe customer ID from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const customerId = profile?.stripe_customer_id

    // Get checkout sessions for this user
    // We'll search by metadata userId since customer might not be set
    // First try to get sessions by customer ID if available
    let sessions: Stripe.Response<Stripe.ApiList<Stripe.Checkout.Session>>
    
    if (customerId) {
      try {
        sessions = await stripe.checkout.sessions.list({
          customer: customerId,
          limit: 100,
        })
      } catch (error) {
        // If customer lookup fails, fall back to listing all sessions
        sessions = await stripe.checkout.sessions.list({
          limit: 100,
        })
      }
    } else {
      sessions = await stripe.checkout.sessions.list({
        limit: 100,
      })
    }

    // Filter sessions by userId in metadata to ensure we only get user's payments
    const userSessions = sessions.data.filter(
      session => session.metadata?.userId === user.id
    )

    // Get payment intents for refund information
    const payments = await Promise.all(
      userSessions.map(async session => {
        let paymentIntentId: string | null = null
        let refunds: any[] = []
        let refundedAmount = 0

        if (session.payment_intent) {
          paymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent.id

          if (paymentIntentId) {
            // Get refunds for this payment intent
            const refundsList = await stripe.refunds.list({
              payment_intent: paymentIntentId,
              limit: 100,
            })
            refunds = refundsList.data
            refundedAmount = refunds.reduce(
              (sum, refund) => sum + refund.amount,
              0
            )
          }
        }

        return {
          sessionId: session.id,
          paymentIntentId,
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          status: session.payment_status,
          type: session.metadata?.type || 'unknown',
          created: session.created,
          refundedAmount,
          canRefund:
            session.payment_status === 'paid' &&
            refundedAmount < (session.amount_total || 0),
          refunds: refunds.map(refund => ({
            id: refund.id,
            amount: refund.amount,
            status: refund.status,
            reason: refund.reason,
            created: refund.created,
          })),
        }
      })
    )

    // Sort by created date (newest first)
    payments.sort((a, b) => b.created - a.created)

    return createSecureResponse({ payments })
  } catch (error) {
    console.error('Error retrieving payments:', error)
    return createSecureResponse(
      {
        error: 'Failed to retrieve payments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}

