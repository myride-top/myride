import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        )
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        )
        break

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle successful checkout sessions
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const { type } = session.metadata || {}

  try {
    if (type === 'support') {
      // Handle support payment
      await handleSupportPayment(session)
    } else if (type === 'premium') {
      // Handle premium purchase
      await handlePremiumPurchase(session)
    } else if (type === 'car_slot') {
      // Handle car slot purchase
      await handleCarSlotPurchase(session)
    } else {
    }
  } catch (error) {}
}

// Handle successful payment intents
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {}

// Handle failed payment intents
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {}

// Handle support payments
async function handleSupportPayment(session: Stripe.Checkout.Session) {
  const { supportType, amount } = session.metadata || {}

  // TODO: Implement support payment processing
  // - Send thank you email
  // - Log support for analytics
  // - Update user profile if needed
}

// Handle premium purchases
async function handlePremiumPurchase(session: Stripe.Checkout.Session) {
  const { userId } = session.metadata || {}

  if (userId) {
    try {
      // Import the premium client function
      const { activatePremiumUser } = await import(
        '@/lib/database/premium-client'
      )

      // Activate premium status for the user
      const success = await activatePremiumUser(
        userId,
        session.customer as string
      )

      if (success) {
        // TODO: Send welcome email
        // await sendPremiumWelcomeEmail(userId)
      } else {
      }
    } catch (error) {}
  }
}

// Handle car slot purchases
async function handleCarSlotPurchase(session: Stripe.Checkout.Session) {
  const { userId } = session.metadata || {}

  if (userId) {
    try {
      // Import the premium client function
      const { addCarSlot } = await import('@/lib/database/premium-client')

      // Add one car slot to the user
      const success = await addCarSlot(userId)

      if (success) {
        // TODO: Send confirmation email
        // await sendCarSlotConfirmationEmail(userId)
      } else {
      }
    } catch (error) {}
  }
}
