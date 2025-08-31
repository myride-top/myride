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

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create car slot payment session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
