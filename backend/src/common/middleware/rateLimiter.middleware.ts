import rateLimit from "express-rate-limit";
import logger from "@config/logger.js";

/**
 * Creates a rate limiter middleware with specified parameters
 * @param windowMs Time window in milliseconds
 * @param max Maximum requests per window
 * @param message Message sent to client when limit exceeded
 * @returns Rate limiter middleware
 */
export const createRateLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true, // Include rate limit info in headers
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
      res.status(429).json({
        success: false,
        error: {
          message,
          code: "RATE_LIMIT_EXCEEDED",
        },
        timestamp: new Date().toISOString(),
      });
    },
  });
};

// Predefined rate limiters for different endpoints

/**
 * Strict limiter for authentication endpoints
 * 5 attempts per 15 minutes
 */
export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  "Too many login attempts, please try again later"
);

/**
 * General API limiter
 * 100 requests per 15 minutes
 */
export const apiLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  "Too many requests, please try again later"
);

/**
 * Loose limiter for public endpoints
 * 1000 requests per hour
 */
export const publicLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  1000,
  "Too many requests, please try again later"
);
