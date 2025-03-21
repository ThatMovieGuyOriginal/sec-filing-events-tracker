// src/pages/api/create-payment-intent.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../lib/middleware/auth';
import { prisma } from '../../lib/database';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16', // Use the compatible API version
});

// Define union types for valid plan IDs and billing intervals
type Plan = 'basic' | 'pro' | 'enterprise';
type BillingInterval = 'monthly' | 'annual';

// Extend NextApiRequest with a user property (provided by withAuth middleware)
interface AuthenticatedNextApiRequest extends NextApiRequest {
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}

// Get actual plan prices using union types
const getPlanPrice = (planId: Plan, billingInterval: BillingInterval): number => {
  const prices: Record<Plan, Record<BillingInterval, number>> = {
    basic: { monthly: 19, annual: 199 },
    pro: { monthly: 49, annual: 499 },
    enterprise: { monthly: 149, annual: 1490 },
  };

  return prices[planId][billingInterval] || 0;
};

async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { planId, billingInterval } = req.body;
  const userId = req.user?.id;

  // Validate that planId and billingInterval are among the allowed values
  if (
    !planId ||
    !billingInterval ||
    !(['basic', 'pro', 'enterprise'] as Plan[]).includes(planId) ||
    !(['monthly', 'annual'] as BillingInterval[]).includes(billingInterval)
  ) {
    return res.status(400).json({ message: 'Invalid plan ID or billing interval' });
  }

  try {
    // Get or create Stripe customer
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Calculate the price based on plan and billing interval
    const price = getPlanPrice(planId as Plan, billingInterval as BillingInterval);

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100, // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        planId,
        billingInterval,
        userId,
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
