import redis from 'redis';
import logger from '@config/logger.js';

/**
 * Redis Cache Client
 * Handles dashboard caching with TTL
 */
export class CacheService {
  private static client: redis.RedisClient;
  private static readonly TTL = {
    DASHBOARD: 600, // 10 minutes
    ASSETS: 1800, // 30 minutes
    INVENTORY: 900, // 15 minutes
    PROCUREMENT: 1200, // 20 minutes
    INSIGHTS: 3600, // 1 hour
  };

  /**
   * Initialize Redis connection
   */
  static async initialize(): Promise<void> {
    try {
      // In development, use in-memory cache
      // In production, connect to Redis
      if (!this.client) {
        logger.info('Cache service initialized (in-memory fallback)');
      }
    } catch (error) {
      logger.warn('Cache service initialization failed, using memory fallback');
    }
  }

  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      // Using in-memory cache for now
      const cached = this.getMemory(key);
      if (cached) {
        logger.debug('Cache hit', { key });
        return cached as T;
      }
      return null;
    } catch (error) {
      logger.warn('Cache get failed', { key, error: (error as Error).message });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  static async set<T>(key: string, value: T, ttl: number = this.TTL.DASHBOARD): Promise<boolean> {
    try {
      // Using in-memory cache for now
      this.setMemory(key, value, ttl);
      logger.debug('Cache set', { key, ttl });
      return true;
    } catch (error) {
      logger.warn('Cache set failed', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  static async delete(key: string): Promise<boolean> {
    try {
      this.deleteMemory(key);
      logger.debug('Cache deleted', { key });
      return true;
    } catch (error) {
      logger.warn('Cache delete failed', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<boolean> {
    try {
      this.clearMemory();
      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.warn('Cache clear failed', { error: (error as Error).message });
      return false;
    }
  }

  /**
   * Generate cache key
   */
  static generateKey(prefix: string, tenantId: string, userId: string, suffix?: string): string {
    const key = `dashboard:${prefix}:${tenantId}:${userId}`;
    return suffix ? `${key}:${suffix}` : key;
  }

  // ============ In-Memory Cache Implementation ============
  private static memoryCache = new Map<
    string,
    { value: any; expiry: number }
  >();

  private static getMemory(key: string): any {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value;
  }

  private static setMemory(key: string, value: any, ttl: number): void {
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  private static deleteMemory(key: string): void {
    this.memoryCache.delete(key);
  }

  private static clearMemory(): void {
    this.memoryCache.clear();
  }
}
