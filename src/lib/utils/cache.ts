// src/lib/utils/cache.ts
interface CacheOptions {
  maxItems?: number;
  defaultTTL?: number;
}

/**
 * A cache implementation with TTL support
 */
export class Cache {
  private store: Map<string, { value: string; expires: number }>;
  private options: CacheOptions;

  constructor(options: CacheOptions = {}) {
    this.store = new Map();
    this.options = {
      maxItems: options.maxItems || 1000,
      defaultTTL: options.defaultTTL || 300 // 5 minutes in seconds
    };
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    
    if (!item) {
      return null;
    }
    
    if (item.expires < Date.now()) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl TTL in seconds
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    // Clean up old entries if near max capacity
    if (this.store.size >= this.options.maxItems!) {
      this.cleanup();
    }
    
    const expires = Date.now() + (ttl || this.options.defaultTTL!) * 1000;
    this.store.set(key, { value, expires });
  }

  /**
   * Delete a value from the cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  /**
   * Clear the entire cache
   */
  async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.expires < now) {
        this.store.delete(key);
      }
    }
  }
}

// Export singleton instance
export const cache = new Cache();
