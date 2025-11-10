import Stripe from 'stripe'
import { getStripeClient } from './stripe-client'

export interface PaymentSessionOptions {
  userId?: string
  customerEmail?: string
  amount: number
  name: string
  description: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string | number | boolean | null>
  mode?: 'payment' | 'subscription'
  allowPromotionCodes?: boolean
  billingAddressCollection?: 'auto' | 'required'
}

// Support payment links removed

export class PaymentService {
  static async createCheckoutSession(options: PaymentSessionOptions) {
    // Validate required fields
    if (!options.amount || options.amount <= 0) {
      throw new Error('Invalid amount: amount must be greater than 0')
    }
    
    if (options.amount < 50) {
      throw new Error('Invalid amount: minimum amount is $0.50 (50 cents)')
    }
    
    if (!options.name || options.name.trim().length === 0) {
      throw new Error('Product name is required')
    }
    
    if (options.name.length > 500) {
      throw new Error('Product name is too long (max 500 characters)')
    }
    
    if (!options.successUrl || !options.cancelUrl) {
      throw new Error('Success and cancel URLs are required')
    }
    
    // Validate URLs
    try {
      new URL(options.successUrl)
      new URL(options.cancelUrl)
    } catch {
      throw new Error('Invalid URL format for success or cancel URL')
    }
    
    // Validate email if provided
    if (options.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.customerEmail)) {
      throw new Error('Invalid email format')
    }

    const stripe = getStripeClient()
    
    const {
      userId,
      customerEmail,
      amount,
      name,
      description,
      successUrl,
      cancelUrl,
      metadata = {},
      mode = 'payment',
      allowPromotionCodes = true,
      billingAddressCollection = 'required',
    } = options

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: name.trim(),
                description: description?.trim() || '',
                images: ['https://myride.top/icon.jpg'],
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          ...metadata,
          userId: userId || '',
          platform: 'myride',
          timestamp: new Date().toISOString(),
        },
        customer_email: customerEmail,
        allow_promotion_codes: allowPromotionCodes,
        billing_address_collection: billingAddressCollection,
        shipping_address_collection: {
          allowed_countries: [], // No shipping needed for digital products
        },
      })

      return session
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new Error(`Stripe error: ${error.message}`)
      }
      throw error
    }
  }

  // createPaymentLink removed
}
