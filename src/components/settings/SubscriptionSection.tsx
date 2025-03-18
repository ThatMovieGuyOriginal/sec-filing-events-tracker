// src/components/settings/SubscriptionSection.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const SubscriptionSection = ({ userData }: { userData: any }) => {
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
          </div>
          
          <div className="mt-4 sm:mt-0">
            {subscriptionTier === 'free' ? (
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upgrade Plan
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleUpgrade}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Plan
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-red-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Plan Features:</h4>
          <ul className="space-y-1">
            {currentTier.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Billing History</h3>
        
        {subscriptionTier === 'free' ? (
          <p className="text-gray-500">No billing history available for free plan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Example data - would be replaced with actual billing history */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">March 1, 2023</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$49.00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href="#" className="text-blue-600 hover:text-blue-900">Download</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
