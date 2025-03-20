// src/lib/edgar-api/client.ts
import axios, { AxiosAdapter } from 'axios';
import { throttleAdapterEnhancer } from 'axios-extensions';
import { parseXML } from '../utils/xml-parser';
import logger from '../utils/logger';

/**
 * Configuration options for the SEC EDGAR API client
 */
export interface EdgarApiConfig {
  /**
   * Email address required by SEC for API usage tracking
   */
  userAgent: string;
  /**
   * Requests per second to limit API calls (SEC limits to 10/s)
   */
  rateLimit: number;
  /**
   * Base URL for SEC EDGAR API
   */
  baseUrl: string;
  /**
   * Maximum number of retries for failed requests
   */
  maxRetries: number;
  /**
   * Delay between retries in ms (increases exponentially)
   */
  retryDelay: number;
}

/**
 * Parameters for searching SEC filings
 */
export interface SearchParams {
  /**
   * CIK number or ticker symbol
   */
  identifier?: string;
  /**
   * Type of form to search for (8-K, 4, SC 13D, etc.)
   */
  formType?: string;
  /**
   * Start date for search range (YYYY-MM-DD)
   */
  startDate?: string;
  /**
   * End date for search range (YYYY-MM-DD)
   */
  endDate?: string;
  /**
   * Max number of results to return
   */
  limit?: number;
}

/**
 * Response structure for a filing search
 */
export interface FilingSearchResult {
  /**
   * Array of matching filing metadata
   */
  filings: FilingMetadata[];
  /**
   * Next page token if results are paginated
   */
  nextPage?: string;
}

/**
 * Metadata for an individual SEC filing
 */
export interface FilingMetadata {
  /**
   * Accession number (unique identifier)
   */
  accessionNumber: string;
  /**
   * CIK of the filing entity
   */
  cik: string;
  /**
   * Company name
   */
  companyName: string;
  /**
   * Type of form filed
   */
  formType: string;
  /**
   * Date the filing was submitted
   */
  filingDate: string;
  /**
   * URL to access the filing content
   */
  primaryDocument: string;
  /**
   * URL to access additional filing attachments
   */
  primaryDocumentUrl: string;
}

/**
 * SEC EDGAR API client for fetching filing information
 */
export class EdgarApiClient {
  private client;
  private config: EdgarApiConfig;

  /**
   * Create a new SEC EDGAR API client
   * @param config Configuration for the API client
   */
  constructor(config: EdgarApiConfig) {
    // Create a complete config by merging defaults with provided config
    this.config = {
      rateLimit: 5,
      maxRetries: 3,
      retryDelay: 1000,
      ...config, // This will properly override any defaults if provided in config
    };

    // Create axios instance with rate limiting to avoid SEC blocks
    const axiosAdapter = axios.defaults.adapter as AxiosAdapter;
    
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'User-Agent': this.config.userAgent,
      },
      adapter: throttleAdapterEnhancer(axiosAdapter, {
        threshold: 1000 / this.config.rateLimit,
      }),
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const { config } = error;
        
        // Retry logic for specific error codes
        if (error.response && (error.response.status === 429 || error.response.status >= 500)) {
          // Set the retry count
          config.__retryCount = config.__retryCount || 0;
          
          // Check if we've maxed out retries
          if (config.__retryCount < this.config.maxRetries) {
            // Increase retry count
            config.__retryCount += 1;
            
            // Calculate exponential backoff delay
            const delay = this.config.retryDelay * Math.pow(2, config.__retryCount - 1);
            
            logger.warn(`SEC API rate limit exceeded. Retrying in ${delay}ms (attempt ${config.__retryCount}/${this.config.maxRetries})`);
            
            // Delay and retry
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.client(config);
          }
        }
        
