// src/components/CompanySearch.tsx
import React, { useState } from 'react';
import { searchCompanyByName } from '../lib/api/client';

interface CompanySearchProps {
  onSearch: (term: string) => void;
}

/**
 * Search component for finding companies
 */
export const CompanySearch: React.FC<CompanySearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle input change
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      setLoading(true);
      try {
        const results = await searchCompanyByName(value);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: any) => {
    setSearchTerm(suggestion.ticker || suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(suggestion.ticker || suggestion.cik);
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full md:w-96">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by ticker or company name..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {loading ? (
            <div className="p-2 text-center text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  onMouseDown={() => handleSelectSuggestion(suggestion)}
                >
                  <div className="font-medium">{suggestion.name}</div>
                  <div className="text-sm text-gray-500">
                    {suggestion.ticker ? `${suggestion.ticker} | ` : ''}
                    CIK: {suggestion.cik}
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="p-2 text-center text-gray-500">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};
