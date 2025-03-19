// src/components/settings/AccountSection.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface AccountSectionProps {
  userData: any; // Replace 'any' with a more specific type if available
}

export const AccountSection = ({ userData }: { userData: any }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword({
        ...password,
        [e.target.name]: e.target.value
      });
    };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/api/user/change-password', {
        currentPassword: password.current,
        newPassword: password.new,
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPassword({ current: '', new: '', confirm: '' });
      setIsChangingPassword(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    if (!confirm('All your data will be permanently deleted. Type "DELETE" to confirm.')) {
      return;
    }
    
    setIsLoading(true);

    try {
      await axios.delete('/api/user/account');
      // Log the user out and redirect to home page
      localStorage.removeItem('token');
      router.push('/');
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete account' 
      });
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
      
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

      <div className="space-y-6">
        {/* Change Password Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Change password</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Update your password for enhanced security.</p>
            </div>
            
            {!isChangingPassword ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change password
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="mt-5 sm:flex sm:items-center">
                <div className="w-full sm:max-w-md space-y-4">
                  <div>
                    <label htmlFor="current" className="sr-only">Current Password</label>
                    <input
                      id="current"
                      name="current"
                      type="password"
                      required
                      value={password.current}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Current password"
                    />
                  </div>
                  <div>
                    <label htmlFor="new" className="sr-only">New Password</label>
                    <input
                      id="new"
                      name="new"
                      type="password"
                      required
                      value={password.new}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="New password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm" className="sr-only">Confirm New Password</label>
                    <input
                      id="confirm"
                      name="confirm"
                      type="password"
                      required
                      value={password.confirm}
                      onChange={handlePasswordChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPassword({ current: '', new: '', confirm: '' });
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isLoading ? 'Updating...' : 'Update password'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Export Data Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Export your data</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Download a copy of your data including watchlists, alerts, and settings.</p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => {/* Implement data export */}}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Export data
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete your account</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Once you delete your account, you will lose all data associated with it.
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isLoading ? 'Processing...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
