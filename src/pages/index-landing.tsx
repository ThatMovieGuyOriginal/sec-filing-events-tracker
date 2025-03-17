// src/pages/index-landing.tsx
// This will be our new landing page for non-authenticated users
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import axios from 'axios';

// Components for the landing page
import { Testimonial } from '../components/marketing/Testimonial';
import { FeatureCard } from '../components/marketing/FeatureCard';
import { PricingTable } from '../components/marketing/PricingTable';
import { FAQ } from '../components/marketing/FAQ';
import { CallToAction } from '../components/marketing/CallToAction';
import { AdBanner } from '../components/AdBanner';

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
                <h1 className="text-4xl tracking-tight font
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

      {/* Statistics */}
      <div className="bg-blue-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Trusted by thousands of investors
            </h2>
            <p className="mt-3 text-xl text-blue-200 sm:mt-4">
              Join the thousands of investors who use our platform to stay ahead of the market
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                SEC Filings Processed Daily
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                15,000+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Active Users
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                5,000+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Average Time Saved Weekly
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                8 Hours
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to track SEC filing events
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform extracts and organizes critical information from SEC filings so you can focus on making informed investment decisions.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.title} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      {/* Icon based on feature.icon */}
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Product Screenshot */}
      <div className="bg-gray-50 overflow-hidden">
        <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="relative lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Intuitive Calendar View
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                Visualize all upcoming corporate events in our interactive calendar. Filter by event type, company, or date range to focus on what matters most to your investment strategy.
              </p>
              <dl className="mt-10 space-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Color-coded events</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Different event types are color-coded for easy visual scanning. Quickly identify insider buying, share buybacks, and more.
                  </dd>
                </div>
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Detailed event cards</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Click on any event to see full details, including direct links to original SEC filings. Get all the context you need in one place.
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-10 -mx-4 lg:mt-0 lg:col-span-1">
              <div className="relative space-y-4">
                <div className="flex justify-center lg:justify-start lg:ml-10">
                  <img
                    className="rounded-xl shadow-xl ring-1 ring-black ring-opacity-5"
                    src="/calendar-screenshot.jpg"
                    alt="Calendar view screenshot"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              From SEC Filing to Actionable Insight
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our automated system continuously monitors, processes, and delivers critical filing information
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mx-auto">
                  <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">1. Automated Collection</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our system fetches new SEC filings every 10 minutes from the EDGAR database, ensuring you have the latest information.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mx-auto">
                  <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">2. Intelligent Processing</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our AI and natural language processing algorithms identify critical events and extract key information from complex SEC documents.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mx-auto">
                  <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">3. Personalized Delivery</h3>
                <p className="mt-2 text-base text-gray-500">
                  View events in your dashboard, receive custom alerts, and get daily digests based on your watchlists and preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="bg-blue-700">
        <div className="max-w-7xl mx-auto md:grid md:grid-cols-2 md:px-6 lg:px-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`py-12 px-4 sm:px-6 md:flex md:flex-col md:py-16 md:pl-0 md:pr-10 lg:pr-16 ${index === 0 ? 'md:border-r md:border-blue-600' : 'md:pl-10 lg:pl-16'}`}>
              <blockquote className="mt-6 md:flex-grow md:flex md:flex-col">
                <div className="relative text-lg font-medium text-white md:flex-grow">
                  <svg className="absolute top-0 left-0 transform -translate-x-3 -translate-y-2 h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="relative">
                    {testimonial.quote}
                  </p>
                </div>
                <footer className="mt-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 overflow-hidden">
                      <img src={testimonial.avatar} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-medium text-white">{testimonial.author}</div>
                      <div className="text-sm font-medium text-blue-200">{testimonial.title}</div>
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-100">
        <div className="pt-12 sm:pt-16 lg:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">Plans for every investor</h2>
              <p className="mt-4 text-xl text-gray-600">
                Choose the perfect plan to help you monitor SEC filings and stay ahead of market-moving events
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 pb-16 sm:mt-12 sm:pb-20 lg:pb-28">
          <div className="relative">
            <div className="absolute inset-0 h-1/2 bg-gray-100"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden lg:max-w-none lg:flex">
                <div className="flex-1 bg-white px-6 py-8 lg:p-12">
                  <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Pro Plan</h3>
                  <p className="mt-6 text-base text-gray-500">
                    Perfect for active investors and traders who need comprehensive SEC filing event tracking
                  </p>
                  <div className="mt-8">
                    <div className="flex items-center">
                      <h4 className="flex-shrink-0 pr-4 bg-white text-sm tracking-wider font-semibold uppercase text-blue-600">
                        What's included
                      </h4>
                      <div className="flex-1 border-t-2 border-gray-200"></div>
                    </div>
                    <ul className="mt-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
                      <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                          Real-time SEC filing tracking
                        </p>
                      </li>
                      <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                          Advanced event analytics
                        </p>
                      </li>
                      <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                          Full historical data
                        </p>
                      </li>
                      <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                          Custom event filters
                        </p>
                      </li>
                      <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                          Unlimited watchlists
                        </p>
                      </li>
                      <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                          Excel/CSV export
                        </p>
                      </li>
                      <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                          API access (100 requests/day)
                        </p>
                      </li>
                      <li className="flex items-start lg:col-span-1">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">
                          Ad-free experience
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="py-8 px-6 text-center bg-gray-50 lg:flex-shrink-0 lg:flex lg:flex-col lg:justify-center lg:p-12">
                  <div className="mt-4 flex items-center justify-center text-5xl font-extrabold text-gray-900">
                    <span>$49</span>
                    <span className="ml-3 text-xl font-medium text-gray-500">/month</span>
                  </div>
                  <p className="mt-4 text-sm">
                    <span className="font-medium text-gray-500">Or $499 billed annually</span>
                  </p>
                  <div className="mt-6">
                    <div className="rounded-md shadow">
                      <a href="/auth/register" className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Start Your Free Trial
                      </a>
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <a href="/pricing" className="font-medium text-blue-600 hover:text-blue-500">
                      View all plans
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrab// src/pages/index-landing.tsx
// This will be our new landing page for non-authenticated users
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import axios from 'axios';

// Components for the landing page
import { Testimonial } from '../components/marketing/Testimonial';
import { FeatureCard } from '../components/marketing/FeatureCard';
import { PricingTable } from '../components/marketing/PricingTable';
import { FAQ } from '../components/marketing/FAQ';
import { CallToAction } from '../components/marketing/CallToAction';
import { AdBanner } from '../components/AdBanner';

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
                <h1 className="text-4xl tracking-tight font
