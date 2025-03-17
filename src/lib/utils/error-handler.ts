// src/lib/utils/error-handler.ts
import logger from './logger';

/**
 * Centralized error handler
 * @param error Error object
 * @param context Optional context information
 * @returns Formatted error message
 */
export const handleError = (error: any, context?: string): string => {
  const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
  const contextInfo = context ? `[${context}] ` : '';
  
  // Log to our central logger
  logger.error(`${contextInfo}${errorMessage}`, error);
  
  // Return user-friendly message
  return errorMessage;
};

export default handleError;
