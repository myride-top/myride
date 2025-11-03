import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import {
  paymentRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = paymentRateLimit.isAllowed(request)
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

    const { paymentIntentId, reason, amount } = await request.json()

    // Validate required fields
    if (!paymentIntentId) {
      return createSecureResponse(
        { error: 'Payment Intent ID is required' },
        400
      )
    }

    // Validate reason
    const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer']
    if (reason && !validReasons.includes(reason)) {
      return createSecureResponse({ error: 'Invalid refund reason' }, 400)
    }

    // Retrieve the payment intent to verify ownership
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.metadata?.userId !== user.id) {
      return createSecureResponse(
        { error: 'Payment not found or access denied' },
        404
      )
    }

    // Check if payment is already refunded
    if (paymentIntent.status !== 'succeeded') {
      return createSecureResponse(
        { error: 'Payment must be successful to be refunded' },
        400
      )
    }

    // Create refund
    const refundOptions: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    }

    // Add amount if partial refund
    if (amount && amount > 0 && amount < paymentIntent.amount) {
      refundOptions.amount = amount
    }

    const refund = await stripe.refunds.create(refundOptions)

    // Log refund for analytics
    try {
      const { logRefund } = await import('@/lib/database/stats-client')
      await logRefund(
        user.id,
        paymentIntent.amount,
        refund.amount,
        paymentIntent.metadata?.type || 'unknown',
        reason || 'requested_by_customer'
      )
    } catch (error) {
      console.error('Error logging refund:', error)
    }

    return createSecureResponse({
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason,
        created: refund.created,
      },
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return createSecureResponse(
      {
        error: 'Failed to process refund',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}
