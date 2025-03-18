// src/components/EventTable.tsx
import React, { useState } from 'react';
import { EventData } from '../lib/events/event-extractor';
import { EventModal } from './EventModal';
import Papa from 'papaparse';

interface EventTableProps {
  events: EventData[];
}

const readCSVFile = async (filename: string) => {
  try {
    // Read file as arrayBuffer
    const response = await window.fs.readFile(filename);
    // Convert to text
    const text = new TextDecoder().decode(response);
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`Error reading CSV file ${filename}:`, error);
    throw error;
  }
};

/**
 * Table view for displaying upcoming events
 */
export const EventTable: React.FC<EventTableProps> = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [sortField, setSortField] = useState<keyof EventData>('identifiedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle sort change
  const handleSort = (field: keyof EventData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Event type readable names
  const eventTypeNames: Record<string, string> = {
    nameChange: 'Name Change',
    tickerChange: 'Ticker Change',
    insiderBuying: 'Insider Buying',
    activistInvestor: 'Activist Investor',
    institutionalInvestor: 'Institutional Investor',
    shareBuyback: 'Share Buyback',
    reverseStockSplit: 'Reverse Stock Split',
    uplisting: 'Uplisting',
    fdaApproval: 'FDA Approval',
    patentApproval: 'Patent Approval',
    spinOff: 'Spin-off',
    specialDividend: 'Special Dividend',
    debtReduction: 'Debt Reduction',
  };

  // Determine status class
  const getStatusClass = (status: string): string => {
    if (status === 'completed') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('companyName')}
              >
                Company
                {sortField === 'companyName' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('type')}
              >
                Event Type
                {sortField === 'type' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('identifiedDate')}
              >
                Identified
                {sortField === 'identifiedDate' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('executionDate')}
              >
                Execution
                {sortField === 'executionDate' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
                {sortField === 'status' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.ticker || `CIK: ${event.cik}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {eventTypeNames[event.type] || event.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(event.identifiedDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(event.executionDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(event.status)}`}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowModal(true);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};
