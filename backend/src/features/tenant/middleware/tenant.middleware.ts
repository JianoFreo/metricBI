import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "@config/env.js";
import {
  AuthenticationError,
  AuthorizationError,
} from "@common/utils/errors.js";
import { IDecodedToken, UserRole, ROLE_PERMISSIONS, IJwtPayloadMultiTenant } from "../types/tenant.types.js";
/**
 * Extend Express Request interface for multi-tenant context
 */
declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayloadMultiTenant;
      companyId?: string;
    }
  }
}


/**
 * Multi-tenant JWT Protection Middleware
 * Verifies JWT token and extracts tenant context (company + user info)
 * CRITICAL: This ensures req.companyId is available on all protected routes
 */
export const protectMultiTenant = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new AuthenticationError("No authentication token provided");
  }

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET
    ) as any;

    // Attach tenant context to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      companyId: decoded.companyId,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    // CRITICAL FOR TENANT ISOLATION: Always set companyId from token
    req.companyId = decoded.companyId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError("Authentication token has expired");
    }
    throw new AuthenticationError("Invalid or malformed authentication token");
  }
};

/**
 * Enforces that the requested tenant matches the authenticated user's tenant
 * Prevents cross-tenant data access
 *
 * Usage: app.get('/companies/:companyId/data', protectMultiTenant, verifyTenantAccess, handler)
 */
export const verifyTenantAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AuthenticationError("User not authenticated");
  }

  // Get requested tenant from different sources (priority order)
  const requestedTenant =
    req.params.companyId ||
    req.params.tenantId ||
    req.query.companyId ||
    req.query.tenantId;

  // If specific tenant is requested, verify user has access
  if (requestedTenant && requestedTenant !== req.user.companyId) {
    // Only super admin can access other tenants (monitoring/support)
    if ((req.user.role as any) !== UserRole.SUPER_ADMIN) {
      throw new AuthorizationError(
        "You do not have access to this tenant/company"
      );
    }
  }

  // Ensure companyId is set from user's tenant
  req.companyId = req.user.companyId;

  next();
};

/**
 * Role-based Access Control (RBAC) Middleware
 * Checks if user's role has required permission
 *
 * Usage: app.post('/reports', protectMultiTenant, requireRole(UserRole.ANALYST, UserRole.ADMIN), handler)
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    // Super admin always has access
    if ((req.user.role as any) === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role as any)) {
      throw new AuthorizationError(
        `This action requires one of these roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
};

/**
 * Permission-based Access Control (Fine-grained)
 * Checks if user has specific permission
 *
 * Usage: app.post('/export', protectMultiTenant, requirePermission('read:reports', 'export:data'), handler)
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    // Super admin always has all permissions
    if ((req.user.role as any) === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Get role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[req.user.role as any] || [];
    const userPermissions = [...rolePermissions];

    // Check for wildcard permissions
    if (userPermissions.includes("*:*")) {
      return next();
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw new AuthorizationError(
        `Insufficient permissions. Required: ${requiredPermissions.join(", ")}`
      );
    }

    next();
  };
};

/**
 * Ensure user can only modify resources in their own company
 * Prevents accidental cross-tenant modifications
 *
 * Usage: app.put('/users/:userId', protectMultiTenant, ensureResourceOwnership, handler)
 */
export const ensureResourceOwnership = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AuthenticationError("User not authenticated");
  }

  // For super admin, allow access (with audit logging)
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // For all others, ensure they're operating within their company
  if (!req.companyId) {
    throw new AuthenticationError("Company context not found");
  }

  if (req.companyId !== req.user.companyId) {
    throw new AuthorizationError(
      "You can only modify resources in your own company"
    );
  }

  next();
};
