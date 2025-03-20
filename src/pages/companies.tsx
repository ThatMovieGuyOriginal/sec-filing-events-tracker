// src/pages/companies.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { CompanySearch } from '../components/CompanySearch';
import { EventTable } from '../components/EventTable';
import { EventFilter } from '../components/EventFilter';
import { Layout } from '../components/Layout';
import { AdBanner } from '../components/AdBanner';
import { useAdContext } from '../contexts/AdContext';

interface Company {
  cik: string;
  name: string;
  ticker: string;
  industry?: string;
  sector?: string;
  description?: string;
  website?: string;
}

export default function Companies() {
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyEvents, setCompanyEvents] = useState([]);
  const [filters, setFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { showAds } = useAdContext();

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!selectedCompany) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": selectedCompany.name,
      "identifier": selectedCompany.cik,
      "tickerSymbol": selectedCompany.ticker || "",
      "industry": selectedCompany.industry || "",
      "description": selectedCompany.description || `SEC filing events for ${selectedCompany.name}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://secfilingstracker.com/companies/${selectedCompany.cik}`
      }
    };
  };

  // Handle company search
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { data } = await axios.get('/api/companies/search', {
        params: { query }
      });
      
      setSearchResults(data);
      
      if (data.length === 0) {
        setMessage({ type: 'info', text: 'No companies found matching your search' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to search companies' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle company selection
  const handleSelectCompany = async (cik: string) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Get company details
      const company = searchResults.find(c => c.cik === cik);
      setSelectedCompany(company || null);
      
      // Get company events
      const { data } = await axios.get(`/api/companies/${cik}/events`);
      setCompanyEvents(data);
      
      if (data.length === 0) {
        setMessage({ type: 'info', text: 'No events found for this company' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to load company events' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (selectedFilters: string[]) => {
    setFilters(selectedFilters);
  };

  // Apply filters to events
  const filteredEvents = filters.length > 0
    ? companyEvents.filter(event => filters.includes(event.type))
    : companyEvents;

  // Handle add to watchlist
  const handleAddToWatchlist = async (watchlistId: string) => {
    if (!selectedCompany) return;
    
    setIsLoading(true);
    
    try {
      await axios.post(`/api/watchlists/${watchlistId}/companies`, {
        cik: selectedCompany.cik
      });
      
      setMessage({ type: 'success', text: 'Company added to watchlist' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add company to watchlist' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout 
      title="Companies" 
      description={selectedCompany ? `View SEC filing events for ${selectedCompany.name}` : "Search and track SEC filings for public companies"}
      structuredData={generateStructuredData()}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Companies</h1>
        
        {message.text && (
          <div 
            className={`mb-6 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : message.type === 'info'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
        
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium mb-4">Search Companies</h2>
          <CompanySearch onSearch={handleSearch} />
          
          {isLoading && (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {searchResults.length > 0 && !isLoading && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Search Results</h3>
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIK</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((company) => (
                      <tr key={company.cik}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500">{company.ticker || 'No ticker'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.cik}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSelectCompany(company.cik)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Events
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Show ad for free users */}
        {showAds && <AdBanner position="inline" className="mb-6" />}
        
        {selectedCompany && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h2>
                  <div className="mt-1 text-sm text-gray-500">
                    {selectedCompany.ticker ? `Ticker: ${selectedCompany.ticker}` : ''} | CIK: {selectedCompany.cik}
                  </div>
                  {selectedCompany.sector && (
                    <div className="mt-2 text-sm text-gray-500">
                      {selectedCompany.sector} {selectedCompany.industry ? `• ${selectedCompany.industry}` : ''}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Add to watchlist button - this would open a dropdown of watchlists */}
                  <div className="relative">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {/* Toggle watchlist dropdown */}}
                    >
                      Add to Watchlist
                    </button>
                    {/* Watchlist dropdown would go here */}
                  </div>
                  
                  
                    href={`https://www.sec.gov/edgar/browse/?CIK=${selectedCompany.cik}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    SEC Filings
                  </a>
                </div>
              </div>
              
              {selectedCompany.description && (
                <div className="mt-4 text-sm text-gray-700">
                  <h3 className="font-medium mb-2">About</h3>
                  <p>{selectedCompany.description}</p>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filing Events</h2>
                <EventFilter onFilterChange={handleFilterChange} />
              </div>
              
              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No events found for this company {filters.length > 0 ? 'with the selected filters' : ''}
                </div>
              ) : (
                <EventTable events={filteredEvents} />
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
