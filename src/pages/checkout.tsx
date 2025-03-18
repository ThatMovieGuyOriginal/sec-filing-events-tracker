// src/pages/checkout.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
// Need to install: npm install @stripe/stripe-js @stripe/react-stripe-js
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe outside of component render to avoid recreating Stripe on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Checkout form component
const CheckoutForm = ({ planId, billingInterval }: { planId: string, billingInterval: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  // Fetch payment intent when component mounts
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const fetchPaymentIntent = async () => {
      try {
        const { data } = await axios.post('/api/create-payment-intent', {
          planId,
          billingInterval,
        });
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Failed to load checkout. Please try again.');
      }
    };

    fetchPaymentIntent();
  }, [planId, billingInterval]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    // Create payment method
    const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (paymentMethodError) {
      setError(paymentMethodError.message || 'An error occurred');
      setProcessing(false);
      return;
    }

    // Confirm payment with the client secret
    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });

    if (confirmError) {
      setError(confirmError.message || 'An error occurred');
      setProcessing(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      // Payment successful, redirect to success page
      router.push('/checkout/success');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-md shadow-sm">
        <div className="p-4 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 px-5 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Subscribe now'}
      </button>
    </form>
  );
};

// Main checkout page
export default function Checkout() {
  const router = useRouter();
  const { plan, billing } = router.query;
  
  const plans = {
    basic: {
      name: 'Basic Plan',
      description: 'Essential tools for individual investors',
      price: { monthly: '$19', annual: '$199' },
    },
    pro: {
      name: 'Pro Plan',
      description: 'Advanced features for serious investors',
      price: { monthly: '$49', annual: '$499' },
    },
    enterprise: {
      name: 'Enterprise Plan',
      description: 'Complete solution for professional teams',
      price: { monthly: '$149', annual: '$1,490' },
    },
  };
  
  const selectedPlan = plan && typeof plan === 'string' && plans[plan] ? plans[plan] : null;
  const billingInterval = billing === 'annual' ? 'annual' : 'monthly';

  if (!selectedPlan) {
    // Redirect to pricing page if no valid plan is selected
    if (typeof window !== 'undefined') {
      router.push('/pricing');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Checkout | SEC Filing Events Tracker</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete your subscription
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          You're subscribing to the {selectedPlan.name} with {billingInterval} billing
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">
                {selectedPlan.name} ({billingInterval})
              </span>
              <span className="text-base font-medium text-gray-900">
                {selectedPlan.price[billingInterval]}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{selectedPlan.description}</p>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm planId={plan as string} billingInterval={billingInterval} />
          </Elements>
        </div>
      </div>
    </div>
  );
}
