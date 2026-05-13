import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import logger from "@config/logger.js";

/**
 * Global error handling middleware
 * Must be the last middleware in the express app
 * Catches all errors thrown by routes and sends standardized response
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
    url: req.originalUrl,
  });

  // Known AppError
  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message, error.code);
    return;
  }

  // Mongoose Validation Error
  if (error.name === "ValidationError") {
    sendError(res, 400, "Validation failed", "VALIDATION_ERROR", error.message);
    return;
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (error.name === "CastError") {
    sendError(res, 400, "Invalid resource ID", "INVALID_ID");
    return;
  }

  // Mongoose Duplicate Key Error
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    sendError(
      res,
      409,
      `${field} already exists`,
      "DUPLICATE_RESOURCE",
      { field }
    );
    return;
  }

  // JWT Errors
  if (error.name === "JsonWebTokenError") {
    sendError(res, 401, "Invalid token", "INVALID_TOKEN");
    return;
  }

  if (error.name === "TokenExpiredError") {
    sendError(res, 401, "Token expired", "TOKEN_EXPIRED");
    return;
  }

  // Default error - don't expose internal server errors in production
  sendError(
    res,
    500,
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message,
    "INTERNAL_ERROR"
  );
};
