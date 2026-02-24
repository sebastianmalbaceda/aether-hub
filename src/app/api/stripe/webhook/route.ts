import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyWebhookSignature, stripe } from '@/lib/stripe/client'
import { prisma } from '@/lib/prisma'
import { BillingMiddleware } from '@/lib/billing/middleware'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId
  
  if (!userId) {
    console.error('No userId in checkout session')
    return
  }

  // Handle points purchase
  if (session.mode === 'payment' && session.metadata?.type === 'points_purchase') {
    const points = parseInt(session.metadata.points, 10)
    
    if (points > 0) {
      await BillingMiddleware.creditPoints(
        userId,
        points,
        'PURCHASE_POINTS',
        `Purchased ${points} points`,
        session.payment_intent as string
      )
    }
  }

  // Update user with Stripe customer ID if new
  if (session.customer && typeof session.customer === 'string') {
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: session.customer },
    })
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('No userId in subscription')
    return
  }

  // Get plan from price ID
  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanFromPriceId(priceId)

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      planId: plan,
      status: subscription.status.toUpperCase() as any,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })

  // Credit initial points for subscription
  const planPoints: Record<string, number> = {
    starter: 5000,
    pro: 15000,
    enterprise: 50000,
  }

  const points = planPoints[plan] || 0
  if (points > 0) {
    await BillingMiddleware.creditPoints(
      userId,
      points,
      'SUBSCRIPTION_CREDIT',
      `Monthly points credit for ${plan} plan`
    )
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const existingSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!existingSub) {
    console.error('Subscription not found:', subscription.id)
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanFromPriceId(priceId)

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      planId: plan,
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELLED',
      cancelAtPeriodEnd: false,
    },
  })
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  )

  const userId = subscription.metadata?.userId
  if (!userId) return

  // Credit monthly points on successful payment
  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanFromPriceId(priceId)

  const planPoints: Record<string, number> = {
    starter: 5000,
    pro: 15000,
    enterprise: 50000,
  }

  const points = planPoints[plan] || 0
  if (points > 0) {
    await BillingMiddleware.creditPoints(
      userId,
      points,
      'SUBSCRIPTION_CREDIT',
      `Monthly points credit for ${plan} plan`,
      invoice.payment_intent as string
    )
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  // Update subscription status
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: invoice.subscription as string },
    data: { status: 'PAST_DUE' },
  })

  // TODO: Send notification to user about failed payment
}

function getPlanFromPriceId(priceId: string | undefined): string {
  if (!priceId) return 'starter'

  // Map price IDs to plan names
  // This would typically come from database or config
  const priceToPlan: Record<string, string> = {
    [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '']: 'starter',
    [process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '']: 'starter',
    [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '']: 'pro',
    [process.env.STRIPE_PRO_YEARLY_PRICE_ID || '']: 'pro',
    [process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '']: 'enterprise',
    [process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || '']: 'enterprise',
  }

  return priceToPlan[priceId] || 'starter'
}
