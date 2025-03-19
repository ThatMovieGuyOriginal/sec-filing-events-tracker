// src/components/Layout.tsx
import React from 'react';
import Head from 'next/head';
import { Sidebar } from './Sidebar';
import { AdBanner } from './AdBanner';
import { useAdContext } from '../contexts/AdContext';
import { SkipToContent } from './accessibility/SkipToContent';
import { JsonLd } from './seo/JsonLd';

interface LayoutProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  children: React.ReactNode;
  structuredData?: Record<string, any>;
  keywords?: string; // Added keywords
  author?: string;   // Added author
}

export const Layout: React.FC<LayoutProps> = ({ 
  title, 
  description = 'Track important SEC filing events in real-time. Monitor insider buying, ticker changes, share buybacks, and more with our intelligent event tracking system.',
  canonicalUrl,
  ogImage = '/images/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  children,
  structuredData,
  keywords = 'SEC filings, EDGAR, corporate events, insider trading, financial alerts', // Default value
  author = 'SEC Filing Events Tracker', // Default value
}) => {
  const { showAds } = useAdContext();
  const fullTitle = `${title} | SEC Filing Events Tracker`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://secfilingstracker.com';
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : undefined;

  return (
    <div className="flex h-screen bg-gray-50">
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Enhanced SEO Meta Tags */}
        {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:image" content={`${siteUrl}${ogImage}`} />
        <meta property="og:site_name" content="SEC Filing Events Tracker" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
        <meta name="robots" content="index, follow" />
        
        {/* Mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      {/* Structured data for rich results */}
      {structuredData && <JsonLd data={structuredData} />}
      
      {/* Rest of the component... */}
      {children}
    </div>
  );
};
