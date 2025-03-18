// src/lib/parsers/form8k-parser.ts
import { BaseParser, FilingData } from './base-parser';
import logger from '../utils/logger';

/**
 * Parser for Form 8-K filings
 */
export class Form8KParser extends BaseParser {
  // Item categories we're interested in with their descriptions
  private itemCategories = {
    '5.03': 'Amendments to Articles of Incorporation/Bylaws; Change in Fiscal Year',
    '8.01': 'Other Events',
    '7.01': 'Regulation FD Disclosure',
    '2.01': 'Completion of Acquisition or Disposition of Assets',
    '1.01': 'Entry into a Material Definitive Agreement',
    '2.03': 'Creation of a Direct Financial Obligation',
    '3.01': 'Notice of Delisting or Failure to Satisfy Listing Rule',
  };
  
  /**
   * Check if this parser can handle the given form type
   */
  canParse(formType: string): boolean {
    return formType === '8-K';
  }
  
  /**
   * Parse 8-K filing content
   */
  async parse(filingContent: string, metadata: any): Promise<FilingData> {
    logger.info(`Parsing 8-K filing: ${metadata.accessionNumber}`);
    
    const parsedData: Record<string, any> = {
      items: [],
      nameChange: false,
      tickerChange: false,
      buyback: false,
      reverseStockSplit: false,
      uplisting: false,
      fdaApproval: false,
      patentApproval: false,
      spinOff: false,
      specialDividend: false,
      debtReduction: false,
    };
    
    try {
      // Extract items from 8-K
      for (const [itemNumber, description] of Object.entries(this.itemCategories)) {
        const itemPattern = new RegExp(`Item\\s*${itemNumber.replace('.', '\\.')}[.\\s]`, 'i');
        if (itemPattern.test(filingContent)) {
          parsedData.items.push(itemNumber);
          
          // Extract the content of this item
          const itemContent = this.extractItemContent(filingContent, itemNumber);
          if (itemContent) {
            parsedData[`item${itemNumber.replace('.', '_')}_content`] = itemContent;
            
            // Check for specific events based on item and content
            this.classifyEventByItem(itemNumber, itemContent, parsedData);
          }
        }
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
      logger.error(`Error parsing 8-K filing ${metadata.accessionNumber}:`, error);
      throw new Error(`Failed to parse 8-K filing: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Extract content for a specific item
   */
  private extractItemContent(content: string, itemNumber: string): string | null {
    // Format item pattern for regex (e.g., "Item 5.03" or "ITEM 5.03")
    const itemPattern = new RegExp(`Item\\s*${itemNumber.replace('.', '\\.')}[.\\s]`, 'i');
    
    // Find the start of this item
    const match = content.match(itemPattern);
    if (!match || match.index === undefined) return null;
    
    const startIndex = match.index + match[0].length;
    
    // Find the start of the next item or the end of the document
    const nextItemMatch = content.slice(startIndex).match(/Item\s*\d+\.\d+[.\s]/i);
    const endIndex = nextItemMatch && nextItemMatch.index !== undefined
      ? startIndex + nextItemMatch.index
      : content.length;
    
    return content.substring(startIndex, endIndex).trim();
  }
  
  /**
   * Classify events based on item number and content
   */
  private classifyEventByItem(itemNumber: string, content: string, parsedData: Record<string, any>): void {
    const normalizedContent = content.toLowerCase();
    
    // Item 5.03 - Name changes, reverse splits
    if (itemNumber === '5.03') {
      parsedData.nameChange = this.hasKeywords(content, [
        'name change', 'corporate name change', 'changing its name', 
        'changed its name', 'amendment to change the name'
      ]);
      
      parsedData.tickerChange = this.hasKeywords(content, [
        'ticker symbol change', 'trading symbol change', 'changed its ticker',
        'new ticker symbol', 'symbol will change'
      ]);
      
      parsedData.reverseStockSplit = this.hasKeywords(content, [
        'reverse stock split', 'reverse split', 'share consolidation'
      ]);
    }
    
    // Item 8.01 - Various events
    if (itemNumber === '8.01') {
      parsedData.buyback = this.hasKeywords(content, [
        'share repurchase', 'stock buyback', 'repurchase authorization',
        'repurchase program', 'buyback program'
      ]);
      
      parsedData.uplisting = this.hasKeywords(content, [
        'uplisting', 'uplist', 'approval to list', 'nasdaq capital market',
        'nasdaq global', 'nyse american', 'listing on nasdaq'
      ]);
      
      parsedData.fdaApproval = this.hasKeywords(content, [
        'fda approval', 'nda approval', 'clinical trial results',
        'marketing authorization', 'clearance from fda'
      ]);
      
      parsedData.patentApproval = this.hasKeywords(content, [
        'patent approval', 'patent issuance', 'new patent', 
        'patent office has granted', 'patent has been issued'
      ]);
      
      parsedData.spinOff = this.hasKeywords(content, [
        'spin-off', 'spinoff', 'spin out', 'spinout'
      ]);
      
      parsedData.specialDividend = this.hasKeywords(content, [
        'special dividend', 'special distribution', 'one-time dividend',
        'extraordinary dividend', 'distribution to shareholders'
      ]);
    }
    
    // Item 7.01 - Buybacks sometimes mentioned here
    if (itemNumber === '7.01') {
      parsedData.buyback = parsedData.buyback || this.hasKeywords(content, [
        'share repurchase', 'stock buyback', 'repurchase authorization',
        'repurchase program', 'buyback program'
      ]);
    }
    
    // Item 2.01 - Spinoffs
    if (itemNumber === '2.01') {
      parsedData.spinOff = parsedData.spinOff || this.hasKeywords(content, [
        'spin-off', 'spinoff', 'spin out', 'spinout'
      ]);
    }
    
    // Items 1.01 and 2.03 - Debt items
    if (itemNumber === '1.01' || itemNumber === '2.03') {
      parsedData.debtReduction = this.hasKeywords(content, [
        'debt refinancing', 'debt reduction', 'extinguishment of debt',
        'early repayment', 'debt repayment', 'debt restructuring'
      ]);
    }
    
    // Item 3.01 - Uplisting
    if (itemNumber === '3.01') {
      parsedData.uplisting = parsedData.uplisting || this.hasKeywords(content, [
        'uplisting', 'uplist', 'approval to list', 'nasdaq capital market',
        'nasdaq global', 'nyse american', 'listing on nasdaq'
      ]);
    }
  }
}
