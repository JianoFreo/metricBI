import { createClient, RedisClientType } from "redis";
import env from "./env.js";
import logger from "./logger.js";

let redisClient: RedisClientType | null = null;

/**
 * Connect to Redis
 * Redis is used for caching, session management, and job queues
 */
export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    if (!env.REDIS_URL) {
      logger.warn("⚠ REDIS_URL not configured, Redis features will be disabled");
      return null as any;
    }

    redisClient = createClient({
      url: env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error("✗ Max Redis reconnection attempts reached");
            return new Error("Max reconnection attempts reached");
          }
          return retries * 100;
        },
      },
    });

    redisClient.on("error", (err) => {
      logger.error("✗ Redis client error:", err);
    });

    redisClient.on("connect", () => {
      logger.info("✓ Redis connected successfully");
    });

    redisClient.on("reconnecting", () => {
      logger.warn("⚠ Redis reconnecting...");
    });

    await redisClient.connect();
    logger.info("✓ Redis connection established");

    return redisClient;
  } catch (error) {
    logger.error("✗ Redis connection failed:", error);
    // Don't exit on Redis failure - it's optional for caching
    return null as any;
  }
};

/**
 * Get Redis client instance
 */
export const getRedis = (): RedisClientType | null => {
  return redisClient;
};

/**
 * Disconnect from Redis
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.disconnect();
      logger.info("✓ Redis disconnected");
    } catch (error) {
      logger.error("✗ Redis disconnection error:", error);
    }
  }
};

/**
 * Health check for Redis
 */
export const isRedisConnected = async (): Promise<boolean> => {
  if (!redisClient) return false;
  try {
    await redisClient.ping();
    return true;
  } catch {
    return false;
  }
};
