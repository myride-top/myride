import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { userId, customerEmail } = await request.json()

    console.log('Creating car slot payment session:', {
      userId,
      customerEmail,
    })

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session for car slot purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Additional Car Slot',
              description: 'Purchase an additional car slot for MyRide',
              images: ['https://myride.top/og-image-default.svg'], // Add your product image
            },
            unit_amount: 100, // $1.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${
        process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
      }/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_APP_URL || 'https://myride.top'
      }/dashboard`,
      metadata: {
        type: 'car_slot',
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

    console.log('Car slot payment session created successfully:', session.id)
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating car slot payment session:', error)

    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to create car slot payment session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
