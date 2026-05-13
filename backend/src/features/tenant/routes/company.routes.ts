import { Router } from "express";
import {
  protectMultiTenant,
  verifyTenantAccess,
  requireRole,
  requirePermission,
} from "../middleware/tenant.middleware.js";
import {
  createCompany,
  getCompanyDetails,
  updateCompanySettings,
  getCompanyMembers,
  addMember,
  removeMember,
  getSubscriptionInfo,
  deleteCompany,
} from "../controllers/company.controller.js";
import { validate } from "@common/middleware/validation.middleware.js";
import {
  createCompanySchema,
  updateCompanySettingsSchema,
  addMemberSchema,
} from "../schemas/company.schemas.js";
import { apiLimiter } from "@common/middleware/rateLimiter.middleware.js";
import { UserRole } from "../types/tenant.types.js";

const router = Router();

/**
 * Company Management Routes
 * All routes require multi-tenant authentication
 */

/**
 * Create a new company (tenant)
 * POST /api/v1/companies
 */
router.post(
  "/",
  protectMultiTenant,
  validate(createCompanySchema),
  apiLimiter,
  createCompany
);

/**
 * Get authenticated user's company details
 * GET /api/v1/companies/my-company
 * Requires: Authentication
 */
router.get(
  "/my-company",
  protectMultiTenant,
  verifyTenantAccess,
  getCompanyDetails
);

/**
 * Update company settings
 * PUT /api/v1/companies/settings
 * Requires: Authentication + Admin role
 */
router.put(
  "/settings",
  protectMultiTenant,
  verifyTenantAccess,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(updateCompanySettingsSchema),
  updateCompanySettings
);

/**
 * Get all members in company
 * GET /api/v1/companies/members
 * Requires: Authentication
 */
router.get(
  "/members",
  protectMultiTenant,
  verifyTenantAccess,
  getCompanyMembers
);

/**
 * Add member to company
 * POST /api/v1/companies/members
 * Requires: Authentication + Admin role
 */
router.post(
  "/members",
  protectMultiTenant,
  verifyTenantAccess,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(addMemberSchema),
  addMember
);

/**
 * Remove member from company
 * DELETE /api/v1/companies/members/:userId
 * Requires: Authentication + Admin role
 */
router.delete(
  "/members/:userId",
  protectMultiTenant,
  verifyTenantAccess,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  removeMember
);

/**
 * Get subscription information
 * GET /api/v1/companies/subscription
 * Requires: Authentication
 */
router.get(
  "/subscription",
  protectMultiTenant,
  verifyTenantAccess,
  getSubscriptionInfo
);

/**
 * Delete company (soft delete)
 * DELETE /api/v1/companies
 * Requires: Authentication + Admin role
 */
router.delete(
  "/",
  protectMultiTenant,
  verifyTenantAccess,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  deleteCompany
);

export default router;
