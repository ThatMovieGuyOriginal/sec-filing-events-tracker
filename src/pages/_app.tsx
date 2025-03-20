// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AdProvider } from '../contexts/AdContext';
import Script from 'next/script';
import { useEffect } from 'react';
import initWindowFs from '../lib/utils/window-fs';
import dynamic from 'next/dynamic';

function MyApp({ Component, pageProps }: AppProps) {
  // Initialize window.fs utility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initWindowFs();
    }
  }, []);

  return (
    <AdProvider>
      {/* Google Analytics script - replace with your GA ID */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
      </Script>
      
      <Component {...pageProps} />
    </AdProvider>
  );
}

// Dynamically import heavy components
const DynamicCalendarView = dynamic(
  () => import('../components/CalendarView').then(mod => mod.CalendarView),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center">Loading calendar...</div> }
);

export default MyApp;
