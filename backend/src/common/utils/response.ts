import { Response } from "express";

/**
 * Standard API response format for consistency across all endpoints
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * Send successful response
 * @param res Express response object
 * @param data Response data
 * @param statusCode HTTP status code (default: 200)
 * @returns Express response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  } as ApiResponse<T>);
};

/**
 * Send error response
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param message Error message
 * @param code Error code for frontend handling
 * @param details Additional error details
 * @returns Express response
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: unknown
): Response => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse<null>);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    timestamp: new Date().toISOString(),
  });
};
