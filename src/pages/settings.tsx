
// src/pages/settings.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Sidebar } from '../components/Sidebar';
import { ProfileSection } from '../components/settings/ProfileSection';
import { SubscriptionSection } from '../components/settings/SubscriptionSection';
import { PaymentMethodsSection } from '../components/settings/PaymentMethodsSection';
import { NotificationSection } from '../components/settings/NotificationSection';
import { AccountSection } from '../components/settings/AccountSection';
import { Layout } from '../components/Layout';
import axios from 'axios';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get('/api/user/profile');
        setUserData(data);
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'payment-methods', label: 'Payment Methods' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'account', label: 'Account' },
  ];

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return <ProfileSection userData={userData} />;
      case 'subscription':
        return <SubscriptionSection userData={userData} />;
      case 'payment-methods':
        return <PaymentMethodsSection userData={userData} />;
      case 'notifications':
        return <NotificationSection userData={userData} />;
      case 'account':
        return <AccountSection userData={userData} />;
      default:
        return <ProfileSection userData={userData} />;
    }
  };

  return (
    <Layout title="Account Settings">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="px-4 py-5 sm:p-6">{renderTabContent()}</div>
        </div>
      </div>
    </Layout>
  );
}
