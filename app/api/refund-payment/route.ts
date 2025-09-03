import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import {
  paymentRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentIntentId, reason, amount } = await request.json()

    // Validate required fields
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    // Validate reason
    const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer']
    if (reason && !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid refund reason' },
        { status: 400 }
      )
    }

    // Retrieve the payment intent to verify ownership
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.metadata?.userId !== user.id) {
      return NextResponse.json(
        { error: 'Payment not found or access denied' },
        { status: 404 }
      )
    }

    // Check if payment is already refunded
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment must be successful to be refunded' },
        { status: 400 }
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

    return NextResponse.json({
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
    return NextResponse.json(
      {
        error: 'Failed to process refund',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
