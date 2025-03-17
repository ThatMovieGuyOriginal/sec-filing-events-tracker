// src/components/Sidebar.tsx
import React from 'react';
import Link from 'next/link';

/**
 * Sidebar navigation component
 */
export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white overflow-y-auto hidden md:block">
      <div className="p-6">
        <h1 className="text-2xl font-bold">SEC Tracker</h1>
        <p className="text-sm text-gray-400">Track important SEC filing events</p>
      </div>
      <nav className="mt-6">
        <Link href="/">
          <a className="flex items-center px-6 py-3 bg-gray-900 text-gray-100">
            <svg
              className="h-5 w-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
            Dashboard
          </a>
        </Link>
        <Link href="/companies">
          <a className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white">
            <svg
              className="h-5 w-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
            Companies
          </a>
        </Link>
        <Link href="/watchlists">
          <a className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white">
            <svg
              className="h-5 w-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              ></path>
            </svg>
            Watchlists
          </a>
        </Link>
        <Link href="/alerts">
          <a className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white">
            <svg
              className="h-5 w-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
            Alerts
          </a>
        </Link>
        <Link href="/settings">
          <a className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white">
            <svg
              className="h-5 w-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            Settings
          </a>
        </Link>
      </nav>
      <div className="px-6 py-4 mt-6 border-t border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
              <span className="text-sm font-medium">U</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-gray-400">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
