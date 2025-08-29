import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { amount, description, metadata } = await request.json()

    console.log('Creating payment link with:', {
      amount,
      description,
      metadata,
    })

    // Validate amount
    if (!amount || amount < 100) {
      // Minimum $1.00 (100 cents)
      return NextResponse.json(
        { error: 'Invalid amount. Minimum is $1.00' },
        { status: 400 }
      )
    }

    // Create Stripe Payment Link with simplified configuration
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support MyRide',
              description: description || 'Support for MyRide development',
              images: ['https://myride.top/icon.jpg'],
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        ...metadata,
        type: 'support',
        platform: 'myride',
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${
            process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
          }/support/thank-you`,
        },
      },
    })

    console.log('Payment link created successfully:', paymentLink.url)
    return NextResponse.json({ url: paymentLink.url })
  } catch (error) {
    console.error('Error creating payment link:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to create payment link',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
