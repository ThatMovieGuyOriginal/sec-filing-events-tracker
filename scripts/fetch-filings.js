// scripts/fetch-filings.js
/**
 * Script to fetch SEC filings and extract events
 * Run daily via GitHub Actions
 */
require('dotenv').config();
const { createEdgarClient } = require('../lib/edgar-api/client');
const { parserFactory } = require('../lib/parsers/parser-factory');
const { eventExtractor } = require('../lib/events/event-extractor');
const { eventDatabase } = require('../lib/database');
const fs = require('fs/promises');
const path = require('path');
const logger = require('../lib/utils/logger');

// Date and form types to fetch
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const formattedDate = yesterday.toISOString().split('T')[0];

const FORM_TYPES = ['8-K', '4', 'SC 13D', 'SC 13G', '10-Q', '10-K', 'DEF 14A', 'PRE 14A', 'DEF 14C', 'PRE 14C'];

/**
 * Main function to fetch and process filings
 */
async function main() {
  logger.info('Starting SEC filings fetch');
  
  const edgarClient = createEdgarClient({
    userAgent: process.env.SEC_API_EMAIL || 'example@example.com',
    rateLimit: 10,
  });
  
  // Ensure data directory exists
  const dataDir = path.join(__dirname, '../data');
  await fs.mkdir(dataDir, { recursive: true });
  
  let totalProcessed = 0;
  let totalEvents = 0;
  
  // Process each form type
  for (const formType of FORM_TYPES) {
    logger.info(`Fetching ${formType} filings for ${formattedDate}`);
    
    try {
      // Search for filings
      const searchParams = {
        formType,
        startDate: formattedDate,
        endDate: formattedDate,
        limit: 100,
      };
      
      const searchResults = await edgarClient.searchFilings(searchParams);
      
      if (!searchResults.filings || searchResults.filings.length === 0) {
        logger.info(`No ${formType} filings found for ${formattedDate}`);
        continue;
      }
      
      logger.info(`Found ${searchResults.filings.length} ${formType} filings`);
      
      // Process each filing
      for (const filingMeta of searchResults.filings) {
        try {
          // Get filing content
          const content = await edgarClient.getFilingContent(filingMeta.accessionNumber);
          
          // Save raw filing to data directory
          const filingPath = path.join(dataDir, `${filingMeta.accessionNumber}.txt`);
          await fs.writeFile(filingPath, content);
          
          // Get appropriate parser
          const parser = parserFactory.getParser(formType);
          
          if (!parser) {
            logger.warn(`No parser found for ${formType}`);
            continue;
          }
          
          // Parse filing
          const parsedFiling = await parser.parse(content, filingMeta);
          
          // Extract events
          const events = eventExtractor.extractEvents(parsedFiling);
          
          if (events.length > 0) {
            logger.info(`Extracted ${events.length} events from ${filingMeta.accessionNumber}`);
            
            // Add ticker to events if it's not already present
            const eventsWithTicker = await Promise.all(events.map(async (event) => {
              if (!event.ticker) {
                try {
                  const ticker = await edgarClient.getTickerByCIK(event.cik);
                  if (ticker) {
                    return { ...event, ticker };
                  }
                } catch (error) {
                  logger.warn(`Could not get ticker for CIK ${event.cik}: ${error.message}`);
                }
              }
              return event;
            }));
            
            // Save events to database
            await eventDatabase.saveEvents(eventsWithTicker);
            
            totalEvents += events.length;
          }
          
          totalProcessed++;
        } catch (error) {
          logger.error(`Error processing filing ${filingMeta.accessionNumber}:`, error);
        }
      }
    } catch (error) {
      logger.error(`Error fetching ${formType} filings:`, error);
    }
  }
  
  logger.info(`Filing fetch complete. Processed ${totalProcessed} filings and extracted ${totalEvents} events.`);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error('Script failed:', error);
    process.exit(1);
  });
