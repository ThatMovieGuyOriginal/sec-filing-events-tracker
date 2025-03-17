// src/lib/utils/xml-parser.ts
import { DOMParser } from 'xmldom';
import logger from './logger';

/**
 * Parse XML string to DOM Document
 * @param xmlString XML content as string
 * @returns DOM Document or null if parsing fails
 */
export function parseXML(xmlString: string): Document | null {
  try {
    // Configure xmldom parser with custom error handlers
    const parser = new DOMParser({
      errorHandler: {
        warning: (msg) => logger.warn(`XML Parser warning: ${msg}`),
        error: (msg) => logger.error(`XML Parser error: ${msg}`),
        fatalError: (msg) => {
          logger.error(`XML Parser fatal error: ${msg}`);
          throw new Error(`Fatal XML parsing error: ${msg}`);
        }
      }
    });
    
    // Parse XML string to DOM Document
    return parser.parseFromString(xmlString, 'text/xml');
  } catch (error) {
    logger.error('Failed to parse XML:', error);
    return null;
  }
}

/**
 * Extract text content from an XML node
 * @param doc XML document
 * @param nodeName Name of the node to extract text from
 * @returns Text content of the node or null if not found
 */
export function getNodeText(doc: Document, nodeName: string): string | null {
  try {
    const node = doc.getElementsByTagName(nodeName)[0];
    return node ? node.textContent : null;
  } catch (error) {
    logger.error(`Failed to get node text for ${nodeName}:`, error);
    return null;
  }
}

/**
 * Extract text content from multiple XML nodes
 * @param doc XML document
 * @param nodeName Name of the nodes to extract text from
 * @returns Array of text content from the nodes
 */
export function getNodesText(doc: Document, nodeName: string): string[] {
  try {
    const nodes = doc.getElementsByTagName(nodeName);
    const results: string[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      const textContent = nodes[i].textContent;
      if (textContent) {
        results.push(textContent);
      }
    }
    
    return results;
  } catch (error) {
    logger.error(`Failed to get nodes text for ${nodeName}:`, error);
    return [];
  }
}

/**
 * Get attribute value from a node
 * @param doc XML document
 * @param nodeName Name of the node
 * @param attrName Name of the attribute
 * @returns Attribute value or null if not found
 */
export function getNodeAttribute(doc: Document, nodeName: string, attrName: string): string | null {
  try {
    const node = doc.getElementsByTagName(nodeName)[0];
    return node ? node.getAttribute(attrName) : null;
  } catch (error) {
    logger.error(`Failed to get attribute ${attrName} from node ${nodeName}:`, error);
    return null;
  }
}

// Export all functions
export default {
  parseXML,
  getNodeText,
  getNodesText,
  getNodeAttribute
};
