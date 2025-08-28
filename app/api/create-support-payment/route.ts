import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

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

    // Create Stripe Payment Link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support MyRide',
              description: description || 'Support for MyRide development',
              images: ['https://myride.com/og-image-default.svg'], // Replace with your actual image
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
            process.env.NEXT_PUBLIC_APP_URL || 'https://myride.com'
          }/support/thank-you`,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_creation: 'always',
      payment_method_collection: 'always',
      payment_method_types: ['card', 'link', 'us_bank_account'],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP'], // Add more as needed
      },
    })

    return NextResponse.json({ url: paymentLink.url })
  } catch (error) {
    console.error('Error creating payment link:', error)
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    )
  }
}
