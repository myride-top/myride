import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/services/payment-service'
import {
  paymentRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'

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
    const { amount, description, metadata, userId } = await request.json()

    // Validate amount
    if (
      !amount ||
      typeof amount !== 'number' ||
      amount < 100 ||
      amount > 100000
    ) {
      // Minimum $1.00 (100 cents), Maximum $1000.00 (100000 cents)
      return NextResponse.json(
        { error: 'Invalid amount. Must be between $1.00 and $1000.00' },
        { status: 400 }
      )
    }

    // Validate description length
    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Description too long. Maximum 500 characters.' },
        { status: 400 }
      )
    }

    const paymentLink = await PaymentService.createPaymentLink({
      amount,
      name: 'Support MyRide',
      description: description || 'Support for MyRide development',
      redirectUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
      }/support/thank-you`,
      userId,
      metadata: {
        ...metadata,
        type: 'support',
      },
    })

    return NextResponse.json({ url: paymentLink.url })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create payment link',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
