// src/components/EventTable.tsx
import React, { useState } from 'react';
import { EventData } from '../lib/events/event-extractor';
import { EventModal } from './EventModal';
import { ResponsiveTable } from './ui/ResponsiveTable';

interface EventTableProps {
  events: EventData[];
}

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
    const aValue = a[sortField] ?? '';
    const bValue = b[sortField] ?? '';
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
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
    reverseStockSplit: 'Reverse Split',
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

  // Render status badge
  const renderStatusBadge = (status: string) => (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
        status
      )}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const columns = [
    {
      header: 'Company',
      accessor: (event: EventData) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{event.companyName}</div>
          <div className="text-sm text-gray-500">
            {event.ticker || `CIK: ${event.cik}`}
          </div>
        </div>
      ),
      mobileLabel: 'Company',
    },
    {
      header: 'Event Type',
      accessor: (event: EventData) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {eventTypeNames[event.type] || event.type}
        </span>
      ),
      mobileLabel: 'Event',
    },
    {
      header: 'Identified',
      accessor: (event: EventData) => formatDate(event.identifiedDate),
      mobileLabel: 'Identified',
    },
    {
      header: 'Execution',
      accessor: (event: EventData) => formatDate(event.executionDate),
      mobileLabel: 'Execution',
    },
    {
      header: 'Status',
      accessor: (event: EventData) => renderStatusBadge(event.status),
      mobileLabel: 'Status',
    },
    {
      header: 'Action',
      accessor: (event: EventData) => (
        <button
          className="text-blue-600 hover:text-blue-900"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEvent(event);
            setShowModal(true);
          }}
          aria-label={`View details for ${event.companyName} ${eventTypeNames[event.type]}`}
        >
          View Details
        </button>
      ),
      mobileLabel: '',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ResponsiveTable
        columns={columns}
        data={sortedEvents}
        keyExtractor={(event) => event.id}
        onRowClick={(event) => {
          setSelectedEvent(event);
          setShowModal(true);
        }}
        emptyMessage="No events found"
      />

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