        throw error;
      }
    );
  }

  /**
   * Search for filings matching specified criteria
   * @param params Search parameters
   * @returns Promise resolving to filing search results
   */
  async searchFilings(params: SearchParams): Promise<FilingSearchResult> {
    try {
      logger.info(`Searching filings with params: ${JSON.stringify(params)}`);
      
      const response = await this.client.get('/full-index/xbrl-idx-feeds.json');
      
      // Filter results based on search parameters
      // This is a simplified approach - in production, we'd use the actual search endpoint
      const allFilings = response.data.directory.item || [];
      
      const filteredFilings = allFilings
        .filter((filing: any) => {
          if (params.formType && filing.name !== params.formType) {
            return false;
          }
          if (params.startDate && filing.last_modified < params.startDate) {
            return false;
          }
          if (params.endDate && filing.last_modified > params.endDate) {
            return false;
          }
          return true;
        })
        .slice(0, params.limit || 100)
        .map((filing: any) => ({
          accessionNumber: filing.name.split('.')[0],
          cik: 'Unknown', // We would parse this from actual data
          companyName: 'Unknown', // We would parse this from actual data
          formType: params.formType || 'Unknown',
          filingDate: filing.last_modified,
          primaryDocument: filing.name,
          primaryDocumentUrl: `${this.config.baseUrl}/${filing.href}`,
        }));

      return {
        filings: filteredFilings,
      };
    } catch (error) {
      logger.error('Error searching filings:', error);
      throw new Error(`Failed to search filings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get filing content by its accession number
   * @param accessionNumber Unique identifier for the filing
   * @returns Promise resolving to filing content
   */
  async getFilingContent(accessionNumber: string): Promise<string> {
    try {
      logger.info(`Fetching filing content for accession number: ${accessionNumber}`);
      
      // The actual URL structure for fetching a specific filing
      const formattedAccNum = accessionNumber.replace(/-/g, '');
      const url = `/data/${formattedAccNum.substring(0, 10)}/${formattedAccNum}/${accessionNumber}.txt`;
      
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching filing content for ${accessionNumber}:`, error);
      throw new Error(`Failed to get filing content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get company information by CIK
   * @param cik Central Index Key for the company
   * @returns Promise resolving to company information
   */
  async getCompanyInfo(cik: string): Promise<any> {
    try {
      logger.info(`Fetching company info for CIK: ${cik}`);
      
      // Format CIK with leading zeros to 10 digits as required by SEC API
      const formattedCik = cik.padStart(10, '0');
      const url = `https://data.sec.gov/submissions/CIK${formattedCik}.json`;
      
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching company info for CIK ${cik}:`, error);
      throw new Error(`Failed to get company info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get ticker information by CIK
   * @param cik Central Index Key for the company
   * @returns Promise resolving to ticker information
   */
  async getTickerByCIK(cik: string): Promise<string | null> {
    try {
      const companyInfo = await this.getCompanyInfo(cik);
      return companyInfo.tickers?.[0] || null;
    } catch (error) {
      logger.warn(`Could not find ticker for CIK ${cik}:`, error);
      return null;
    }
  }

  /**
   * Get CIK by ticker symbol
   * @param ticker Ticker symbol of the company
   * @returns Promise resolving to CIK number
   */
  async getCIKByTicker(ticker: string): Promise<string | null> {
    try {
      logger.info(`Looking up CIK for ticker: ${ticker}`);
      
      // SEC provides a ticker to CIK mapping
      const response = await this.client.get('https://www.sec.gov/files/company_tickers.json');
      
      // Define a type for the mapping entries
      type TickerMappingEntry = {
        ticker: string;
        cik_str: string;
      };

      // Cast the ticker mapping to the expected type
      const tickerMapping = Object.values(response.data) as TickerMappingEntry[];
      const match = tickerMapping.find(entry => 
        entry.ticker.toLowerCase() === ticker.toLowerCase()
      );
      
      if (match) {
        return match.cik_str.toString();
      }
      
      return null;
    } catch (error) {
      logger.error(`Error looking up CIK for ticker ${ticker}:`, error);
      return null;
    }
  }
}

// Export a factory function to create the client with proper configuration
export const createEdgarClient = (config: Partial<EdgarApiConfig> = {}): EdgarApiClient => {
  return new EdgarApiClient({
    userAgent: process.env.SEC_API_EMAIL || 'example@example.com',
    rateLimit: 2, // Conservative rate limit
    baseUrl: 'https://www.sec.gov/Archives/edgar',
    maxRetries: 3,
    retryDelay: 1000,
    ...config,
  });
};
