import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import {
  paymentRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'
import { getStripeClient } from '@/lib/services/stripe-client'

const stripe = getStripeClient()

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

    const { sessionId, reason, amount } = await request.json()

    // Validate required fields
    if (!sessionId || typeof sessionId !== 'string') {
      return createSecureResponse(
        { error: 'Checkout Session ID is required' },
        400
      )
    }

    // Validate reason
    const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer']
    if (reason && !validReasons.includes(reason)) {
      return createSecureResponse({ error: 'Invalid refund reason' }, 400)
    }

    // Validate amount if provided
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return createSecureResponse({ error: 'Invalid refund amount' }, 400)
      }
    }

    // Retrieve the checkout session to verify ownership
    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      })
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        if (error.code === 'resource_missing') {
          return createSecureResponse(
            { error: 'Checkout session not found' },
            404
          )
        }
      }
      throw error
    }

    // Verify the session belongs to the authenticated user
    if (session.metadata?.userId !== user.id) {
      return createSecureResponse(
        { error: 'Payment not found or access denied' },
        404
      )
    }

    // Check if payment is completed
    if (session.payment_status !== 'paid') {
      return createSecureResponse(
        { error: 'Payment must be completed to be refunded' },
        400
      )
    }

    // Get payment intent from session
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id

    if (!paymentIntentId) {
      return createSecureResponse(
        { error: 'Payment intent not found for this session' },
        400
      )
    }

    // Retrieve payment intent to check status and amount
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return createSecureResponse(
        { error: 'Payment must be successful to be refunded' },
        400
      )
    }

    // Check if already refunded
    const existingRefunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 100,
    })

    const totalRefunded = existingRefunds.data.reduce(
      (sum, refund) => sum + refund.amount,
      0
    )

    if (totalRefunded >= paymentIntent.amount) {
      return createSecureResponse(
        { error: 'Payment has already been fully refunded' },
        400
      )
    }

    // Create refund
    const refundOptions: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    }

    // Add amount if partial refund
    const remainingAmount = paymentIntent.amount - totalRefunded
    if (amount && amount > 0) {
      if (amount > remainingAmount) {
        return createSecureResponse(
          {
            error: `Refund amount exceeds remaining amount ($${(
              remainingAmount / 100
            ).toFixed(2)})`,
          },
          400
        )
      }
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
        session.metadata?.type || paymentIntent.metadata?.type || 'unknown',
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
