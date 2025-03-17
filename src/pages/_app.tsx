// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AdProvider } from '../contexts/AdContext';
import Script from 'next/script';

function MyApp({ Component, pageProps }: AppProps) {
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

export default MyApp;
