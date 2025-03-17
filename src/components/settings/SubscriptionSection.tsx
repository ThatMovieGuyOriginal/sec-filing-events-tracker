// src/components/settings/SubscriptionSection.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const SubscriptionSection = ({ userData }) => {
  const router = useRouter();
  const subscription = userData?.activeSubscription;
  const subscriptionTier = userData?.subscriptionTier || 'free';
  const subscriptionEnd = userData?.subscriptionEnd 
    ? new Date(userData.subscriptionEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      try {
        await fetch('/api/user/subscription/cancel', {
          method: 'POST',
        });
        alert('Subscription cancelled successfully');
        // Refresh data
        router.reload();
      } catch (error) {
        alert('Failed to cancel subscription');
      }
    }
  };

  const tierInfo = {
    free: {
      name: 'Free Plan',
      description: 'Basic access with ads',
      features: [
        'Limited SEC filing access',
        'Basic event tracking',
        'Ad-supported experience',
      ]
    },
    basic: {
      name: 'Basic Plan',
      description: 'Essential tools for individual investors',
      features: [
        'Real-time SEC filing tracking',
        'Basic event notifications',
        'Ad-free experience',
        'Limited historical data (3 months)',
        'Up to 5 company watchlists',
      ]
    },
    pro: {
      name: 'Pro Plan',
      description: 'Advanced features for serious investors',
      features: [
        'Everything in Basic',
        'Advanced event analytics',
        'Full historical data',
        'Custom event filters',
        'Unlimited watchlists',
        'Priority email support',
      ]
    },
    enterprise: {
      name: 'Enterprise Plan',
      description: 'Complete solution for professional teams',
      features: [
        'Everything in Pro',
        'Team collaboration features',
        'Dedicated account manager',
        'Custom integrations',
        'Unlimited API access',
      ]
    }
  };

  const currentTier = tierInfo[subscriptionTier] || tierInfo.free;

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Management</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{currentTier.name}</h3>
            <p className="text-gray-600 mt-1">{currentTier.description}</p>
            
            {subscriptionEnd && subscriptionTier !== 'free' && (
              <p className="mt-2 text-sm text-gray-500">
                Your subscription {subscription?.status === 'active' ? 'renews' : 'expires'} on{' '}
                <span className="font-medium">{subscriptionEnd}</span>
              </p>
            )}
          
