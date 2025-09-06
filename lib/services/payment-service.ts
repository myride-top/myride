import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

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

export interface PaymentLinkOptions {
  amount: number
  name: string
  description: string
  redirectUrl: string
  metadata?: Record<string, string | number | boolean | null>
  userId?: string
}

export class PaymentService {
  static async createCheckoutSession(options: PaymentSessionOptions) {
    // Validate required fields
    if (!options.amount || options.amount <= 0) {
      throw new Error('Invalid amount')
    }
    if (!options.name || options.name.trim().length === 0) {
      throw new Error('Product name is required')
    }
    if (!options.successUrl || !options.cancelUrl) {
      throw new Error('Success and cancel URLs are required')
    }
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name,
              description,
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
        userId: userId || null,
        platform: 'myride',
      },
      customer_email: customerEmail,
      allow_promotion_codes: allowPromotionCodes,
      billing_address_collection: billingAddressCollection,
      shipping_address_collection: {
        allowed_countries: [], // No shipping needed for digital products
      },
    })

    return session
  }

  static async createPaymentLink(options: PaymentLinkOptions) {
    // Validate required fields
    if (!options.amount || options.amount <= 0) {
      throw new Error('Invalid amount')
    }
    if (!options.name || options.name.trim().length === 0) {
      throw new Error('Product name is required')
    }
    if (!options.redirectUrl) {
      throw new Error('Redirect URL is required')
    }

    const {
      amount,
      name,
      description,
      redirectUrl,
      metadata = {},
      userId,
    } = options

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name,
              description,
              images: ['https://myride.top/icon.jpg'],
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
        userId: userId || null,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: redirectUrl,
        },
      },
    })

    return paymentLink
  }
}
