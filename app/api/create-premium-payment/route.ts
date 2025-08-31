import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

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

    // Create Stripe Checkout Session for premium purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MyRide Premium',
              description: 'Lifetime premium access to MyRide features',
              images: ['https://myride.top/icon.jpg'], // Add your premium product image
            },
            unit_amount: 1000, // $10.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${
        process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
      }/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
      }/premium`,
      metadata: {
        type: 'premium',
        userId: userId,
        platform: 'myride',
      },
      customer_email: customerEmail, // Pre-fill customer email if available
      allow_promotion_codes: true, // Allow discount codes
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: [], // No shipping needed for digital product
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    // Log more detailed error information
    if (error instanceof Error) {
    }

    return NextResponse.json(
      {
        error: 'Failed to create premium payment session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
