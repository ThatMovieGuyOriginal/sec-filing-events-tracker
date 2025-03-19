// src/components/marketing/CTAButton.tsx
import React from 'react';
import Link from 'next/link';
import { analytics } from '../../lib/analytics';

interface CTAButtonProps {
  text: string;
  href: string;
  className?: string;
  trackingId: string;
  trackingData?: Record<string, any>;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  text,
  href,
  className = '',
  trackingId,
  trackingData = {},
  variant = 'primary',
}) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-blue-100 hover:bg-blue-200 text-blue-700';
      case 'outline':
        return 'bg-white hover:bg-gray-50 text-blue-600 border border-blue-600';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const handleClick = () => {
    // Track conversion
    analytics.trackEvent('cta_click', {
      cta_id: trackingId,
      cta_text: text,
      cta_url: href,
      ...trackingData,
    });
  };

  return (
    <Link href={href}>
      <a
        onClick={handleClick}
        className={`px-6 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${getButtonStyles()} ${className}`}
        data-tracking-id={trackingId}
      >
        {text}
      </a>
    </Link>
  );
};
