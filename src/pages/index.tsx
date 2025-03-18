// src/pages/index.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { CalendarView } from '../components/CalendarView';
import { EventTable } from '../components/EventTable';
import { CompanySearch } from '../components/CompanySearch';
import { EventFilter } from '../components/EventFilter';
import { EventData } from '../lib/events/event-extractor';
import { fetchUpcomingEvents, searchCompany } from '../lib/api/client';
import { Layout } from '../components/Layout';
import { AdBanner } from '../components/AdBanner';

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
    <Layout title="Dashboard">
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

      {/* Inline ad after filters for free users */}
      <AdBanner position="inline" className="mb-6" />

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
    </Layout>
  );
}
