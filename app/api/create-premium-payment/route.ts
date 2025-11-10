import { NextRequest } from 'next/server'
import { PaymentService } from '@/lib/services/payment-service'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  paymentRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { createSecureResponse } from '@/lib/utils/security-headers'

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

    const body = await request.json().catch(() => ({}))
    const { customerEmail } = body

    // Validate input
    if (customerEmail !== undefined) {
      if (typeof customerEmail !== 'string') {
        return createSecureResponse({ error: 'Invalid email format' }, 400)
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        return createSecureResponse({ error: 'Invalid email format' }, 400)
      }
    }

    // Check if user already has premium
    try {
      const { isUserPremium } = await import('@/lib/database/premium-client')
      const isPremium = await isUserPremium(user.id)
      if (isPremium) {
        return createSecureResponse(
          { error: 'User already has premium access' },
          400
        )
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
      // Continue anyway, let webhook handle it
    }

    const session = await PaymentService.createCheckoutSession({
      userId: user.id,
      customerEmail,
      amount: 1000, // $10.00 in cents
      name: 'MyRide Premium',
      description: 'Lifetime premium access to MyRide features',
      successUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
      }/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
      }/premium`,
      metadata: {
        type: 'premium',
      },
    })

    return createSecureResponse({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    return createSecureResponse(
      {
        error: 'Failed to create premium payment session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}
