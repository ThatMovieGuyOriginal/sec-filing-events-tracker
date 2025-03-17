// scripts/update-event-statuses.js
/**
 * Script to update event statuses based on dates
 * Run daily to check if pending events have been executed
 */
require('dotenv').config();
const { prisma } = require('../lib/database');
const logger = require('../lib/utils/logger');

/**
 * Main function to update event statuses
 */
async function main() {
  logger.info('Starting event status update');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    // Find all pending events with an execution date in the past
    const pendingEvents = await prisma.event.findMany({
      where: {
        status: 'pending',
        executionDate: {
          lt: today,
        },
      },
    });
    
    logger.info(`Found ${pendingEvents.length} pending events to update`);
    
    if (pendingEvents.length === 0) {
      return;
    }
    
    // Update events to completed
    const result = await prisma.event.updateMany({
      where: {
        id: {
          in: pendingEvents.map(event => event.id),
        },
      },
      data: {
        status: 'completed',
      },
    });
    
    logger.info(`Updated ${result.count} events to completed status`);
  } catch (error) {
    logger.error('Error updating event statuses:', error);
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error('Script failed:', error);
    process.exit(1);
  });
