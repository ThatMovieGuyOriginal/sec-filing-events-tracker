// src/components/CalendarView.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
export const CalendarView: React.FC<CalendarViewProps> = React.memo(({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Convert events to calendar format - memoized to prevent unnecessary recalculations
  const calendarEvents = useMemo(() => {
    return events.map(event => {
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
  }, [events]);

  // Handle event click - useCallback to prevent unnecessary recreations
  const handleEventClick = useCallback((event: any): void => {
    setSelectedEvent(event.resource);
    setShowModal(true);
  }, []);

  // Custom event styling - memoized
  const eventStyleGetter = useCallback((event: any) => {
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
  }, []);

  // Modal close handler - useCallback
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedEvent(null);
  }, []);

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
        aria-label="Event calendar"
      />
      
      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
});

  // Add mobile-specific views
  const getViews = () => {
    // On mobile, only show agenda and month view
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return { month: true, agenda: true };
    }
    
    // On desktop, show all views
    return { month: true, week: true, day: true };
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
        views={getViews()}
        defaultView="month"
        aria-label="Event calendar"
        toolbar={true}
        // Mobile-friendly settings
        popup={true}
        components={{
          toolbar: MobileResponsiveToolbar,
        }}
      />
      
      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
});

// Custom mobile-responsive toolbar
const MobileResponsiveToolbar = (props) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => props.onNavigate('PREV')}>
          &lt;
        </button>
        <button type="button" onClick={() => props.onNavigate('TODAY')}>
          Today
        </button>
        <button type="button" onClick={() => props.onNavigate('NEXT')}>
          &gt;
        </button>
      </span>
      <span className="rbc-toolbar-label">{props.label}</span>
      <span className="rbc-btn-group">
        {props.views.map(view => (
          <button
            key={view}
            type="button"
            className={view === props.view ? 'rbc-active' : ''}
            onClick={() => props.onView(view)}
          >
            {view === 'month' ? 'Month' : view === 'agenda' ? 'List' : view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </span>
    </div>
  );
};

// Add display name for debugging
CalendarView.displayName = 'CalendarView';
