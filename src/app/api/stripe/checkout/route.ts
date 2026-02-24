import { NextRequest, NextResponse } from 'next/server'
import { createSubscriptionCheckout, createPointsCheckout, STRIPE_PRODUCTS } from '@/lib/stripe/client'
import { getAuthUser } from '@/lib/supabase/server'

// Subscription plan prices
const SUBSCRIPTION_PRICES = {
  starter: STRIPE_PRODUCTS.starter,
  pro: STRIPE_PRODUCTS.pro,
  enterprise: STRIPE_PRODUCTS.enterprise,
} as const

// Points package prices
const POINTS_PRICES = STRIPE_PRODUCTS.points

// Points mapping
const POINTS_MAP: Record<string, number> = {
  small: 5000,
  medium: 15000,
  large: 50000,
  xlarge: 150000,
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, plan, billingCycle, pointsPackage } = body

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${origin}/pricing?success=true`
    const cancelUrl = `${origin}/pricing?canceled=true`

    let session

    if (type === 'subscription') {
      // Validate plan
      const validPlans = ['starter', 'pro', 'enterprise'] as const
      if (!validPlans.includes(plan)) {
        return NextResponse.json(
          { error: 'Invalid plan' },
          { status: 400 }
        )
      }

      // Validate billing cycle
      const validCycles = ['monthly', 'yearly'] as const
      if (!validCycles.includes(billingCycle)) {
        return NextResponse.json(
          { error: 'Invalid billing cycle' },
          { status: 400 }
        )
      }

      const planPrices = SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES]
      const priceId = planPrices[billingCycle as 'monthly' | 'yearly']
      
      if (!priceId) {
        return NextResponse.json(
          { error: 'Price not configured' },
          { status: 400 }
        )
      }

      session = await createSubscriptionCheckout({
        userId: user.id,
        userEmail: user.email || '',
        priceId,
        successUrl,
        cancelUrl,
      })
    } else if (type === 'points') {
      // Validate points package
      const validPackages = ['small', 'medium', 'large', 'xlarge'] as const
      if (!validPackages.includes(pointsPackage)) {
        return NextResponse.json(
          { error: 'Invalid points package' },
          { status: 400 }
        )
      }

      const priceId = POINTS_PRICES[pointsPackage as keyof typeof POINTS_PRICES]
      
      if (!priceId) {
        return NextResponse.json(
          { error: 'Price not configured' },
          { status: 400 }
        )
      }

      session = await createPointsCheckout({
        userId: user.id,
        userEmail: user.email || '',
        priceId,
        points: POINTS_MAP[pointsPackage],
        successUrl,
        cancelUrl,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid checkout type' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
