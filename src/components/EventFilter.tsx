// src/components/EventFilter.tsx
import React, { useState } from 'react';

interface EventFilterProps {
  onFilterChange: (filters: string[]) => void;
}

/**
 * Filter component for event types
 */
export const EventFilter: React.FC<EventFilterProps> = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Event types available for filtering
  const eventTypes = [
    { value: 'nameChange', label: 'Name Change' },
    { value: 'tickerChange', label: 'Ticker Change' },
    { value: 'insiderBuying', label: 'Insider Buying' },
    { value: 'activistInvestor', label: 'Activist Investor' },
    { value: 'institutionalInvestor', label: 'Institutional Investor' },
    { value: 'shareBuyback', label: 'Share Buyback' },
    { value: 'reverseStockSplit', label: 'Reverse Stock Split' },
    { value: 'uplisting', label: 'Uplisting' },
    { value: 'fdaApproval', label: 'FDA Approval' },
    { value: 'patentApproval', label: 'Patent Approval' },
    { value: 'spinOff', label: 'Spin-off' },
    { value: 'specialDividend', label: 'Special Dividend' },
    { value: 'debtReduction', label: 'Debt Reduction' },
  ];

  // Toggle filter selection
  const toggleFilter = (filter: string): void => {
    const newFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters([]);
    onFilterChange([]);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span>Filter by Event Type</span>
        <svg
          className="w-5 h-5 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 z-10 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Event Types</h3>
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={clearFilters}
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {eventTypes.map((type) => (
              <div key={type.value} className="flex items-center p-2 hover:bg-gray-100">
                <input
                  type="checkbox"
                  id={`filter-${type.value}`}
                  checked={selectedFilters.includes(type.value)}
                  onChange={() => toggleFilter(type.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`filter-${type.value}`}
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
