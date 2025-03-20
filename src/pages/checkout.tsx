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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

// Rest of the file is fine...
