// src/lib/events/event-extractor.ts
import { FilingData } from '../parsers/base-parser';
import { logger } from '../utils/logger';

/**
 * Base event data structure
 */
export interface EventData {
  /**
   * Unique identifier for the event
   */
  id: string;
  
  /**
   * Type of event (nameChange, tickerChange, etc.)
   */
  type: string;
  
  /**
   * CIK of the company
   */
  cik: string;
  
  /**
   * Company name
   */
  companyName: string;
  
  /**
   * Company ticker (if available)
   */
  ticker?: string;
  
  /**
   * Date the event was identified (filing date)
   */
  identifiedDate: string;
  
  /**
   * Execution date of the event (if available)
   */
  executionDate?: string;
  
  /**
   * Form type that identified this event
   */
  sourceFormType: string;
  
  /**
   * Accession number of the source filing
   */
  sourceAccessionNumber: string;
  
  /**
   * URL to the source filing
   */
  sourceUrl?: string;
  
  /**
   * Brief description of the event
   */
  description: string;
  
  /**
   * Detailed information about the event
   */
  details: Record<string, any>;
  
  /**
   * Event status (pending, completed, etc.)
   */
  status: 'pending' | 'completed' | 'cancelled' | 'unknown';
}

/**
 * Service for extracting events from filing data
 */
