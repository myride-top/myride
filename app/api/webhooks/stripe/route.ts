import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  webhookRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'
import { getStripeClient, getWebhookSecret } from '@/lib/services/stripe-client'

const stripe = getStripeClient()
const endpointSecret = getWebhookSecret()

export async function POST(request: NextRequest) {
  // Apply rate limiting for webhooks
  const rateLimitResult = webhookRateLimit.isAllowed(request)
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  }
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Log webhook event for debugging (without sensitive data)
    console.log('Processing webhook event:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
    })

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

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`, {
          eventId: event.id,
        })
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing failed:', {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
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
    if (type === 'premium') {
      // Handle premium purchase
      await handlePremiumPurchase(session)
    } else if (type === 'car_slot') {
      // Handle car slot purchase
      await handleCarSlotPurchase(session)
    } else {
      console.log('Unknown payment type:', type)
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

// Handle successful payment intents
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    // Log successful payment for analytics
    if (paymentIntent.metadata?.userId) {
      const { logPaymentSuccess } = await import('@/lib/database/stats-client')
      await logPaymentSuccess(
        paymentIntent.metadata.userId,
        paymentIntent.amount,
        paymentIntent.metadata.type || 'unknown'
      )
    }

    // Send confirmation email for successful payment
    if (paymentIntent.receipt_email) {
      const { sendPaymentConfirmationEmail } = await import(
        '@/lib/services/email'
      )
      await sendPaymentConfirmationEmail(
        paymentIntent.receipt_email,
        paymentIntent.amount,
        paymentIntent.metadata?.type || 'payment'
      )
    }
  } catch (error) {
    console.error('Error processing successful payment intent:', error)
  }
}

// Handle failed payment intents
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Log failed payment for analytics
    if (paymentIntent.metadata?.userId) {
      const { logPaymentFailure } = await import('@/lib/database/stats-client')
      await logPaymentFailure(
        paymentIntent.metadata.userId,
        paymentIntent.amount,
        paymentIntent.metadata.type || 'unknown',
        paymentIntent.last_payment_error?.message || 'Unknown error'
      )
    }

    // Send failure notification email
    if (paymentIntent.receipt_email) {
      const { sendPaymentFailureEmail } = await import('@/lib/services/email')
      await sendPaymentFailureEmail(
        paymentIntent.receipt_email,
        paymentIntent.amount,
        paymentIntent.last_payment_error?.message || 'Payment failed'
      )
    }
  } catch (error) {
    console.error('Error processing failed payment intent:', error)
  }
}

// Removed support payment handling

// Handle premium purchases
async function handlePremiumPurchase(session: Stripe.Checkout.Session) {
  const { userId } = session.metadata || {}

  if (!userId) {
    console.error('Missing userId in session metadata for premium purchase:', {
      sessionId: session.id,
      metadata: session.metadata,
    })
    return
  }

  try {
    // Get customer ID from session
    // session.customer can be a string (customer ID), a Customer object, or null
    let stripeCustomerId: string | null = null

    if (typeof session.customer === 'string') {
      stripeCustomerId = session.customer
    } else if (session.customer && typeof session.customer === 'object' && 'id' in session.customer) {
      stripeCustomerId = session.customer.id
    } else if (!session.customer) {
      // If customer is null, try to retrieve it from the session
      // This can happen if customer was created during checkout
      const retrievedSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['customer'],
      })
      
      if (typeof retrievedSession.customer === 'string') {
        stripeCustomerId = retrievedSession.customer
      } else if (retrievedSession.customer && typeof retrievedSession.customer === 'object' && 'id' in retrievedSession.customer) {
        stripeCustomerId = retrievedSession.customer.id
      }
    }

    console.log('Processing premium purchase:', {
      userId,
      sessionId: session.id,
      stripeCustomerId,
      customerType: typeof session.customer,
    })

    // Import the server-side premium function (uses service role key)
    const { activatePremiumUserServer } = await import(
      '@/lib/database/premium-server'
    )

    // Activate premium status for the user
    const success = await activatePremiumUserServer(userId, stripeCustomerId)

    if (success) {
      console.log('Successfully activated premium for user:', userId)
      
      // Send welcome email
      try {
        const { sendPremiumWelcomeEmail } = await import(
          '@/lib/services/email'
        )
        await sendPremiumWelcomeEmail(userId)
      } catch (error) {
        console.error('Error sending premium welcome email:', error)
      }
    } else {
      console.error('Failed to activate premium for user:', {
        userId,
        stripeCustomerId,
        sessionId: session.id,
      })
    }
  } catch (error) {
    console.error('Error handling premium purchase:', {
      userId,
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}

// Handle car slot purchases
async function handleCarSlotPurchase(session: Stripe.Checkout.Session) {
  const { userId } = session.metadata || {}

  if (!userId) {
    console.error('Missing userId in session metadata for car slot purchase:', {
      sessionId: session.id,
      metadata: session.metadata,
    })
    return
  }

  try {
    console.log('Processing car slot purchase:', {
      userId,
      sessionId: session.id,
    })

    // Import the server-side premium function (uses service role key)
    const { addCarSlotServer } = await import('@/lib/database/premium-server')

    // Add one car slot to the user
    const success = await addCarSlotServer(userId)

    if (success) {
      console.log('Successfully added car slot for user:', userId)
      
      // Send confirmation email
      try {
        const { sendCarSlotConfirmationEmail } = await import(
          '@/lib/services/email'
        )
        await sendCarSlotConfirmationEmail(userId)
      } catch (error) {
        console.error('Error sending car slot confirmation email:', error)
      }
    } else {
      console.error('Failed to add car slot for user:', {
        userId,
        sessionId: session.id,
      })
    }
  } catch (error) {
    console.error('Error processing car slot purchase:', {
      userId,
      sessionId: session.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}

// Handle charge disputes
async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    // Log dispute for analytics and monitoring
    console.log('Charge dispute created:', {
      disputeId: dispute.id,
      chargeId: dispute.charge,
      amount: dispute.amount,
      reason: dispute.reason,
      status: dispute.status,
    })

    // You might want to send notifications to admin team
    // or automatically handle certain types of disputes
  } catch (error) {
    console.error('Error processing charge dispute:', error)
  }
}
