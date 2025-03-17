// src/components/Layout.tsx
import React from 'react';
import Head from 'next/head';
import { Sidebar } from './Sidebar';
import { AdBanner } from './AdBanner';
import { useAdContext } from '../contexts/AdContext';

interface LayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  title, 
  description = 'Track important SEC filing events',
  children 
}) => {
  const { showAds } = useAdContext();

  return (
    <div className="flex h-screen bg-gray-50">
      <Head>
        <title>{title} | SEC Filing Events Tracker</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {showAds && <AdBanner position="top" className="m-2" />}
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
        
        {showAds && <AdBanner position="footer" className="m-2" />}
      </div>
      
      {showAds && (
        <div className="hidden lg:block w-64 p-4">
          <AdBanner position="sidebar" />
        </div>
      )}
    </div>
  );
};
