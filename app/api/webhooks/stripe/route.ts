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
  } catch {
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
  } catch {
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
  } catch {}
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
    // Log support payment for analytics
    if (userId && supportType && amount) {
      const { logSupportPayment } = await import(
        '@/lib/database/support-client'
      )
      await logSupportPayment(userId, supportType, parseFloat(amount))
    }

    // Send thank you email
    if (session.customer_email) {
      const { sendSupportThankYouEmail } = await import('@/lib/services/email')
      await sendSupportThankYouEmail(
        session.customer_email,
        supportType || 'general'
      )
    }

    // Update user profile if needed (e.g., mark as supporter)
    if (userId) {
      const { markUserAsSupporter } = await import(
        '@/lib/database/profiles-client'
      )
      await markUserAsSupporter(userId, supportType || 'general')
    }
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
    } catch {}
  }
}
