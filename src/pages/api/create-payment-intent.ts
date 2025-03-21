// src/pages/api/create-payment-intent.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../lib/middleware/auth';
import { prisma } from '../../lib/database';
// Need to install: npm install stripe
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16', // Use the compatible API version
});

// Get actual plan prices
const getPlanPrice = (planId: string, billingInterval: string): number => {
  const prices = {
    basic: { monthly: 19, annual: 199 },
    pro: { monthly: 49, annual: 499 },
    enterprise: { monthly: 149, annual: 1490 },
  };

  return prices[planId]?.[billingInterval] || 0;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { planId, billingInterval } = req.body;
  const userId = req.user?.id;

  if (!planId || !billingInterval) {
    return res.status(400).json({ message: 'Plan ID and billing interval are required' });
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
    const price = getPlanPrice(planId, billingInterval);

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
