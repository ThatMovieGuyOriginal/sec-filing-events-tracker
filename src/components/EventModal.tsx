// src/components/EventModal.tsx
import React from 'react';
import { EventData } from '../lib/events/event-extractor';

interface EventModalProps {
  event: EventData;
  onClose: () => void;
}

/**
 * Modal for displaying detailed event information
 */
export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
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

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render details based on event type
  const renderEventDetails = () => {
    const { details, type } = event;

    if (!details) return null;

    switch (type) {
      case 'nameChange':
        return (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Old Name</h3>
              <p className="text-sm">{details.oldName || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">New Name</h3>
              <p className="text-sm">{details.newName || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Effective Date</h3>
              <p className="text-sm">{formatDate(details.effectiveDate)}</p>
            </div>
          </>
        );

      case 'tickerChange':
        return (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Old Ticker</h3>
              <p className="text-sm">{details.oldTicker || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">New Ticker</h3>
              <p className="text-sm">{details.newTicker || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Effective Date</h3>
              <p className="text-sm">{formatDate(details.effectiveDate)}</p>
            </div>
          </>
        );

      case 'insiderBuying':
        return (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Reporting Person</h3>
              <p className="text-sm">{details.reportingPerson || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Relationship</h3>
              <p className="text-sm">{details.relationship || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Total Shares</h3>
              <p className="text-sm">{details.totalShares?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
              <p className="text-sm">${details.totalValue?.toLocaleString() || 'N/A'}</p>
            </div>
          </>
        );

      // Add cases for other event types...

      default:
        return (
          <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded">
            {JSON.stringify(details, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl mx-auto max-w-2xl w-full">
        <div className="flex items-start justify-between p-5 border-b rounded-t">
          <h3 className="text-xl font-semibold">
            {eventTypeNames[event.type] || event.type}
          </h3>
          <button
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500">Company</h3>
            <p className="text-sm">{event.companyName} {event.ticker ? `(${event.ticker})` : ``}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="text-sm">{event.description}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="text-sm capitalize">{event.status}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500">Identified Date</h3>
            <p className="text-sm">{formatDate(event.identifiedDate)}</p>
          </div>
          {event.executionDate && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Execution Date</h3>
              <p className="text-sm">{formatDate(event.executionDate)}</p>
            </div>
          )}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500">Source</h3>
            <p className="text-sm">
              {event.sourceFormType} 
              {event.sourceUrl && (
                <a 
                  href={event.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  View Filing
                </a>
              )}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
            {renderEventDetails()}
          </div>
        </div>
        <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b">
          <button
            className="bg-blue-600 text-white active:bg-blue-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

  // Create structured data for the event
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BusinessEvent",
    "name": `${eventTypeNames[event.type] || event.type} - ${event.companyName}`,
    "description": event.description,
    "startDate": event.executionDate || event.identifiedDate,
    "location": {
      "@type": "VirtualLocation",
      "url": event.sourceUrl || "https://www.sec.gov/"
    },
    "organizer": {
      "@type": "Organization",
      "name": event.companyName,
      "identifier": event.cik
    }
  };
  
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {/* Modal content... */}
    </>
  );
};
