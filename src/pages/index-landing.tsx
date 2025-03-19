// src/pages/index-landing.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Testimonial } from '../components/marketing/Testimonial';
import { FeatureCard } from '../components/marketing/FeatureCard';
import { PricingTable } from '../components/marketing/PricingTable';
import { FAQ } from '../components/marketing/FAQ';
import { HeroSection } from '../components/marketing/HeroSection';
import { CTASection } from '../components/marketing/CTASection';
import { CompanyLogos } from '../components/marketing/CompanyLogos';
import { DemoVideo } from '../components/marketing/DemoVideo';

export default function LandingPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  
  // Rich structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SEC Filing Events Tracker",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1024"
    }
  };

  return (
    <div className="bg-white">
      <Head>
        <title>SEC Filing Events Tracker | Monitor Corporate Events from SEC Filings</title>
        <meta name="description" content="Stay ahead of market-moving events with real-time tracking of SEC filings. Monitor insider buying, ticker changes, share buybacks, and more." />
        <meta name="keywords" content="SEC filings, EDGAR, insider trading, corporate events, stock market, investment research, financial data" />
        <link rel="canonical" href="https://secfilingstracker.com" />
        
        {/* Additional meta tags for rich previews */}
        <meta property="og:title" content="SEC Filing Events Tracker | Monitor Corporate Events from SEC Filings" />
        <meta property="og:description" content="Stay ahead of market-moving events with real-time tracking of SEC filings. Monitor insider buying, ticker changes, share buybacks, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://secfilingstracker.com" />
        <meta property="og:image" content="https://secfilingstracker.com/images/og-dashboard.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SEC Filing Events Tracker | Never Miss a Market-Moving Event" />
        <meta name="twitter:description" content="Real-time tracking of insider buying, ticker changes, share buybacks and more from SEC filings." />
        <meta name="twitter:image" content="https://secfilingstracker.com/images/twitter-preview.jpg" />
        
        {/* Structured data for rich results */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>

      {/* Main navigation with accessibility features */}
      <header className="relative bg-white border-b border-gray-100" role="banner">
        {/* Navigation content with proper ARIA roles */}
      </header>

      {/* Hero Section with clear value proposition */}
      <HeroSection 
        headline="Never Miss a Market-Moving SEC Filing Event" 
        subheadline="Track insider buying, ticker changes, share buybacks, and other critical corporate events extracted from SEC filings in real-time."
        ctaText="Start 14-Day Free Trial"
        ctaLink="/auth/register"
        secondaryCTAText="See Live Demo"
        onSecondaryCTAClick={() => setVideoModalOpen(true)}
      />

      {/* Social proof section */}
      <CompanyLogos 
        title="Trusted by investors from top firms"
        logos={[
          { name: "BlackRock", src: "/company-logos/blackrock.svg" },
          { name: "Fidelity", src: "/company-logos/fidelity.svg" },
          { name: "Vanguard", src: "/company-logos/vanguard.svg" },
          { name: "JPMorgan", src: "/company-logos/jpmorgan.svg" },
          { name: "Goldman Sachs", src: "/company-logos/goldman.svg" }
        ]}
      />

      {/* Demo video modal */}
      {videoModalOpen && (
        <DemoVideo 
          videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          onClose={() => setVideoModalOpen(false)}
        />
      )}

      {/* Feature highlights with clear benefits */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Key Features That Give You an Edge
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Our intelligent system identifies and tracks critical events from SEC filings that can move markets.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="chart"
              title="Real-time Filing Events"
              description="Automatically track name changes, ticker changes, insider buying, and more from SEC filings as they happen."
            />
            <FeatureCard
              icon="calendar"
              title="Interactive Calendar View"
              description="Visualize upcoming corporate events in an intuitive calendar interface to plan your investment strategy."
            />
            <FeatureCard
              icon="bell"
              title="Custom Alert System"
              description="Create personalized alerts for specific event types or companies to never miss an opportunity."
            />
            <FeatureCard
              icon="analytics"
              title="Advanced Analytics"
              description="Gain insights with detailed analytics on filing patterns, insider activity, and institutional movements."
            />
            <FeatureCard
              icon="watchlist"
              title="Customizable Watchlists"
              description="Organize companies into watchlists and track events specifically for your portfolio."
            />
            <FeatureCard
              icon="data"
              title="Comprehensive Data"
              description="Access historical filing data to identify patterns and gain context for current events."
            />
          </div>
        </div>
      </section>

      {/* Testimonials carousel with real user success stories */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 sm:text-4xl">
            What Our Customers Say
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Testimonial
              quote="SEC Filing Events Tracker has revolutionized how I stay on top of market-moving events. I spotted a major insider buying pattern that led to a 30% gain on my position."
              author="Michael R."
              title="Individual Investor"
              avatar="/testimonials/michael.jpg"
              rating={5}
            />
            <Testimonial
              quote="As a financial advisor, I need to stay informed about corporate actions affecting my clients' portfolios. This tool has become indispensable to my daily workflow."
              author="Sarah T."
              title="Financial Advisor"
              avatar="/testimonials/sarah.jpg"
              rating={5}
            />
            <Testimonial
              quote="The calendar view alone is worth the subscription. Being able to visualize upcoming events helps me plan my investment strategy with confidence."
              author="David L."
              title="Hedge Fund Analyst"
              avatar="/testimonials/david.jpg"
              rating={4}
            />
          </div>
        </div>
      </section>

      {/* Clear pricing section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Choose the plan that's right for your investment needs
            </p>
          </div>
          
          <PricingTable
            plans={[
              {
                id: 'basic',
                name: 'Basic',
                description: 'Essential tools for individual investors',
                price: { monthly: '$19', annual: '$199' },
                features: [
                  'Real-time SEC filing tracking',
                  'Basic event notifications',
                  'Ad-free experience',
                  'Limited historical data (3 months)',
                  'Up to 5 company watchlists',
                ],
                popularFeature: 'Real-time filing alerts',
                cta: 'Start 14-Day Free Trial',
                popular: false
              },
              {
                id: 'pro',
                name: 'Pro',
                description: 'Advanced features for serious investors',
                price: { monthly: '$49', annual: '$499' },
                features: [
                  'Everything in Basic',
                  'Advanced event analytics',
                  'Full historical data',
                  'Custom event filters',
                  'Unlimited watchlists',
                  'Priority email support',
                ],
                popularFeature: 'Advanced analytics',
                cta: 'Start 14-Day Free Trial',
                popular: true
              },
              {
                id: 'enterprise',
                name: 'Enterprise',
                description: 'Complete solution for professional teams',
                price: { monthly: '$149', annual: '$1,490' },
                features: [
                  'Everything in Pro',
                  'Team collaboration features',
                  'Dedicated account manager',
                  'Custom integrations',
                  'Unlimited API access',
                ],
                popularFeature: 'Team collaboration',
                cta: 'Contact Sales',
                popular: false
              }
            ]}
          />
        </div>
      </section>

      {/* FAQ section optimized for SEO */}
      <FAQ 
        title="Frequently Asked Questions"
        faqs={[
          {
            question: "How does SEC Filing Events Tracker differ from other financial tools?",
            answer: "Unlike general financial data providers, we specialize exclusively in extracting actionable events from SEC filings. Our system intelligently identifies and categorizes events like insider buying, name changes, and reverse splits, presenting them in an intuitive calendar view that helps you anticipate market-moving events."
          },
          {
            question: "How quickly are new SEC filings processed?",
            answer: "Our system checks for new filings every 10 minutes during market hours and processes them immediately. Most filings are analyzed and added to our database within 15 minutes of being published on the SEC's EDGAR system."
          },
          {
            question: "Can I get alerts for specific companies or event types?",
            answer: "Yes! You can set up custom alerts for specific companies in your watchlist, or for particular event types across all companies. Alerts can be delivered via email, SMS, or in-app notifications depending on your subscription tier."
          },
          {
            question: "What subscription plan is right for me?",
            answer: "Individual investors typically start with our Basic plan, which includes all essential features. Active traders and professional investors often choose our Pro plan for advanced analytics and API access. Enterprise plans are ideal for teams that need collaboration features and dedicated support."
          },
          {
            question: "Is there a free trial available?",
            answer: "Yes, we offer a 14-day free trial of our Pro plan with no credit card required. This gives you access to all features so you can thoroughly evaluate the platform before committing."
          }
        ]}
      />

      {/* Final CTA section with guarantee */}
      <CTASection
        headline="Start Tracking Market-Moving Events Today"
        description="Join thousands of investors who rely on SEC Filing Events Tracker to stay ahead of the market. Try it free for 14 days, no credit card required."
        cta="Get Started Free"
        ctaLink="/auth/register"
        guarantee="30-Day Money-Back Guarantee"
      />

      {/* Accessible and SEO-optimized footer */}
      <footer className="bg-gray-800 text-white py-12" role="contentinfo">
        {/* Footer content with proper semantic structure and accessibility */}
      </footer>
    </div>
  );
}
