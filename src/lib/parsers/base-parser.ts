// src/lib/parsers/base-parser.ts
import logger from '../utils/logger';

/**
 * Base filing data structure
 */
export interface FilingData {
  accessionNumber: string;
  cik: string;
  companyName: string;
  filingDate: string;
  formType: string;
  content: string;
  parsedData: Record<string, any>;
}

/**
 * Abstract base class for all filing parsers
 */
export abstract class BaseParser {
  /**
   * Parse filing content into structured data
   * @param filingContent Raw filing content
   * @param metadata Filing metadata
   */
  abstract parse(filingContent: string, metadata: any): Promise<FilingData>;
  
  /**
   * Check if this parser can handle the given form type
   * @param formType SEC form type (e.g., '8-K', '4', 'SC 13D')
   */
  abstract canParse(formType: string): boolean;
  
  /**
   * Extract relevant text sections from a filing
   * @param content Full filing content
   * @param startMarker Text marking the start of a section
   * @param endMarker Text marking the end of a section
   */
  protected extractSection(content: string, startMarker: string, endMarker: string): string | null {
    try {
      const startIndex = content.indexOf(startMarker);
      if (startIndex === -1) return null;
      
      const searchStart = startIndex + startMarker.length;
      const endIndex = content.indexOf(endMarker, searchStart);
      if (endIndex === -1) return null;
      
      return content.substring(searchStart, endIndex).trim();
    } catch (error) {
      logger.error('Error extracting section:', error);
      return null;
    }
  }
  
  /**
   * Search for keywords in filing content
   * @param content Filing content to search
   * @param keywords Array of keywords to search for
   */
  protected hasKeywords(content: string, keywords: string[]): boolean {
    const normalizedContent = content.toLowerCase();
    return keywords.some(keyword => normalizedContent.includes(keyword.toLowerCase()));
  }
}
