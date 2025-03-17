
// src/lib/utils/logger.ts
import winston from 'winston';

// Configure the custom format with colorized output for development
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create and configure logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production' 
      ? winston.format.json() 
      : winston.format.combine(winston.format.colorize(), customFormat)
  ),
  defaultMeta: { service: 'sec-filing-events-tracker' },
  transports: [
    // Console output for all environments
    new winston.transports.Console(),
    
    // Add file transport for production
    ...(process.env.NODE_ENV === 'production' 
      ? [
          // Error log
          new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          // Combined log
          new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          })
        ] 
      : [])
  ],
});

// Export the logger instance
export default logger;

// For backward compatibility with code using module.exports
module.exports = logger;
