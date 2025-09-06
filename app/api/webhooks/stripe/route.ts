import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  webhookRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

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
        console.log(`Unhandled event type: ${event.type}`)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing failed:', error)
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

// Handle support payments
async function handleSupportPayment(session: Stripe.Checkout.Session) {
  const { supportType, amount, userId } = session.metadata || {}

  try {
    console.log('Processing support payment:', {
      supportType,
      amount,
      userId,
      sessionId: session.id,
    })

    if (!userId) {
      console.error('No userId found in support payment metadata')
      return
    }

    const paymentAmount = session.amount_total || parseFloat(amount || '0')
    const supportTypeValue = supportType || 'general'

    // Create support transaction record
    const { createSupportTransaction } = await import(
      '@/lib/database/support-client'
    )

    // For support payments, we'll use a default creator ID or the platform ID
    // You may want to modify this based on your business logic
    const platformCreatorId = 'platform' // or get from session metadata

    const transaction = await createSupportTransaction(
      userId,
      platformCreatorId,
      paymentAmount / 100, // Convert from cents to dollars
      session.payment_intent as string
    )

    if (!transaction) {
      console.error('Failed to create support transaction')
      return
    }

    console.log('Support transaction created:', transaction.id)

    // Log support payment for analytics
    const { logSupportPayment } = await import('@/lib/database/support-client')
    await logSupportPayment(userId, supportTypeValue, paymentAmount / 100)

    // Send thank you email
    if (session.customer_email) {
      const { sendSupportThankYouEmail } = await import('@/lib/services/email')
      await sendSupportThankYouEmail(session.customer_email, supportTypeValue)
    }

    console.log('Support payment processed successfully for user:', userId)
  } catch (error) {
    console.error('Error processing support payment:', error)
  }
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
        console.error('Failed to activate premium for user:', userId)
      }
    } catch {}
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
        console.error('Failed to add car slot for user:', userId)
      }
    } catch (error) {
      console.error('Error processing car slot purchase:', error)
    }
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
