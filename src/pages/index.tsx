// src/pages/index.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { CalendarView } from '../components/CalendarView';
import { EventTable } from '../components/EventTable';
import { CompanySearch } from '../components/CompanySearch';
import { EventFilter } from '../components/EventFilter';
import { Sidebar } from '../components/Sidebar';
import { EventData } from '../lib/events/event-extractor';
import { fetchUpcomingEvents, searchCompany } from '../lib/api/client';

/**
 * Main dashboard page
 */
export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<'calendar' | 'table'>('calendar');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await fetchUpcomingEvents();
        setEvents(data);
      } catch (error) {
        console.error('Failed to load upcoming events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Handle company search
  const handleSearch = async (term: string) => {
    if (!term) {
      const data = await fetchUpcomingEvents();
      setEvents(data);
      return;
    }

    setLoading(true);
    setSearchTerm(term);
    try {
      const companyEvents = await searchCompany(term);
      setEvents(companyEvents);
    } catch (error) {
      console.error('Error searching for company:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (selectedFilters: string[]) => {
    setFilters(selectedFilters);
  };

  // Apply filters
  const filteredEvents = filters.length > 0
    ? events.filter(event => filters.includes(event.type))
    : events;

  return (
    <div className="flex h-screen bg-gray-50">
      <Head>
        <title>SEC Filing Events Tracker</title>
        <meta name="description" content="Track important SEC filing events" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">SEC Filing Events</h1>
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-md ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setView('calendar')}
              >
                Calendar
              </button>
              <button
                className={`px-4 py-2 rounded-md ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setView('table')}
              >
                Table
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CompanySearch onSearch={handleSearch} />
                <EventFilter onFilterChange={handleFilterChange} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {view === 'calendar' ? (
                <CalendarView events={filteredEvents} />
              ) : (
                <EventTable events={filteredEvents} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// src/components/CalendarView.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { EventData } from '../lib/events/event-extractor';
import { EventModal } from './EventModal';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  events: EventData[];
}

/**
 * Calendar view for displaying upcoming events
 */
export const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Convert events to calendar format
  useEffect(() => {
    const formattedEvents = events.map(event => {
      // Use execution date if available, otherwise use identified date
      const eventDate = event.executionDate ? new Date(event.executionDate) : new Date(event.identifiedDate);
      
      return {
        id: event.id,
        title: `${event.companyName}: ${event.description}`,
        start: eventDate,
        end: eventDate,
        resource: event,
      };
    });
    
    setCalendarEvents(formattedEvents);
  }, [events]);

  // Handle event click
  const handleEventClick = (event: any) => {
    setSelectedEvent(event.resource);
    setShowModal(true);
  };

  // Custom event styling
  const eventStyleGetter = (event: any) => {
    // Different colors for different event types
    const eventTypeColors: Record<string, string> = {
      nameChange: '#4CAF50',
      tickerChange: '#2196F3',
      insiderBuying: '#9C27B0',
      activistInvestor: '#F44336',
      institutionalInvestor: '#FF9800',
      shareBuyback: '#3F51B5',
      reverseStockSplit: '#E91E63',
      uplisting: '#00BCD4',
      fdaApproval: '#009688',
      patentApproval: '#8BC34A',
      spinOff: '#673AB7',
      specialDividend: '#FFEB3B',
      debtReduction: '#795548',
    };

    const backgroundColor = eventTypeColors[event.resource.type] || '#607D8B';
    
    return {
      style: {
        backgroundColor,
        color: '#fff',
        borderRadius: '4px',
        border: 'none',
        display: 'block',
      },
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[calc(100vh-240px)]">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="month"
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
