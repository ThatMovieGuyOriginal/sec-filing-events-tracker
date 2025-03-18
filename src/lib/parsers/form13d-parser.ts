// src/lib/parsers/form13d-parser.ts
import { BaseParser, FilingData } from './base-parser';
import logger from '../utils/logger';

/**
 * Parser for Schedule 13D filings (institutional ownership)
 */
export class Form13DParser extends BaseParser {
  canParse(formType: string): boolean {
    return formType === 'SC 13D';
  }
  
  async parse(filingContent: string, metadata: any): Promise<FilingData> {
    logger.info(`Parsing Schedule 13D filing: ${metadata.accessionNumber}`);
    
    const parsedData: Record<string, any> = {
      reportingPerson: null,
      cusip: null,
      issuerName: null,
      percentOwned: 0,
      purpose: null,
      isActivist: false,
    };
    
    try {
      // Extract reporting person (institutional investor)
      const reportingPersonRegex = /<reportingPersonName>(.*?)<\/reportingPersonName>/;
      const reportingPersonMatch = filingContent.match(reportingPersonRegex);
      if (reportingPersonMatch && reportingPersonMatch[1]) {
        parsedData.reportingPerson = reportingPersonMatch[1];
      }
      
      // Extract CUSIP (identifier for the security)
      const cusipRegex = /<cusip>(.*?)<\/cusip>/;
      const cusipMatch = filingContent.match(cusipRegex);
      if (cusipMatch && cusipMatch[1]) {
        parsedData.cusip = cusipMatch[1];
      }
      
      // Extract issuer name (company being invested in)
      const issuerNameRegex = /<issuerName>(.*?)<\/issuerName>/;
      const issuerNameMatch = filingContent.match(issuerNameRegex);
      if (issuerNameMatch && issuerNameMatch[1]) {
        parsedData.issuerName = issuerNameMatch[1];
      }
      
      // Extract percentage of class owned
      const percentOwnedRegex = /<percentOfClass>(.*?)<\/percentOfClass>/;
      const percentOwnedMatch = filingContent.match(percentOwnedRegex);
      if (percentOwnedMatch && percentOwnedMatch[1]) {
        parsedData.percentOwned = parseFloat(percentOwnedMatch[1]);
      }
      
      // Extract purpose of transaction
      const purposeRegex = /<purpose>(.*?)<\/purpose>/s;
      const purposeMatch = filingContent.match(purposeRegex);
      if (purposeMatch && purposeMatch[1]) {
        parsedData.purpose = purposeMatch[1];
        
        // Check if this appears to be an activist investor based on purpose
        const activistKeywords = [
          'change board', 'management change', 'strategic alternatives',
          'strategic review', 'sell the company', 'merger', 'acquisition',
          'activist', 'proxy contest', 'board seat', 'director nomination'
        ];
        
        parsedData.isActivist = this.hasKeywords(parsedData.purpose, activistKeywords);
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
      logger.error(`Error parsing Schedule 13D filing ${metadata.accessionNumber}:`, error);
      throw new Error(`Failed to parse Schedule 13D filing: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
