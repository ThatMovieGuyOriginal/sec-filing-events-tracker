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
  size?: 'small' | 'medium' | 'large';
  withArrow?: boolean;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  text,
  href,
  className = '',
  trackingId,
  trackingData = {},
  variant = 'primary',
  size = 'medium',
  withArrow = false,
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

  const getSizeStyles = () => {
    switch (size) {
      case 'small': return 'px-4 py-2 text-sm';
      case 'large': return 'px-8 py-4 text-lg';
      default: return 'px-6 py-3 text-base';
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
      
        onClick={handleClick}
        className={`font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md transition-all duration-200 transform hover:scale-105 ${getButtonStyles()} ${getSizeStyles()} ${className}`}
        data-tracking-id={trackingId}
      >
        {text}
        {withArrow && (
          <svg className="ml-2 -mr-1 w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        )}
      </a>
    </Link>
  );
};
