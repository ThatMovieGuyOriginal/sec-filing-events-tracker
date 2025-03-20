// scripts/build-company-db.js
/**
 * Script to build the company database from SEC data
 * Run periodically to update company information
 */
require('dotenv').config();
const { createEdgarClient } = require('../lib/edgar-api/client');
const { prisma } = require('../lib/database');
const fs = require('fs/promises');
const path = require('path');
const logger = require('../lib/utils/logger');

/**
 * Main function to build company database
 */
async function main() {
  logger.info('Starting company database build');
  
  const edgarClient = createEdgarClient({
    userAgent: process.env.SEC_API_EMAIL || 'example@example.com',
    rateLimit: 10,
  });
  
  try {
    // Download CIK to ticker mapping
    const response = await edgarClient.client.get('https://www.sec.gov/files/company_tickers.json');
    
    const companies = Object.values(response.data);
    logger.info(`Found ${companies.length} companies`);
    
    // Process in batches to avoid overloading the database
    const batchSize = 100;
    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);
      
      // Prepare company records for upsert
      const records = batch.map(company => ({
        cik: company.cik_str.toString(),
        name: company.title,
        tickers: [company.ticker],
        // Other fields will be updated later
      }));
      
      // Upsert companies in bulk
      await Promise.all(
        records.map(record => 
          prisma.company.upsert({
            where: { cik: record.cik },
            update: { 
              name: record.name,
              tickers: record.tickers,
            },
            create: record,
          })
        )
      );
      
      logger.info(`Processed ${i + batch.length} companies`);
    }
    
    logger.info('Company database build complete');
  } catch (error) {
    logger.error('Error building company database:', error);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error('Script failed:', error);
    process.exit(1);
  });
