// src/components/Sidebar.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  // Determine if a link is active
  const isActiveLink = (path: string) => router.pathname === path;
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-20 p-4">
        <button
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={toggleSidebar}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-500 bg-opacity-75 z-10"
          aria-hidden="true"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar content */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:translate-x-0 inset-y-0 left-0 w-64 bg-gray-800 text-white overflow-y-auto transition duration-300 ease-in-out transform md:relative md:flex md:flex-col z-20`}
        aria-label="Sidebar navigation"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">SEC Tracker</h1>
          <p className="text-sm text-gray-400">Track important SEC filing events</p>
        </div>
        
        <nav className="mt-6" aria-label="Main navigation">
          <Link href="/">
            <a 
              className={`flex items-center px-6 py-3 ${
                isActiveLink('/') ? 'bg-gray-900 text-gray-100' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              aria-current={isActiveLink('/') ? 'page' : undefined}
            >
              <svg
                className="h-5 w-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
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
          
          {/* Additional navigation items with similar pattern */}
        </nav>
        
        {/* User profile section at bottom */}
        <div className="mt-auto px-6 py-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center" aria-hidden="true">
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
    </>
  );
};
