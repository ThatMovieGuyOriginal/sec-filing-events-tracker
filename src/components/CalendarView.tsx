// src/components/CalendarView.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { EventData } from '../lib/events/event-extractor';
import { EventModal } from './EventModal';
import { useResponsive } from '../lib/hooks/useResponsive'; // Use the responsive hook

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  events: EventData[];
}

const EVENT_COLORS: Record<string, string> = {
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

/**
 * Calendar view for displaying upcoming events
 */
export const CalendarView: React.FC<CalendarViewProps> = React.memo(({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { isMobile, windowSize } = useResponsive();
  
  // Get appropriate default view based on screen size
  const defaultView = useMemo<View>(
    () => (isMobile ? 'agenda' : 'month'),
    [isMobile]
  );

  // Convert events to calendar format
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

  // Handle event click
  const handleEventClick = useCallback((event: any): void => {
    setSelectedEvent(event.resource);
    setShowModal(true);
  }, []);

  // Custom event styling
  const eventStyleGetter = useCallback((event: any) => {
    const backgroundColor = EVENT_COLORS[event.resource.type] || '#607D8B';
    
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

  // Modal close handler
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedEvent(null);
  }, []);

  // Determine appropriate views based on screen size
  const getViews = useMemo(() => {
    if (isMobile) {
      return { month: true, agenda: true };
    }
    return { month: true, week: true, day: true, agenda: true };
  }, [isMobile]);
  
  // Calculate appropriate calendar height based on available space
  const calendarHeight = useMemo(() => {
    return windowSize.height - 240; // Adjust this value based on your layout
  }, [windowSize.height]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[calc(100vh-240px)]">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: calendarHeight }}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        views={getViews}
        defaultView={defaultView}
        aria-label="Event calendar"
        toolbar={true}
        // Mobile-friendly settings
        popup={isMobile}
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

interface ToolbarProps {
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: string) => void;
  views: string[];
  view: string;
  label: string;
}

// Custom mobile-responsive toolbar
const MobileResponsiveToolbar = (props: any) => {
  const { isMobile } = useResponsive();
  
  return (
    <div className={`rbc-toolbar ${isMobile ? 'flex-col items-center space-y-2' : ''}`}>
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
        {props.views.map((view: string) => (
          <button
            key={view}
            type="button"
            className={view === props.view ? 'rbc-active' : ''}
            onClick={() => props.onView(view)}
          >
            {view === 'month' ? 'Month' : 
             view === 'agenda' ? 'List' : 
             view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </span>
    </div>
  );
};

// Add display name for debugging
CalendarView.displayName = 'CalendarView';
