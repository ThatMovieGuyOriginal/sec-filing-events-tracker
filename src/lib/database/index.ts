// src/lib/database/index.ts
import { PrismaClient } from '@prisma/client';
import { EventData } from '../events/event-extractor';
import logger from '../utils/logger';

// Create a singleton Prisma client instance
const prisma = new PrismaClient();

/**
 * Database service for managing SEC event data
 */
export class EventDatabase {
  /**
   * Save a new event to the database
   * @param event Event data to save
   * @returns Saved event with ID
   */
  async saveEvent(event: EventData): Promise<EventData> {
    try {
      logger.info(`Saving event: ${event.type} for ${event.companyName}`);
      
      // Check if this event already exists
      const existingEvent = await prisma.event.findUnique({
        where: { id: event.id },
      });
      
      if (existingEvent) {
        logger.info(`Event ${event.id} already exists, updating instead`);
        return this.updateEvent(event);
      }
      
      // Format dates properly for database
      const formattedEvent = this.formatDates(event);
      
      // Save the event to database
      const savedEvent = await prisma.event.create({
        data: {
          id: formattedEvent.id,
          type: formattedEvent.type,
          cik: formattedEvent.cik,
          companyName: formattedEvent.companyName,
          ticker: formattedEvent.ticker,
          identifiedDate: formattedEvent.identifiedDate,
          executionDate: formattedEvent.executionDate,
          sourceFormType: formattedEvent.sourceFormType,
          sourceAccessionNumber: formattedEvent.sourceAccessionNumber,
          sourceUrl: formattedEvent.sourceUrl,
          description: formattedEvent.description,
          details: formattedEvent.details as any,
          status: formattedEvent.status,
        },
      });
      
      return savedEvent as EventData;
    } catch (error) {
      logger.error(`Error saving event ${event.id}:`, error);
      throw new Error(`Failed to save event: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Save multiple events in a transaction
   * @param events Array of events to save
   * @returns Array of saved events
   */
  async saveEvents(events: EventData[]): Promise<EventData[]> {
    try {
      logger.info(`Saving ${events.length} events`);
      
      const savedEvents: EventData[] = [];
      
      // Run in a transaction to ensure all events are saved or none
      await prisma.$transaction(async (tx) => {
        for (const event of events) {
          // Check if this event already exists
          const existingEvent = await tx.event.findUnique({
            where: { id: event.id },
          });
          
          const formattedEvent = this.formatDates(event);
          
          if (existingEvent) {
            // Update existing event
            const updatedEvent = await tx.event.update({
              where: { id: event.id },
              data: {
                type: formattedEvent.type,
                companyName: formattedEvent.companyName,
                ticker: formattedEvent.ticker,
                identifiedDate: formattedEvent.identifiedDate,
                executionDate: formattedEvent.executionDate,
                sourceFormType: formattedEvent.sourceFormType,
                sourceAccessionNumber: formattedEvent.sourceAccessionNumber,
                sourceUrl: formattedEvent.sourceUrl,
                description: formattedEvent.description,
                details: formattedEvent.details as any,
                status: formattedEvent.status,
              },
            });
            
            savedEvents.push(updatedEvent as EventData);
          } else {
            // Create new event
            const newEvent = await tx.event.create({
              data: {
                id: formattedEvent.id,
                type: formattedEvent.type,
                cik: formattedEvent.cik,
                companyName: formattedEvent.companyName,
                ticker: formattedEvent.ticker,
                identifiedDate: formattedEvent.identifiedDate,
                executionDate: formattedEvent.executionDate,
                sourceFormType: formattedEvent.sourceFormType,
                sourceAccessionNumber: formattedEvent.sourceAccessionNumber,
                sourceUrl: formattedEvent.sourceUrl,
                description: formattedEvent.description,
                details: formattedEvent.details as any,
                status: formattedEvent.status,
              },
            });
            
            savedEvents.push(newEvent as EventData);
          }
        }
      });
      
      return savedEvents;
    } catch (error) {
      logger.error(`Error saving multiple events:`, error);
      throw new Error(`Failed to save events: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Update an existing event
   * @param event Updated event data
   * @returns Updated event
   */
  async updateEvent(event: EventData): Promise<EventData> {
    try {
      logger.info(`Updating event: ${event.id}`);
      
      const formattedEvent = this.formatDates(event);
      
      const updatedEvent = await prisma.event.update({
        where: { id: event.id },
        data: {
          type: formattedEvent.type,
          companyName: formattedEvent.companyName,
          ticker: formattedEvent.ticker,
          identifiedDate: formattedEvent.identifiedDate,
          executionDate: formattedEvent.executionDate,
          sourceFormType: formattedEvent.sourceFormType,
          sourceAccessionNumber: formattedEvent.sourceAccessionNumber,
          sourceUrl: formattedEvent.sourceUrl,
          description: formattedEvent.description,
          details: formattedEvent.details as any,
          status: formattedEvent.status,
        },
      });
      
      return updatedEvent as EventData;
    } catch (error) {
      logger.error(`Error updating event ${event.id}:`, error);
      throw new Error(`Failed to update event: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get an event by ID
   * @param id Event ID
   * @returns Event data or null if not found
   */
  async getEvent(id: string): Promise<EventData | null> {
    try {
      logger.info(`Getting event: ${id}`);
      
      const event = await prisma.event.findUnique({
        where: { id },
      });
      
      return event as EventData | null;
    } catch (error) {
      logger.error(`Error getting event ${id}:`, error);
      throw new Error(`Failed to get event: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get events for a company by CIK or ticker
   * @param identifier CIK or ticker
   * @returns Array of events
   */
  async getCompanyEvents(identifier: string): Promise<EventData[]> {
    try {
      logger.info(`Getting events for company: ${identifier}`);
      
      // Check if the identifier is a CIK or ticker
      const isCIK = /^\d+$/.test(identifier);
      
      const events = await prisma.event.findMany({
        where: isCIK ? { cik: identifier } : { ticker: identifier },
        orderBy: { identifiedDate: 'desc' },
      });
      
      return events as EventData[];
    } catch (error) {
      logger.error(`Error getting events for company ${identifier}:`, error);
      throw new Error(`Failed to get company events: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get events by type
   * @param type Event type
   * @param limit Maximum number of events to return
   * @param offset Pagination offset
   * @returns Array of events
   */
  async getEventsByType(type: string, limit = 50, offset = 0): Promise<EventData[]> {
    try {
      logger.info(`Getting events by type: ${type}`);
      
      const events = await prisma.event.findMany({
        where: { type },
        orderBy: { identifiedDate: 'desc' },
        take: limit,
        skip: offset,
      });
      
      return events as EventData[];
    } catch (error) {
      logger.error(`Error getting events by type ${type}:`, error);
      throw new Error(`Failed to get events by type: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get upcoming events (with execution dates in the future)
   * @param limit Maximum number of events to return
   * @returns Array of upcoming events
   */
  async getUpcomingEvents(limit = 50): Promise<EventData[]> {
    try {
      logger.info(`Getting upcoming events`);
      
      const now = new Date();
      
      const events = await prisma.event.findMany({
        where: {
          executionDate: { gt: now },
          status: 'pending',
        },
        orderBy: { executionDate: 'asc' },
        take: limit,
      });
      
      return events as EventData[];
    } catch (error) {
      logger.error(`Error getting upcoming events:`, error);
      throw new Error(`Failed to get upcoming events: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get events in a date range
   * @param startDate Range start date
   * @param endDate Range end date
   * @returns Array of events
   */
  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<EventData[]> {
    try {
      logger.info(`Getting events between ${startDate} and ${endDate}`);
      
      const events = await prisma.event.findMany({
        where: {
          OR: [
            {
              executionDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              identifiedDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          ],
        },
        orderBy: { executionDate: 'asc' },
      });
      
      return events as EventData[];
    } catch (error) {
      logger.error(`Error getting events by date range:`, error);
      throw new Error(`Failed to get events by date range: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Search for events
   * @param query Search query (company name, description, etc.)
   * @param limit Maximum number of events to return
   * @returns Array of matching events
   */
  async searchEvents(query: string, limit = 50): Promise<EventData[]> {
    try {
      logger.info(`Searching events with query: ${query}`);
      
      const events = await prisma.event.findMany({
        where: {
          OR: [
            { companyName: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { ticker: { equals: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { identifiedDate: 'desc' },
        take: limit,
      });
      
      return events as EventData[];
    } catch (error) {
      logger.error(`Error searching events with query ${query}:`, error);
      throw new Error(`Failed to search events: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Delete an event by ID
   * @param id Event ID
   * @returns True if successful
   */
  async deleteEvent(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting event: ${id}`);
      
      await prisma.event.delete({
        where: { id },
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting event ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Format dates in event for database storage
   * @param event Event to format
   * @returns Formatted event
   */
  private formatDates(event: EventData): EventData {
    const formattedEvent = { ...event };
    
    // Format identified date if it's a string
    if (typeof formattedEvent.identifiedDate === 'string') {
      try {
        formattedEvent.identifiedDate = new Date(formattedEvent.identifiedDate).toISOString();
      } catch (error) {
        // Keep as is if parsing fails
      }
    }
    
    // Format execution date if it exists and is a string
    if (formattedEvent.executionDate && typeof formattedEvent.executionDate === 'string') {
      try {
        formattedEvent.executionDate = new Date(formattedEvent.executionDate).toISOString();
      } catch (error) {
        // Keep as is if parsing fails
      }
    }
    
    return formattedEvent;
  }
}

// Export a singleton instance
export const eventDatabase = new EventDatabase();

// Export Prisma client for direct access when needed
export { prisma };
