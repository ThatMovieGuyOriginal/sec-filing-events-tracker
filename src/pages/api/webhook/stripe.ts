// src/pages/api/webhook/stripe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { prisma } from '../../../lib/database';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Get the Stripe webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
    } catch (err) {
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { planId, billingInterval, userId } = paymentIntent.metadata;

  // Create a transaction record
  await prisma.transaction.create({
    data: {
      userId,
      amount: paymentIntent.amount / 100, // Convert cents to dollars
      currency: paymentIntent.currency.toUpperCase(),
      status: 'completed',
      description: `Payment for ${planId} plan (${billingInterval})`,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  // Update user's subscription tier
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: planId,
      subscriptionEnd: billingInterval === 'monthly' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
    },
  });
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { userId } = paymentIntent.metadata;

  // Create a failed transaction record
  await prisma.transaction.create({
    data: {
      userId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'failed',
      description: 'Failed payment',
      stripePaymentIntentId: paymentIntent.id,
    },
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Handle subscription creation (mainly handled by payment_intent.succeeded)
  console.log('Subscription created:', subscription.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find user with this stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for Stripe customer ID:', customerId);
    return;
  }

  // Update subscription status
  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  
  // Find the subscription item to get the plan
  const item = subscription.items.data[0];
  const priceId = item.price.id;
  
  // Map price ID to plan tier (you would need to maintain this mapping)
  const priceToPlan = {
    'price_basic_monthly': 'basic',
    'price_basic_annual': 'basic',
    'price_pro_monthly': 'pro',
    'price_pro_annual': 'pro',
    'price_enterprise_monthly': 'enterprise',
    'price_enterprise_annual': 'enterprise',
  };
  
  const planTier = priceToPlan[priceId] || 'basic';
  
  // Update user and subscription in database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: status === 'active' ? planTier : 'free',
      subscriptionEnd: status === 'active' ? currentPeriodEnd : null,
    },
  });

  // Update or create subscription record
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status,
      endDate: currentPeriodEnd,
      tier: planTier,
    },
    create: {
      userId: user.id,
      tier: planTier,
      price: item.price.unit_amount ? item.price.unit_amount / 100 : 0,
      status,
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: currentPeriodEnd,
      renewalDate: currentPeriodEnd,
      interval: item.plan.interval,
      stripeSubscriptionId: subscription.id,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as cancelled in database
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date(),
    },
  });
  
  // Find user with this subscription
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    select: { userId: true },
  });
  
  if (sub) {
    // Downgrade user to free tier after subscription ends
    await prisma.user.update({
      where: { id: sub.userId },
      data: {
        subscriptionTier: 'free',
      },
    });
  }
}
