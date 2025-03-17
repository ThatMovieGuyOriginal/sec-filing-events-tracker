// src/components/settings/ProfileSection.tsx
import React, { useState } from 'react';
import axios from 'axios';

export const ProfileSection = ({ userData }) => {
  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [company, setCompany] = useState(userData?.company || '');
  const [jobTitle, setJobTitle] = useState(userData?.jobTitle || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put('/api/user/profile', {
        name,
        email,
        company,
        jobTitle,
        bio,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
      
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
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <div className="mt-1">
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Brief description about yourself and your investment strategy.
            </p>
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
