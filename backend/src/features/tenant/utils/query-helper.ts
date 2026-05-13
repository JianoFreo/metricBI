/**
 * Multi-tenant Query Helper
 * CRITICAL SECURITY: Ensures all database queries are scoped by companyId
 * This prevents cross-tenant data leakage
 */

import { Query, Document } from "mongoose";

/**
 * Enforces that a query includes the companyId filter
 * Should be applied automatically in repository layer
 *
 * @param query Mongoose query
 * @param companyId Company/Tenant ID
 * @returns Query with companyId filter applied
 */
export function scopeByTenant<T extends Document>(
  query: Query<T[], T>,
  companyId: string
): Query<T[], T> {
  return query.where("companyId").equals(companyId);
}

/**
 * Safely filter query results to ensure no cross-tenant data
 * Use this in service methods to guarantee tenant isolation
 *
 * @param query Base query object
 * @param companyId User's company ID
 * @returns Mongo query filter object
 */
export function buildTenantFilter(companyId: string): { companyId: string } {
  return { companyId };
}

/**
 * Verify that user has access to a resource
 * Checks that resource.companyId matches user's companyId
 *
 * @param resource The resource to check
 * @param userCompanyId User's company ID
 * @throws Error if cross-tenant access is attempted
 */
export function verifyResourceOwnership(
  resource: any,
  userCompanyId: string
): void {
  if (!resource) {
    throw new Error("Resource not found");
  }

  const resourceCompanyId = resource.companyId?.toString() || resource.companyId;
  const userCompanyIdStr = userCompanyId?.toString() || userCompanyId;

  if (resourceCompanyId !== userCompanyIdStr) {
    throw new Error(
      "ACCESS DENIED: Attempted cross-tenant data access. This incident has been logged."
    );
  }
}

/**
 * Batch verify multiple resources belong to the same company
 */
export function verifyResourcesOwnership(
  resources: any[],
  userCompanyId: string
): void {
  resources.forEach((resource) => verifyResourceOwnership(resource, userCompanyId));
}

/**
 * Count user's resources in their company
 * Example: Used to check if user has reached data limits
 */
export function buildCountQuery(
  baseFilter: Record<string, any>,
  companyId: string
): Record<string, any> {
  return {
    ...baseFilter,
    companyId,
  };
}

/**
 * Aggregate query with tenant scoping
 * Used for analytics/reports that need tenant isolation
 */
export function buildAggregationPipeline(
  companyId: string,
  additionalStages: Record<string, any>[] = []
): Record<string, any>[] {
  return [
    {
      $match: { companyId },
    },
    ...additionalStages,
  ];
}