export class EventExtractor {
  /**
   * Extract potential events from a filing
   * @param filingData Parsed filing data
   * @returns Array of extracted events
   */
  extractEvents(filingData: FilingData): EventData[] {
    logger.info(`Extracting events from ${filingData.formType} filing: ${filingData.accessionNumber}`);
    
    const events: EventData[] = [];
    const { parsedData, formType, accessionNumber, cik, companyName, filingDate } = filingData;
    
    // Base URL for SEC filings
    const baseUrl = 'https://www.sec.gov/Archives/edgar/data';
    const sourceUrl = `${baseUrl}/${cik}/${accessionNumber.replace(/-/g, '')}/${accessionNumber}.txt`;
    
    try {
      // 1. Name Change events
      if (parsedData.nameChange) {
        events.push(this.createEvent({
          type: 'nameChange',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Company name change announced',
          details: {
            oldName: companyName,
            newName: this.extractNewName(filingData),
            effectiveDate: this.extractEffectiveDate(filingData),
          },
          status: 'pending',
        }));
      }
      
      // 2. Ticker Change events
      if (parsedData.tickerChange) {
        events.push(this.createEvent({
          type: 'tickerChange',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Ticker symbol change announced',
          details: {
            oldTicker: this.extractOldTicker(filingData),
            newTicker: this.extractNewTicker(filingData),
            effectiveDate: this.extractEffectiveDate(filingData),
          },
          status: 'pending',
        }));
      }
      
      // 3. Insider Buying events
      if (parsedData.insiderBuying) {
        events.push(this.createEvent({
          type: 'insiderBuying',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Insider buying activity reported',
          details: {
            reportingPerson: parsedData.reportingPerson,
            relationship: parsedData.relationship,
            transactions: parsedData.transactions,
            totalShares: parsedData.transactions?.reduce((sum: number, t: any) => 
              sum + (t.isPurchase ? t.shares : 0), 0),
            totalValue: parsedData.transactions?.reduce((sum: number, t: any) => 
              sum + (t.isPurchase ? t.value : 0), 0),
          },
          status: 'completed',
        }));
      }
      
      // 4. Institutional Investor events (13D filings)
      if (formType === 'SC 13D' && parsedData.percentOwned > 5) {
        events.push(this.createEvent({
          type: parsedData.isActivist ? 'activistInvestor' : 'institutionalInvestor',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: parsedData.isActivist 
            ? 'Activist investor stake reported' 
            : 'Large institutional investor stake reported',
          details: {
            investor: parsedData.reportingPerson,
            percentOwned: parsedData.percentOwned,
            purpose: parsedData.purpose,
            cusip: parsedData.cusip,
          },
          status: 'completed',
        }));
      }
      
      // 5. Share Buyback events
      if (parsedData.buyback) {
        events.push(this.createEvent({
          type: 'shareBuyback',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Share buyback program announced',
          details: {
            amount: parsedData.buybackAmount,
            shares: parsedData.totalSharesRepurchased,
            programDetails: parsedData.buybackDetails,
          },
          status: 'pending',
        }));
      }
      
      // 6. Reverse Stock Split events
      if (parsedData.reverseStockSplit) {
        events.push(this.createEvent({
          type: 'reverseStockSplit',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Reverse stock split announced',
          details: {
            ratio: parsedData.splitRatio || this.extractSplitRatio(filingData),
            effectiveDate: this.extractEffectiveDate(filingData),
          },
          status: 'pending',
        }));
      }
      
      // 7. Uplisting events
      if (parsedData.uplisting) {
        events.push(this.createEvent({
          type: 'uplisting',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Uplisting to major exchange announced',
          details: {
            currentExchange: this.extractCurrentExchange(filingData),
            targetExchange: this.extractTargetExchange(filingData),
            effectiveDate: this.extractEffectiveDate(filingData),
          },
          status: 'pending',
        }));
      }
      
      // 8. FDA Approval events
      if (parsedData.fdaApproval) {
        events.push(this.createEvent({
          type: 'fdaApproval',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'FDA approval announced',
          details: {
            product: this.extractProductName(filingData),
            approvalType: this.extractApprovalType(filingData),
          },
          status: 'completed',
        }));
      }
      
      // 9. Patent Approval events
      if (parsedData.patentApproval || parsedData.newPatents) {
        events.push(this.createEvent({
          type: 'patentApproval',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Patent approval or issuance announced',
          details: {
            patentInfo: parsedData.patentInfo,
          },
          status: 'completed',
        }));
      }
      
      // 10. Spin-off events
      if (parsedData.spinOff) {
        events.push(this.createEvent({
          type: 'spinOff',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Spin-off of business unit announced',
          details: {
            unitName: this.extractSpinOffUnitName(filingData),
            recordDate: this.extractRecordDate(filingData),
            distributionDate: this.extractDistributionDate(filingData),
          },
          status: 'pending',
        }));
      }
      
      // 11. Special Dividend events
      if (parsedData.specialDividend) {
        events.push(this.createEvent({
          type: 'specialDividend',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Special dividend announced',
          details: {
            amount: this.extractDividendAmount(filingData),
            recordDate: this.extractRecordDate(filingData),
            paymentDate: this.extractPaymentDate(filingData),
          },
          status: 'pending',
        }));
      }
      
      // 12. Debt Reduction events
      if (parsedData.debtReduction) {
        events.push(this.createEvent({
          type: 'debtReduction',
          cik,
          companyName,
          identifiedDate: filingDate,
          sourceFormType: formType,
          sourceAccessionNumber: accessionNumber,
          sourceUrl,
          description: 'Significant debt reduction or refinancing announced',
          details: {
            amount: this.extractDebtAmount(filingData),
            type: this.extractDebtReductionType(filingData),
          },
          status: 'pending',
        }));
      }
      
      return events;
    } catch (error) {
      logger.error(`Error extracting events from filing ${accessionNumber}:`, error);
      return [];
    }
  }
  
  /**
   * Create a standardized event object
   */
  private createEvent(data: Partial<EventData>): EventData {
    return {
      id: `${data.type}-${data.cik}-${data.sourceAccessionNumber}`,
      type: '',
      cik: '',
      companyName: '',
      identifiedDate: '',
      sourceFormType: '',
      sourceAccessionNumber: '',
      description: '',
      details: {},
      status: 'unknown',
      ...data,
    };
  }
  
  // The following methods use natural language processing and heuristics
  // to extract specific details from filing content. In practice, these would use
  // more sophisticated NLP or pattern matching techniques.
  
