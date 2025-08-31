import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/services/payment-service'

export async function POST(request: NextRequest) {
  try {
    const { userId, customerEmail } = await request.json()

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const session = await PaymentService.createCheckoutSession({
      userId,
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

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create premium payment session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
