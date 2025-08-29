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
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`Received webhook event: ${event.type}`)

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
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
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
  console.log('Payment successful:', {
    sessionId: session.id,
    customerId: session.customer,
    amount: session.amount_total,
    metadata: session.metadata,
    paymentStatus: session.payment_status,
  })

  const { type } = session.metadata || {}

  try {
    if (type === 'support') {
      // Handle support payment
      await handleSupportPayment(session)
    } else if (type === 'premium') {
      // Handle premium purchase
      await handlePremiumPurchase(session)
    } else {
      console.log('Unknown payment type:', type)
    }
  } catch (error) {
    console.error('Error handling checkout session:', error)
  }
}

// Handle successful payment intents
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log('PaymentIntent was successful:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata,
  })
}

// Handle failed payment intents
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    lastPaymentError: paymentIntent.last_payment_error,
  })
}

// Handle support payments
async function handleSupportPayment(session: Stripe.Checkout.Session) {
  const { supportType, amount } = session.metadata || {}

  console.log('Processing support payment:', {
    supportType,
    amount,
    sessionId: session.id,
  })

  // TODO: Implement support payment processing
  // - Send thank you email
  // - Log support for analytics
  // - Update user profile if needed
}

// Handle premium purchases
async function handlePremiumPurchase(session: Stripe.Checkout.Session) {
  const { userId } = session.metadata || {}

  console.log('Processing premium purchase:', {
    userId,
    sessionId: session.id,
    amount: session.amount_total,
  })

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
        console.log(`Premium activated for user: ${userId}`)
        // TODO: Send welcome email
        // await sendPremiumWelcomeEmail(userId)
      } else {
        console.error(`Failed to activate premium for user: ${userId}`)
      }
    } catch (error) {
      console.error('Error activating premium user:', error)
    }
  }
}
