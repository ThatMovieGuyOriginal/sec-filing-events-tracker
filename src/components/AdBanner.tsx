// src/components/AdBanner.tsx
import React, { useEffect, useState } from 'react';
import { useAdContext } from '../contexts/AdContext';

interface AdBannerProps {
  position: 'top' | 'sidebar' | 'footer' | 'inline';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ position, className = '' }) => {
  const { showAds } = useAdContext();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    if (!showAds) return;

    // Simulate loading an ad
    const timer = setTimeout(() => {
      // In production, this would be replaced with actual ad loading logic
      const success = Math.random() > 0.1; // 90% success rate for demo
      setAdLoaded(success);
      setAdError(!success);
    }, 500);

    return () => clearTimeout(timer);
  }, [showAds]);

  if (!showAds) return null;

  // Different ad sizes based on position
  const getAdSize = () => {
    switch (position) {
      case 'top':
        return 'h-16 md:h-24';
      case 'sidebar':
        return 'h-80';
      case 'footer':
        return 'h-20';
      case 'inline':
        return 'h-28';
      default:
        return 'h-24';
    }
  };

  // Different backgrounds for demo purposes
  const getAdBackground = () => {
    switch (position) {
      case 'top':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50';
      case 'sidebar':
        return 'bg-gradient-to-r from-green-50 to-teal-50';
      case 'footer':
        return 'bg-gradient-to-r from-purple-50 to-pink-50';
      case 'inline':
        return 'bg-gradient-to-r from-yellow-50 to-red-50';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100';
    }
  };

  if (adError) {
    return null; // Don't show anything if ad failed to load
  }

  return (
    <div className={`w-full ${getAdSize()} rounded-md overflow-hidden ${className}`}>
      {!adLoaded ? (
        // Loading state
        <div className={`animate-pulse ${getAdBackground()} w-full h-full flex items-center justify-center`}>
          <span className="text-xs text-gray-400">Advertisement loading...</span>
        </div>
      ) : (
        // Demo ad content
        <div className={`${getAdBackground()} w-full h-full relative flex items-center justify-center border border-gray-200`}>
          <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-xs px-1">
            Ad
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">
              {position === 'sidebar' ? 'Upgrade to Pro Plan' : 'Sponsored Content'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {position === 'sidebar' 
                ? 'Remove ads and unlock premium features' 
                : 'Relevant financial services and tools'}
            </div>
            {position === 'sidebar' && (
              <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md">
                Upgrade Now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
