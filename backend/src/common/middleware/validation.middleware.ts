import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Middleware to validate request body against a Zod schema
 * @param schema Zod schema to validate against
 * @returns Validation middleware
 */
export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Validation failed";
      throw new ValidationError(message);
    }
  };

/**
 * Middleware to validate query parameters
 */
export const validateQuery =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Invalid query parameters";
      throw new ValidationError(message);
    }
  };

/**
 * Middleware to validate URL parameters
 */
export const validateParams =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated as any;
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Invalid parameters";
      throw new ValidationError(message);
    }
  };
