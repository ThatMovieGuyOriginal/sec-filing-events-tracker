// src/lib/parsers/form14a-parser.ts
import { BaseParser, FilingData } from './base-parser';
import { logger } from '../utils/logger';

/**
 * Parser for Form 14A (proxy statement) filings
 */
export class Form14AParser extends BaseParser {
  canParse(formType: string): boolean {
    return formType === 'DEF 14A' || formType === 'PRE 14A';
  }
  
  async parse(filingContent: string, metadata: any): Promise<FilingData> {
    logger.info(`Parsing ${metadata.formType} filing: ${metadata.accessionNumber}`);
    
    const parsedData: Record<string, any> = {
      nameChange: false,
      reverseStockSplit: false,
      specialDividend: false,
    };
    
    try {
      // Check for name change proposals
      const nameChangeSection = this.findSectionWithKeywords(filingContent, [
        'change the name', 'amendment to the company name',
        'changing the company name', 'corporate name change'
      ]);
      
      if (nameChangeSection) {
        parsedData.nameChange = true;
        parsedData.nameChangeDetails = nameChangeSection;
      }
      
      // Check for reverse stock split proposals
      const reverseSplitSection = this.findSectionWithKeywords(filingContent, [
        'reverse stock split', 'reverse split', 'share consolidation'
      ]);
      
      if (reverseSplitSection) {
        parsedData.reverseStockSplit = true;
        parsedData.reverseSplitDetails = reverseSplitSection;
        
        // Try to extract the split ratio
        const ratioRegex = /(\d+)[:-](\d+)/;
        const ratioMatch = reverseSplitSection.match(ratioRegex);
        if (ratioMatch) {
          parsedData.splitRatio = `${ratioMatch[1]}:${ratioMatch[2]}`;
        }
      }
      
      // Check for special dividend proposals
      const specialDividendSection = this.findSectionWithKeywords(filingContent, [
        'special dividend', 'special distribution', 'one-time dividend',
        'extraordinary dividend'
      ]);
      
      if (specialDividendSection) {
        parsedData.specialDividend = true;
        parsedData.specialDividendDetails = specialDividendSection;
      }
      
      return {
        accessionNumber: metadata.accessionNumber,
        cik: metadata.cik,
        companyName: metadata.companyName,
        filingDate: metadata.filingDate,
        formType: metadata.formType,
        content: filingContent,
        parsedData,
      };
    } catch (error) {
      logger.error(`Error parsing ${metadata.formType} filing ${metadata.accessionNumber}:`, error);
      throw new Error(`Failed to parse ${metadata.formType} filing: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Find a section containing keywords
   */
  private findSectionWithKeywords(content: string, keywords: string[]): string | null {
    const paragraphs = content.split(/\n\s*\n/);
    
    for (const paragraph of paragraphs) {
      if (this.hasKeywords(paragraph, keywords)) {
        return paragraph;
      }
    }
    
    return null;
  }
}
