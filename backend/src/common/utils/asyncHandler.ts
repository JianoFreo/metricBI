import { Request, Response, NextFunction } from "express";

/**
 * Wrapper for async route handlers to catch errors automatically
 * Eliminates need for try-catch in every controller
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
