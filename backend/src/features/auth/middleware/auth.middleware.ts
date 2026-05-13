import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "@config/env.js";
import { AuthenticationError, AuthorizationError } from "@common/utils/errors.js";
import { JwtPayload, DecodedToken } from "../types/auth.types.js";

/**
 * Extend Express Request interface to include authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tenantId?: string;
    }
  }
}

/**
 * Middleware to verify JWT token and extract user info
 * Must be placed before routes that require authentication
 */
export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("No token provided");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };
    req.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError("Token expired");
    }
    throw new AuthenticationError("Invalid token");
  }
};

/**
 * Middleware to authorize based on user roles
 * @param roles Array of allowed roles
 * @returns Middleware function
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        `This action requires one of these roles: ${roles.join(", ")}`
      );
    }

    next();
  };
};

/**
 * Middleware to verify tenant access (multi-tenancy)
 */
export const verifyTenant = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const tenantId = req.params.tenantId || req.query.tenantId;

  if (!req.user?.tenantId) {
    throw new AuthenticationError("User not associated with any tenant");
  }

  if (tenantId && tenantId !== req.user.tenantId && req.user.role !== "admin") {
    throw new AuthorizationError("Not authorized to access this tenant");
  }

  next();
};
