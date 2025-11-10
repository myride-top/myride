import Stripe from 'stripe'

// Singleton Stripe instance to avoid creating multiple instances
let stripeInstance: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    })
  }

  return stripeInstance
}

// Get webhook secret
export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set')
  }

  return secret
}

