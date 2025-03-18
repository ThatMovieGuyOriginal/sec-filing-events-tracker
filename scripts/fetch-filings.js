// scripts/fetch-filings.js
require('dotenv').config();
const axios = require('axios');
const { DOMParser } = require('xmldom');
const fs = require('fs/promises');
const path = require('path');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/fetch-filings.log' })
  ]
});

// SEC API configuration
const SEC_API_EMAIL = process.env.SEC_API_EMAIL || 'example@example.com';
const SEC_API_BASE_URL = 'https://www.sec.gov/';
const RATE_LIMIT_MS = 100; // 10 requests per second to avoid SEC throttling

// Form types we're interested in
const FORM_TYPES = ['8-K', '4', 'SC 13D', 'SC 13G', '10-Q', '10-K', 'DEF 14A', 'PRE 14A'];

// Create an axios instance with rate limiting
const axiosInstance = axios.create({
  baseURL: SEC_API_BASE_URL,
  headers: {
    'User-Agent': SEC_API_EMAIL,
    'Accept-Encoding': 'gzip, deflate'
  }
});

// Simple rate limiter
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get yesterday's date in YYYY-MM-DD format
const getYesterdayDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

// Parse XML content
const parseXML = (content) => {
  const parser = new DOMParser();
  return parser.parseFromString(content, 'text/xml');
};

// Extract text from an XML node
const getNodeText = (doc, nodeName) => {
  const nodes = doc.getElementsByTagName(nodeName);
  return nodes.length > 0 ? nodes[0].textContent : null;
};

// Fetch filings from SEC EDGAR API
const fetchFilings = async (formType, date) => {
  try {
    logger.info(`Fetching ${formType} filings for ${date}`);
    
    // Create search URL for the RSS feed
    const searchUrl = `cgi-bin/browse-edgar?action=getcurrent&type=${formType}&count=100&output=atom`;
    
    // Fetch filings RSS feed
    await sleep(RATE_LIMIT_MS); // Respect rate limit
    const response = await axiosInstance.get(searchUrl);
    
    if (!response.data) {
      logger.warn(`No data returned for ${formType} on ${date}`);
      return [];
    }
    
    // Parse XML response
    const xmlDoc = parseXML(response.data);
    const entries = xmlDoc.getElementsByTagName('entry');
    
    if (!entries || entries.length === 0) {
      logger.info(`No ${formType} filings found for ${date}`);
      return [];
    }
    
    const filings = [];
    
    // Process each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Extract filing date
      const updated = getNodeText(entry, 'updated');
      const filingDate = updated ? updated.split('T')[0] : null;
      
      // Skip if not from yesterday
      if (filingDate !== date) {
        continue;
      }
      
      // Extract relevant data
      const title = getNodeText(entry, 'title');
      const link = entry.getElementsByTagName('link')[0];
      const href = link ? link.getAttribute('href') : null;
      
      // Parse company name and CIK from title
      const titleMatch = title ? title.match(/^(.+) \((.+?)\)/) : null;
      const companyName = titleMatch ? titleMatch[1].trim() : 'Unknown';
      const cikMatch = titleMatch ? titleMatch[2].match(/CIK: (\d+)/) : null;
      const cik = cikMatch ? cikMatch[1] : 'Unknown';
      
      // Extract accession number from link
      const accessionMatch = href ? href.match(/accession_number=([0-9-]+)/) : null;
      const accessionNumber = accessionMatch ? accessionMatch[1] : null;
      
      if (accessionNumber) {
        filings.push({
          formType,
          companyName,
          cik,
          filingDate,
          accessionNumber,
          url: `https://www.sec.gov/Archives/edgar/data/${cik.padStart(10, '0')}/${accessionNumber.replace(/-/g, '')}/${accessionNumber}.txt`
        });
      }
    }
    
    logger.info(`Found ${filings.length} ${formType} filings for ${date}`);
    return filings;
  } catch (error) {
    logger.error(`Error fetching ${formType} filings: ${error.message}`);
    return [];
  }
};

// Fetch filing content
const fetchFilingContent = async (filing) => {
  try {
    logger.info(`Fetching content for filing ${filing.accessionNumber}`);
    
    await sleep(RATE_LIMIT_MS); // Respect rate limit
    const response = await axiosInstance.get(filing.url);
    
    return response.data;
  } catch (error) {
    logger.error(`Error fetching filing content for ${filing.accessionNumber}: ${error.message}`);
    return null;
  }
};

