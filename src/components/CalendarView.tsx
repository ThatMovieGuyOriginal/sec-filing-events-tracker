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
  const handleEventClick = (event: any): void => {
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
