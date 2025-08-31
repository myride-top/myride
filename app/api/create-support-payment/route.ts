import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/services/payment-service'

export async function POST(request: NextRequest) {
  try {
    const { amount, description, metadata } = await request.json()

    // Validate amount
    if (!amount || amount < 100) {
      // Minimum $1.00 (100 cents)
      return NextResponse.json(
        { error: 'Invalid amount. Minimum is $1.00' },
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
