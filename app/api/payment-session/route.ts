import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import {
  generalRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get session ID from query params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the session belongs to the authenticated user
    if (session.metadata?.userId !== user.id) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        created: session.created,
      },
    })
  } catch (error) {
    console.error('Error retrieving payment session:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve payment session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
