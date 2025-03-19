// src/lib/analytics/index.ts

// Augment the global Window interface to include dataLayer and gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

type EventData = Record<string, any>;

// Analytics interface
export interface Analytics {
  initialize(): void;
  pageView(url: string): void;
  trackEvent(eventName: string, eventData?: EventData): void;
  trackConversion(conversionId: string, eventData?: EventData): void;
  setUserProperties(properties: Record<string, any>): void;
}

// Google Analytics implementation
class GoogleAnalytics implements Analytics {
  initialize(): void {
    // Load GA script dynamically if not already loaded
    if (typeof window !== 'undefined' && !window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
      document.head.appendChild(script);
      
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
        page_path: window.location.pathname,
      });
    }
  }
  
  pageView(url: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }
  }
  
  trackEvent(eventName: string, eventData?: EventData): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventData);
    }
  }
  
  trackConversion(conversionId: string, eventData?: EventData): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${process.env.NEXT_PUBLIC_GA_ID}/${conversionId}`,
        ...eventData,
      });
    }
  }
  
  setUserProperties(properties: Record<string, any>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', 'user_properties', properties);
    }
  }
}

// Export singleton instance
export const analytics: Analytics = new GoogleAnalytics();

// Analytics hook for easy use in components
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useAnalytics = () => {
  const router = useRouter();
  
  // Initialize analytics
  useEffect(() => {
    analytics.initialize();
  }, []);
  
  // Track page views
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analytics.pageView(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  return analytics;
};

export {};
