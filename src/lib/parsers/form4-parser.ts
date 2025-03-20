// src/lib/parsers/form4-parser.ts
import { BaseParser, FilingData } from './base-parser';
import logger from '../utils/logger';

/**
 * Parser for Form 4 (insider trading) filings
 */
export class Form4Parser extends BaseParser {
  canParse(formType: string): boolean {
    return formType === '4';
  }
  
  async parse(filingContent: string, metadata: any): Promise<FilingData> {
    logger.info(`Parsing Form 4 filing: ${metadata.accessionNumber}`);
    
    const parsedData: Record<string, any> = {
      insiderBuying: false,
      transactions: [],
      reportingPerson: null,
      relationship: null,
    };
    
    try {
      // Extract reporting person name
      const reportingPersonRegex = /<rptOwnerName>(.*?)<\/rptOwnerName>/;
      const reportingPersonMatch = filingContent.match(reportingPersonRegex);
      if (reportingPersonMatch && reportingPersonMatch[1]) {
        parsedData.reportingPerson = reportingPersonMatch[1];
      }
      
      // Extract relationship to issuer (director, officer, 10% owner)
      // Replace regex with /s flag with manual string extraction
      const startToken = '<rptOwnerRelationship>';
      const endToken = '</rptOwnerRelationship>';
      const relStart = filingContent.indexOf(startToken);
      if (relStart !== -1) {
        const contentStart = relStart + startToken.length;
        const relEnd = filingContent.indexOf(endToken, contentStart);
        if (relEnd !== -1) {
          const relationship = filingContent.substring(contentStart, relEnd);
          parsedData.relationship = relationship;
          
          // Check if the person is an insider (director, officer, or 10% owner)
          const isDirector = /<isDirector>1<\/isDirector>/.test(relationship);
          const isOfficer = /<isOfficer>1<\/isOfficer>/.test(relationship);
          const isTenPercentOwner = /<isTenPercentOwner>1<\/isTenPercentOwner>/.test(relationship);
          
          parsedData.isInsider = isDirector || isOfficer || isTenPercentOwner;
        }
      }
      
      // Extract all transactions - replace regex with global flag with manual extraction
      const transactions = [];
      const transStartTag = '<nonDerivativeTransaction>';
      const transEndTag = '</nonDerivativeTransaction>';
      
      let pos = 0;
      while (true) {
        const startPos = filingContent.indexOf(transStartTag, pos);
        if (startPos === -1) break;
        
        const endPos = filingContent.indexOf(transEndTag, startPos);
        if (endPos === -1) break;
        
        // Extract the transaction block
        const block = filingContent.substring(startPos, endPos + transEndTag.length);
        transactions.push(block);
        
        // Move past this transaction for the next iteration
        pos = endPos + transEndTag.length;
      }
      
      // Process each transaction block
      for (const block of transactions) {
        // Extract transaction code (P = purchase, S = sale)
        const codeMatch = block.match(/<transactionCode>(.*?)<\/transactionCode>/);
        const code = codeMatch?.[1] || '';
        
        // Extract shares
        const sharesMatch = block.match(/<transactionShares>(.*?)<\/transactionShares>/);
        const shares = sharesMatch?.[1] ? parseFloat(sharesMatch[1]) : 0;
        
        // Extract price per share
        const priceMatch = block.match(/<transactionPricePerShare>(.*?)<\/transactionPricePerShare>/);
        const price = priceMatch?.[1] ? parseFloat(priceMatch[1]) : 0;
        
        // Extract transaction date
        const dateMatch = block.match(/<transactionDate>(.*?)<\/transactionDate>/);
        const date = dateMatch?.[1] || '';
        
        const transaction = {
          code,
          shares,
          price,
          date,
          value: shares * price,
          isPurchase: code === 'P',
        };
        
        parsedData.transactions.push(transaction);
        
        // Check for insider buying (code P = purchase)
        if (code === 'P' && parsedData.isInsider) {
          parsedData.insiderBuying = true;
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error parsing Form 4 filing ${metadata.accessionNumber}: ${errorMessage}`);
      throw new Error(`Failed to parse Form 4 filing: ${errorMessage}`);
    }
  }
}
