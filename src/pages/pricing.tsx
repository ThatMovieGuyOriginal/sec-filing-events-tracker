// src/pages/pricing.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Sidebar } from '../components/Sidebar';
import { PricingBox } from '../components/PricingBox';

export default function Pricing() {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  
  // Plans data
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Essential tools for individual investors',
      price: { monthly: '$19', annual: '$199' },
      features: [
        'Real-time SEC filing tracking',
        'Basic event notifications',
        'Ad-free experience',
        'Limited historical data (3 months)',
        'Up to 5 company watchlists',
        'Email alerts for watched companies'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Advanced features for serious investors',
      price: { monthly: '$49', annual: '$499' },
      features: [
        'Everything in Basic',
        'Advanced event analytics',
        'Full historical data',
        'Custom event filters',
        'Unlimited watchlists',
        'Priority email support',
        'Excel/CSV export',
        'API access (100 requests/day)'
      ],
      cta: 'Go Pro',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Complete solution for professional teams',
      price: { monthly: '$149', annual: '$1,490' },
      features: [
        'Everything in Pro',
        'Team collaboration features',
        'Dedicated account manager',
        'Custom integrations',
        'Unlimited API access',
        'White-labeled reports',
        'Custom event detection',
        'Phone support'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  // Calculate savings for annual billing
  const calculateSavings = (plan: any): number => {
    const monthlyPrice = parseInt(plan.price.monthly.replace('$', '').replace(',', ''));
    const annualPrice = parseInt(plan.price.annual.replace('$', '').replace(',', ''));
    const annualAsMonthly = annualPrice / 12;
    const savings = monthlyPrice - annualAsMonthly;
    const savingsPercentage = Math.round((savings / monthlyPrice) * 100);
    return savingsPercentage;
  };

  // Handle subscription purchase
  const handleSubscribe = (planId: string) => {
    if (planId === 'enterprise') {
      router.push('/contact-sales');
    } else {
      router.push(`/checkout?plan=${planId}&billing=${billingInterval}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Head>
        <title>Pricing | SEC Filing Events Tracker</title>
        <meta name="description" content="Choose the right plan for your investment needs" />
      </Head>

      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Plans for every investor
            </h1>
            <p className="mt-5 text-xl text-gray-500 mx-auto max-w-3xl">
              Choose the perfect plan to help you monitor SEC filings and stay ahead of market-moving events.
            </p>
          </div>

          <div className="mt-12 mb-8 flex justify-center">
            <div className="relative bg-white rounded-lg p-0.5 flex">
              <button
                type="button"
                className={`${
                  billingInterval === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'
                } relative py-2 px-6 border border-transparent rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 sm:w-auto sm:px-8`}
                onClick={() => setBillingInterval('monthly')}
              >
                Monthly billing
              </button>
              <button
                type="button"
                className={`${
                  billingInterval === 'annual' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'
                } ml-0.5 relative py-2 px-6 border border-transparent rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 sm:w-auto sm:px-8`}
                onClick={() => setBillingInterval('annual')}
              >
                Annual billing
                <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Save 16%
                </span>
              </button>
            </div>
          </div>

          <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`relative flex flex-col rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'border-2 border-blue-500' : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-bold uppercase">
                    Most Popular
                  </div>
                )}
                <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">{plan.name}</h3>
                    <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {billingInterval === 'monthly' ? plan.price.monthly : plan.price.annual}
                      </span>
                      <span className="ml-2 text-base font-medium text-gray-500">
                        /{billingInterval === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {billingInterval === 'annual' && (
                      <p className="mt-1 text-sm text-green-600">
                        Save {calculateSavings(plan)}% with annual billing
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-50 space-y-6 sm:p-10 sm:pt-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`block w-full ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500'
                      } rounded-md py-3 px-5 text-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="mt-8 space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Can I cancel my subscription?</h3>
                <p className="mt-2 text-gray-600">Yes, you can cancel anytime. If you cancel, your subscription will remain active until the end of your current billing period.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">How do I change my plan?</h3>
                <p className="mt-2 text-gray-600">You can upgrade or downgrade your plan at any time through your account settings. Changes take effect immediately or at the end of your billing cycle.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Is there a free trial?</h3>
                <p className="mt-2 text-gray-600">Yes, all paid plans come with a 14-day free trial. No credit card required to start your trial.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">What payment methods do you accept?</h3>
                <p className="mt-2 text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
