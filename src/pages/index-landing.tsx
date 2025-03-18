// src/pages/index-landing.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    
    if (token) {
      // Verify token validity with backend
      axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        if (response.data.valid) {
          setIsAuthenticated(true);
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          setIsAuthenticated(false);
          setLoading(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setLoading(false);
      });
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Features section data
  const features = [
    {
      icon: 'chart',
      title: 'Real-time SEC Filing Events',
      description: 'Automatically track name changes, ticker changes, insider buying, and more from SEC filings as they happen.'
    },
    {
      icon: 'calendar',
      title: 'Interactive Calendar View',
      description: 'Visualize upcoming corporate events in an intuitive calendar interface to plan your investment strategy.'
    },
    {
      icon: 'bell',
      title: 'Custom Alert System',
      description: 'Create personalized alerts for specific event types or companies to never miss an opportunity.'
    },
    {
      icon: 'analytics',
      title: 'Advanced Analytics',
      description: 'Gain insights with detailed analytics on filing patterns, insider activity, and institutional movements.'
    },
    {
      icon: 'watchlist',
      title: 'Customizable Watchlists',
      description: 'Organize companies into watchlists and track events specifically for your portfolio or interests.'
    },
    {
      icon: 'data',
      title: 'Comprehensive Data',
      description: 'Access historical filing data to identify patterns and gain context for current events.'
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "SEC Filing Events Tracker has revolutionized how I stay on top of market-moving events. I spotted a major insider buying pattern that led to a 30% gain on my position.",
      author: "Michael R.",
      title: "Individual Investor",
      avatar: "/testimonial-1.jpg"
    },
    {
      quote: "As a financial advisor, I need to stay informed about corporate actions affecting my clients' portfolios. This tool has become indispensable to my daily workflow.",
      author: "Sarah T.",
      title: "Financial Advisor",
      avatar: "/testimonial-2.jpg"
    },
    {
      quote: "The calendar view alone is worth the subscription. Being able to visualize upcoming events helps me plan my investment strategy with confidence.",
      author: "David L.",
      title: "Hedge Fund Analyst",
      avatar: "/testimonial-3.jpg"
    }
  ];

  // FAQ data
  const faqs = [
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
  ];

  return (
    <div className="bg-white">
      <Head>
        <title>SEC Filing Events Tracker | Monitor Corporate Events from SEC Filings</title>
        <meta name="description" content="Track important SEC filing events like ticker changes, insider buying, share buybacks, and more to stay ahead of market-moving corporate actions." />
        <meta name="keywords" content="SEC filings, EDGAR, insider trading, corporate events, stock market, investment research, financial data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header/Nav */}
      <header className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <a href="#">
                <span className="sr-only">SEC Filing Events Tracker</span>
                <img className="h-8 w-auto sm:h-10" src="/logo.svg" alt="Logo" />
              </a>
            </div>
            <div className="-mr-2 -my-2 md:hidden">
              <button type="button" className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <span className="sr-only">Open menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <nav className="hidden md:flex space-x-10">
              <a href="#features" className="text-base font-medium text-gray-500 hover:text-gray-900">Features</a>
              <a href="#testimonials" className="text-base font-medium text-gray-500 hover:text-gray-900">Testimonials</a>
              <a href="#pricing" className="text-base font-medium text-gray-500 hover:text-gray-900">Pricing</a>
              <a href="#faq" className="text-base font-medium text-gray-500 hover:text-gray-900">FAQ</a>
            </nav>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <Link href="/auth/login">
                <a className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900">
                  Sign in
                </a>
              </Link>
              <Link href="/auth/register">
                <a className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                  Sign up
                </a>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Never miss a market-moving</span>{' '}
                  <span className="block text-blue-600 xl:inline">SEC filing event</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Track insider buying, ticker changes, share buybacks, and other critical corporate events extracted from SEC filings in real-time. Stay ahead of the market with our intelligent event tracking system.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/auth/register">
                      <a className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                        Start Free Trial
                      </a>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a href="#features" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10">
                      See Features
                    </a>
                  </div>
                </div>

                {/* Social proof */}
                <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-6">
                  <p className="text-sm text-gray-500 mb-2">Trusted by investors from:</p>
                  <div className="flex space-x-6 opacity-75">
                    <img src="/company-logos/blackrock.svg" alt="BlackRock" className="h-8" />
                    <img src="/company-logos/fidelity.svg" alt="Fidelity" className="h-8" />
                    <img src="/company-logos/vanguard.svg" alt="Vanguard" className="h-8" />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="/hero-image.jpg"
            alt="SEC Filing Events Dashboard"
          />
        </div>
      </div>

      {/* FAQ Section - This is a placeholder - the actual implementation would require building out the FAQ component */}
      <div id="faq" className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">Frequently Asked Questions</h2>
          <div className="mt-12">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="text-lg leading-6 font-medium text-gray-900">{faq.question}</dt>
                  <dd className="mt-2 text-base text-gray-500">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Features</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 
                  4.107 0 0 0-3.773 5.533 11.654 11.654 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2023 SEC Filing Events Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
