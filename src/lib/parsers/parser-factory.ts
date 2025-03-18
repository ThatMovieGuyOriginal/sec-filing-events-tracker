// src/lib/parsers/parser-factory.ts
import { BaseParser } from './base-parser';
import { Form8KParser } from './form8k-parser';
import { Form4Parser } from './form4-parser';
import { Form13DParser } from './form13d-parser';
import { Form10QParser } from './form10q-parser';
import { Form14AParser } from './form14a-parser';
import logger from '../utils/logger';

/**
 * Factory for creating appropriate parser instances
 */
export class ParserFactory {
  private parsers: BaseParser[] = [];
  
  constructor() {
    // Register all available parsers
    this.registerParser(new Form8KParser());
    this.registerParser(new Form4Parser());
    this.registerParser(new Form13DParser());
    this.registerParser(new Form10QParser());
    this.registerParser(new Form14AParser());
  }
  
  /**
   * Register a new parser
   */
  registerParser(parser: BaseParser): void {
    this.parsers.push(parser);
  }
  
  /**
   * Get appropriate parser for a form type
   */
  getParser(formType: string): BaseParser | null {
    const parser = this.parsers.find(p => p.canParse(formType));
    
    if (!parser) {
      logger.warn(`No parser found for form type: ${formType}`);
      return null;
    }
    
    return parser;
  }
}

// Export a singleton instance of the factory
export const parserFactory = new ParserFactory();
