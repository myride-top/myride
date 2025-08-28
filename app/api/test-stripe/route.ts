import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function GET() {
  try {
    // Test Stripe connection by fetching account details
    const account = await stripe.accounts.retrieve()
    
    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        business_type: account.business_type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      }
    })
  } catch (error) {
    console.error('Stripe test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasKey: !!process.env.STRIPE_SECRET_KEY,
      keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...'
    }, { status: 500 })
  }
}
