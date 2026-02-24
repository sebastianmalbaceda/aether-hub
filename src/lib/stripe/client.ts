import Stripe from 'stripe'

// Lazy initialization of Stripe client
let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  }
  return stripeClient
}

// Export for convenience (will throw if used without STRIPE_SECRET_KEY)
export const stripe = new Proxy<Stripe>({} as Stripe, {
  get(target, prop) {
    const client = getStripeClient()
    return client[prop as keyof Stripe]
  },
})

// Stripe product and price IDs
export const STRIPE_PRODUCTS = {
  // Subscription plans
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '',
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
  },
  enterprise: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || '',
  },
  // Point packages
  points: {
    small: process.env.STRIPE_POINTS_SMALL_PRICE_ID || '',
    medium: process.env.STRIPE_POINTS_MEDIUM_PRICE_ID || '',
    large: process.env.STRIPE_POINTS_LARGE_PRICE_ID || '',
    xlarge: process.env.STRIPE_POINTS_XLARGE_PRICE_ID || '',
  },
}

// Helper to format amount for Stripe (cents)
export function formatAmountForStripe(amount: number, currency: string = 'usd'): number {
  return Math.round(amount * 100)
}

// Helper to format amount from Stripe (cents to dollars)
export function formatAmountFromStripe(amount: number, currency: string = 'usd'): number {
  return amount / 100
}

// Create a checkout session for subscription
export async function createSubscriptionCheckout({
  userId,
  userEmail,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  const client = getStripeClient()
  const session = await client.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  })

  return session
}

// Create a checkout session for one-time purchase (points)
export async function createPointsCheckout({
  userId,
  userEmail,
  priceId,
  points,
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  priceId: string
  points: number
  successUrl: string
  cancelUrl: string
}) {
  const client = getStripeClient()
  const session = await client.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      points: points.toString(),
      type: 'points_purchase',
    },
  })

  return session
}

// Create a customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const client = getStripeClient()
  const session = await client.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  const client = getStripeClient()
  return client.subscriptions.retrieve(subscriptionId)
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  const client = getStripeClient()
  return client.subscriptions.cancel(subscriptionId)
}

// Update subscription
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  const client = getStripeClient()
  const subscription = await client.subscriptions.retrieve(subscriptionId)
  
  return client.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'always_invoice',
  })
}

// Get invoice
export async function getInvoice(invoiceId: string) {
  const client = getStripeClient()
  return client.invoices.retrieve(invoiceId)
}

// List invoices for a customer
export async function listInvoices(customerId: string, limit: number = 10) {
  const client = getStripeClient()
  return client.invoices.list({
    customer: customerId,
    limit,
  })
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  const client = getStripeClient()
  return client.webhooks.constructEvent(payload, signature, secret)
}
