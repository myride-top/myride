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
  metadata?: Record<string, any>
  mode?: 'payment' | 'subscription'
  allowPromotionCodes?: boolean
  billingAddressCollection?: 'auto' | 'required'
}

export interface PaymentLinkOptions {
  amount: number
  name: string
  description: string
  redirectUrl: string
  metadata?: Record<string, any>
}

export class PaymentService {
  static async createCheckoutSession(options: PaymentSessionOptions) {
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
        userId,
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
    const { amount, name, description, redirectUrl, metadata = {} } = options

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
