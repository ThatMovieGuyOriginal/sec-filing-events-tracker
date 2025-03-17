// src/components/settings/NotificationSection.tsx
import React, { useState } from 'react';
import axios from 'axios';

export const NotificationSection = ({ userData }) => {
  const [settings, setSettings] = useState({
    emailNotifications: userData?.preferences?.emailNotifications ?? true,
    filingAlerts: userData?.preferences?.filingAlerts ?? true,
    weeklyDigest: userData?.preferences?.weeklyDigest ?? true,
    marketingEmails: userData?.preferences?.marketingEmails ?? false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put('/api/user/preferences', {
        preferences: settings
      });
      setMessage({ type: 'success', text: 'Notification preferences updated successfully' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update notification preferences' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
      
      {message.text && (
        <div 
          className={`mb-4 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="emailNotifications"
                name="emailNotifications"
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="emailNotifications" className="font-medium text-gray-700">Email Notifications</label>
              <p className="text-gray-500">Receive notifications via email.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="filingAlerts"
                name="filingAlerts"
                type="checkbox"
                checked={settings.filingAlerts}
                onChange={() => handleToggle('filingAlerts')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="filingAlerts" className="font-medium text-gray-700">Filing Alerts</label>
              <p className="text-gray-500">Get notified when new filings are detected for your watched companies.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="weeklyDigest"
                name="weeklyDigest"
                type="checkbox"
                checked={settings.weeklyDigest}
                onChange={() => handleToggle('weeklyDigest')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="weeklyDigest" className="font-medium text-gray-700">Weekly Digest</label>
              <p className="text-gray-500">Receive a weekly summary of important events.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="marketingEmails"
                name="marketingEmails"
                type="checkbox"
                checked={settings.marketingEmails}
                onChange={() => handleToggle('marketingEmails')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="marketingEmails" className="font-medium text-gray-700">Marketing Emails</label>
              <p className="text-gray-500">Receive updates about new features and offers.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};