  private extractNewName(filing: FilingData): string | undefined {
    try {
      // Regular expression to find phrases that typically indicate a new name
      const patterns = [
        /change(?:d|s)? (?:the |its |their )?(?:corporate |company )?name (?:to|from) ["']([^"']+)["']/i,
        /new (?:corporate |company )?name (?:will be|is) ["']([^"']+)["']/i,
        /rename(?:d|s)? (?:the company|itself) (?:to|as) ["']([^"']+)["']/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting new name:', error);
      return undefined;
    }
  }
  
  private extractOldTicker(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /(?:current|old|previous) (?:ticker|trading) symbol (?:is|was) ["']([^"']{1,5})["']/i,
        /ticker symbol (?:from|changed from) ["']([^"']{1,5})["']/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting old ticker:', error);
      return undefined;
    }
  }
  
  private extractNewTicker(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /(?:new|changed) (?:ticker|trading) symbol (?:will be|is) ["']([^"']{1,5})["']/i,
        /ticker symbol (?:to|changed to) ["']([^"']{1,5})["']/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting new ticker:', error);
      return undefined;
    }
  }
  
  private extractEffectiveDate(filing: FilingData): string | undefined {
    try {
      // Look for dates in common formats that follow phrases indicating an effective date
      const patterns = [
        /effective (?:as of |on |date[: ]+)([A-Z][a-z]+ \d{1,2},? \d{4})/i,
        /will (?:be |become |take )effective (?:on |as of |)([A-Z][a-z]+ \d{1,2},? \d{4})/i,
        /effective date[: ]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          // Convert to ISO format
          try {
            const dateStr = match[1].trim();
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          } catch (_) {
            // If date parsing fails, just return the raw string
            return match[1].trim();
          }
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting effective date:', error);
      return undefined;
    }
  }
  
  private extractSplitRatio(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /reverse (?:stock )?split (?:at a )?ratio of (?:(\d+)[: ](\d+)|(\d+) for (\d+))/i,
        /(\d+)[: ](\d+) reverse (?:stock )?split/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match) {
          if (match[1] && match[2]) {
            return `${match[1]}:${match[2]}`;
          } else if (match[3] && match[4]) {
            return `${match[3]}:${match[4]}`;
          }
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting split ratio:', error);
      return undefined;
    }
  }
  
  private extractCurrentExchange(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /currently (?:listed|trading) on (?:the )?([A-Za-z ]+)/i,
        /uplisting from (?:the )?([A-Za-z ]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      // Default to OTC if uplisting is detected but no specific exchange is mentioned
      return 'OTC Markets';
    } catch (error) {
      logger.error('Error extracting current exchange:', error);
      return undefined;
    }
  }
  
  private extractTargetExchange(filing: FilingData): string | undefined {
    try {
      const content = filing.content.toLowerCase();
      
      if (content.includes('nasdaq capital market')) {
        return 'Nasdaq Capital Market';
      } else if (content.includes('nasdaq global market')) {
        return 'Nasdaq Global Market';
      } else if (content.includes('nasdaq global select')) {
        return 'Nasdaq Global Select Market';
      } else if (content.includes('nyse american')) {
        return 'NYSE American';
      } else if (content.includes('nyse')) {
        return 'New York Stock Exchange';
      } else if (content.includes('nasdaq')) {
        return 'Nasdaq';
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting target exchange:', error);
      return undefined;
    }
  }
  
  private extractProductName(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /FDA (?:approval|cleared|authorized) (?:for|of) (?:its |the |)([^,.;:]+)/i,
        /approval (?:for|of) (?:its |the |)([^,.;:]+) (?:from|by) the FDA/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting product name:', error);
      return undefined;
    }
  }
  
  private extractApprovalType(filing: FilingData): string | undefined {
    try {
      const content = filing.content.toLowerCase();
      
      if (content.includes('510(k)') || content.includes('510k')) {
        return '510(k) Clearance';
      } else if (content.includes('de novo')) {
        return 'De Novo Classification';
      } else if (content.includes('pma') || content.includes('pre-market approval')) {
        return 'Pre-Market Approval (PMA)';
      } else if (content.includes('nda') || content.includes('new drug application')) {
        return 'New Drug Application (NDA)';
      } else if (content.includes('bla') || content.includes('biologics license')) {
        return 'Biologics License Application (BLA)';
      } else if (content.includes('anda') || content.includes('abbreviated new drug')) {
        return 'Abbreviated New Drug Application (ANDA)';
      } else if (content.includes('emergency use') || content.includes('eua')) {
        return 'Emergency Use Authorization (EUA)';
      }
      
      return 'FDA Approval';
    } catch (error) {
      logger.error('Error extracting approval type:', error);
      return undefined;
    }
  }
  
  private extractSpinOffUnitName(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /spin(?:-| )off of (?:its |the |)([^,.;:]+)/i,
        /spin(?:-| )off (?:its |the |)([^,.;:]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting spin-off unit name:', error);
      return undefined;
    }
  }
  
  private extractRecordDate(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /record date (?:of |is |will be |)([A-Z][a-z]+ \d{1,2},? \d{4})/i,
        /record date (?:of |is |will be |)(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          try {
            const dateStr = match[1].trim();
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          } catch (_) {
            return match[1].trim();
          }
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting record date:', error);
      return undefined;
    }
  }
  
  private extractDistributionDate(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /distribution date (?:of |is |will be |)([A-Z][a-z]+ \d{1,2},? \d{4})/i,
        /distribution date (?:of |is |will be |)(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          try {
            const dateStr = match[1].trim();
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          } catch (_) {
            return match[1].trim();
          }
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting distribution date:', error);
      return undefined;
    }
  }
  
  private extractDividendAmount(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /special dividend of \$([\d.]+)/i,
        /special dividend in the amount of \$([\d.]+)/i,
        /(\$[\d.]+) (?:per share |)special dividend/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting dividend amount:', error);
      return undefined;
    }
  }
  
  private extractPaymentDate(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /payment date (?:of |is |will be |)([A-Z][a-z]+ \d{1,2},? \d{4})/i,
        /payment date (?:of |is |will be |)(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
        /payable (?:on |)([A-Z][a-z]+ \d{1,2},? \d{4})/i,
        /will be paid (?:on |)(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          try {
            const dateStr = match[1].trim();
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          } catch (_) {
            return match[1].trim();
          }
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting payment date:', error);
      return undefined;
    }
  }
  
  private extractDebtAmount(filing: FilingData): string | undefined {
    try {
      const patterns = [
        /(?:reduce|reducing|reduced|repay|repaying|repaid|refinance|refinancing|refinanced) (?:its |their |the |)debt (?:by |in the amount of |of |totaling |)\$([\d.,]+)(?:\s+million|\s+billion)?/i,
        /\$([\d.,]+)(?:\s+million|\s+billion)? (?:of |in |)debt (?:reduction|repayment|refinancing)/i
      ];
      
      for (const pattern of patterns) {
        const match = filing.content.match(pattern);
        if (match && match[1]) {
          let amount = match[1].replace(/,/g, '');
          if (match[0].toLowerCase().includes('million')) {
            amount += '000000';
          } else if (match[0].toLowerCase().includes('billion')) {
            amount += '000000000';
          }
          return ' + amount;
        }
      }
      
      return undefined;
    } catch (error) {
      logger.error('Error extracting debt amount:', error);
      return undefined;
    }
  }
  
  private extractDebtReductionType(filing: FilingData): string | undefined {
    try {
      const content = filing.content.toLowerCase();
      
      if (content.includes('refinanc')) {
        return 'Refinancing';
      } else if (content.includes('early repayment') || content.includes('prepayment')) {
        return 'Early Repayment';
      } else if (content.includes('extinguish')) {
        return 'Debt Extinguishment';
      } else if (content.includes('restructur')) {
        return 'Restructuring';
      } else if (content.includes('repay') || content.includes('reduc')) {
        return 'Repayment/Reduction';
      }
      
      return 'Debt Transaction';
    } catch (error) {
      logger.error('Error extracting debt reduction type:', error);
      return undefined;
    }
  }
}

// Export a singleton instance
export const eventExtractor = new EventExtractor();