// Extract events from filings
const extractEvents = (filing, content) => {
  const events = [];
  
  try {
    // Very simple extraction - in production you'd want more sophisticated NLP
    const lowerContent = content.toLowerCase();
    
    // Check for name changes
    if (lowerContent.includes('name change') || 
        lowerContent.includes('changing its name') || 
        lowerContent.includes('changed its name')) {
      events.push({
        id: `nameChange-${filing.cik}-${filing.accessionNumber}`,
        type: 'nameChange',
        cik: filing.cik,
        companyName: filing.companyName,
        identifiedDate: filing.filingDate,
        sourceFormType: filing.formType,
        sourceAccessionNumber: filing.accessionNumber,
        sourceUrl: filing.url,
        description: 'Company name change announced',
        details: {},
        status: 'pending'
      });
    }
    
    // Check for ticker changes
    if (lowerContent.includes('ticker symbol') || 
        lowerContent.includes('trading symbol') || 
        lowerContent.includes('symbol change')) {
      events.push({
        id: `tickerChange-${filing.cik}-${filing.accessionNumber}`,
        type: 'tickerChange',
        cik: filing.cik,
        companyName: filing.companyName,
        identifiedDate: filing.filingDate,
        sourceFormType: filing.formType,
        sourceAccessionNumber: filing.accessionNumber,
        sourceUrl: filing.url,
        description: 'Ticker symbol change announced',
        details: {},
        status: 'pending'
      });
    }
    
    // Check for insider buying (Form 4 specific)
    if (filing.formType === '4' && 
        (lowerContent.includes('purchase') || content.includes('P'))) {
      events.push({
        id: `insiderBuying-${filing.cik}-${filing.accessionNumber}`,
        type: 'insiderBuying',
        cik: filing.cik,
        companyName: filing.companyName,
        identifiedDate: filing.filingDate,
        sourceFormType: filing.formType,
        sourceAccessionNumber: filing.accessionNumber,
        sourceUrl: filing.url,
        description: 'Insider buying activity reported',
        details: {},
        status: 'completed'
      });
    }
    
    // Add more event type checks as needed...
    
  } catch (error) {
    logger.error(`Error extracting events from filing ${filing.accessionNumber}: ${error.message}`);
  }
  
  return events;
};

// Save events to JSON file (in production you'd save to a database)
const saveEvents = async (events) => {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Get existing events if available
    let existingEvents = [];
    try {
      const existingData = await fs.readFile(path.join(dataDir, 'events.json'), 'utf8');
      existingEvents = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist yet, that's fine
    }
    
    // Merge new events, avoiding duplicates
    const eventIds = new Set(existingEvents.map(e => e.id));
    const newEvents = events.filter(e => !eventIds.has(e.id));
    
    // Save combined events
    const allEvents = [...existingEvents, ...newEvents];
    await fs.writeFile(
      path.join(dataDir, 'events.json'),
      JSON.stringify(allEvents, null, 2)
    );
    
    logger.info(`Saved ${newEvents.length} new events (total: ${allEvents.length})`);
    return newEvents;
  } catch (error) {
    logger.error(`Error saving events: ${error.message}`);
    return [];
  }
};

// Main function
const main = async () => {
  try {
    const yesterday = getYesterdayDate();
    logger.info(`Starting SEC filings fetch for ${yesterday}`);
    
    // Ensure logs directory exists
    await fs.mkdir('logs', { recursive: true });
    
    // Fetch filings for each form type
    let allFilings = [];
    for (const formType of FORM_TYPES) {
      const filings = await fetchFilings(formType, yesterday);
      allFilings = [...allFilings, ...filings];
    }
    
    logger.info(`Found ${allFilings.length} total filings for ${yesterday}`);
    
    // Process each filing
    let allEvents = [];
    for (const filing of allFilings) {
      const content = await fetchFilingContent(filing);
      
      if (content) {
        // Save raw filing content
        const dataDir = path.join(__dirname, '../data/filings');
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(
          path.join(dataDir, `${filing.accessionNumber}.txt`),
          content
        );
        
        // Extract events
        const events = extractEvents(filing, content);
        allEvents = [...allEvents, ...events];
      }
    }
    
    // Save events
    await saveEvents(allEvents);
    
    logger.info(`Processing complete. Extracted ${allEvents.length} events.`);
  } catch (error) {
    logger.error(`Error in main process: ${error.message}`);
  }
};

// Run the script
main()
  .then(() => {
    logger.info('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    logger.error(`Script failed: ${error.message}`);
    process.exit(1);
  });
