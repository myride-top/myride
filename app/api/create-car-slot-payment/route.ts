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

    const { customerEmail } = await request.json()

    // Validate input
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return createSecureResponse({ error: 'Invalid email format' }, 400)
    }

    const session = await PaymentService.createCheckoutSession({
      userId: user.id,
      customerEmail,
      amount: 100, // $1.00 in cents
      name: 'Additional Car Slot',
      description: 'Add one more car to your MyRide profile',
      successUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
      }/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
      }/dashboard`,
      metadata: {
        type: 'car_slot',
      },
    })

    return createSecureResponse({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    return createSecureResponse(
      {
        error: 'Failed to create car slot payment session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
}
