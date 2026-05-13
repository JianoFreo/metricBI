/**
 * Multi-tenant And Role-based Access Control Type Definitions
 */

// Role hierarchy (higher number = more permissions)
export enum UserRole {
  VIEWER = "viewer", // Read-only access
  ANALYST = "analyst", // Can analyze data, create reports
  MANAGER = "manager", // Can manage analysts, approve workflows
  ADMIN = "admin", // Full tenant access but cannot delete company
  SUPER_ADMIN = "super_admin", // Super admin only (platform wide)
}

// Common permissions per role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.VIEWER]: ["read:dashboard", "read:reports"],
  [UserRole.ANALYST]: [
    "read:dashboard",
    "read:reports",
    "create:reports",
    "edit:own_reports",
  ],
  [UserRole.MANAGER]: [
    "read:dashboard",
    "read:reports",
    "create:reports",
    "edit:reports",
    "manage:users",
    "manage:dashboards",
  ],
  [UserRole.ADMIN]: [
    "read:dashboard",
    "read:reports",
    "create:reports",
    "edit:reports",
    "manage:users",
    "manage:dashboards",
    "manage:settings",
    "manage:integrations",
  ],
  [UserRole.SUPER_ADMIN]: ["*:*"], // All permissions
};

export interface ICompany {
  _id: string | import("mongoose").Types.ObjectId;
  name: string;
  slug: string; // URL-friendly name for multi-tenancy
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  employeeCount?: number;
  maxUsers: number; // Subscription limit
  maxDataPoints: number; // Data storage limit
  subscriptionTier: "free" | "starter" | "professional" | "enterprise";
  subscriptionStatus: "active" | "paused" | "cancelled";
  owner: string | import("mongoose").Types.ObjectId; // User ID of company owner
  members: Array<string | import("mongoose").Types.ObjectId>; // Array of user IDs
  customBranding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
  settings?: {
    twoFactorRequired: boolean;
    dataExportAllowed: boolean;
    apiAccessAllowed: boolean;
  };
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMultiTenant {
  _id: string | import("mongoose").Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: UserRole; // Multi-tenant role
  companyId: string | import("mongoose").Types.ObjectId; // Which company/tenant this user belongs to
  department?: string;
  position?: string;
  permissions: string[]; // Custom permissions override
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJwtPayloadMultiTenant {
  userId: string;
  email: string;
  companyId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IDecodedToken extends IJwtPayloadMultiTenant {
  iat: number;
  exp: number;
}

export interface ITenantContext {
  companyId: string;
  userId: string;
  role: UserRole;
  permissions: string[];
}

export interface IInvitationToken {
  _id: string;
  companyId: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: Date;
  createdBy: string;
  isUsed: boolean;
  usedAt?: Date;
  usedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      companyId?: string;
    }
  }
}
