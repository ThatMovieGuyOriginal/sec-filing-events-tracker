// src/lib/parsers/form10q-parser.ts
import { BaseParser, FilingData } from './base-parser';
import { logger } from '../utils/logger';

/**
 * Parser for Form 10-Q filings with focus on buybacks
 */
export class Form10QParser extends BaseParser {
  canParse(formType: string): boolean {
    return formType === '10-Q';
  }
  
  async parse(filingContent: string, metadata: any): Promise<FilingData> {
    logger.info(`Parsing 10-Q filing: ${metadata.accessionNumber}`);
    
    const parsedData: Record<string, any> = {
      buyback: false,
      buybackDetails: null,
      patentInfo: null,
    };
    
    try {
      // Look for the share repurchase section
      const buybackSection = this.extractSection(
        filingContent,
        'Issuer Purchases of Equity Securities',
        'Item'
      );
      
      if (buybackSection) {
        parsedData.buyback = true;
        parsedData.buybackDetails = buybackSection;
        
        // Try to extract more structured data about buybacks
        const totalSharesRegex = /total\s+of\s+([\d,]+)\s+shares/i;
        const totalSharesMatch = buybackSection.match(totalSharesRegex);
        if (totalSharesMatch && totalSharesMatch[1]) {
          parsedData.totalSharesRepurchased = totalSharesMatch[1].replace(/,/g, '');
        }
        
        const dollarAmountRegex = /\$([\d,]+(?:\.\d+)?)\s+(?:million|billion)/i;
        const dollarAmountMatch = buybackSection.match(dollarAmountRegex);
        if (dollarAmountMatch && dollarAmountMatch[1]) {
          let amount = parseFloat(dollarAmountMatch[1].replace(/,/g, ''));
          if (buybackSection.includes('billion')) {
            amount *= 1000;
          }
          parsedData.buybackAmount = amount;
        }
      }
      
      // Look for patent information
      const patentSection = this.extractSection(
        filingContent,
        'Patents',
        'Item'
      ) || this.extractSection(
        filingContent,
        'Intellectual Property',
        'Item'
      );
      
      if (patentSection) {
        parsedData.patentInfo = patentSection;
        
        // Check for new patent issuances
        parsedData.newPatents = this.hasKeywords(patentSection, [
          'new patent', 'patent issuance', 'patent approval',
          'patent office has granted', 'patent has been issued'
        ]);
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
      logger.error(`Error parsing 10-Q filing ${metadata.accessionNumber}:`, error);
      throw new Error(`Failed to parse 10-Q filing: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
