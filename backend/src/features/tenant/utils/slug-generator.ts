/**
 * Utility functions for tenant management
 */

/**
 * Generate a URL-friendly slug from company name
 * Examples:
 *   "John's Tech Company" -> "johns-tech-company"
 *   "Company 123" -> "company-123"
 */
export function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
  );
}

/**
 * Check if user has permission to perform action on company
 */
export function canManageCompany(
  userRole: string,
  userCompanyId: string,
  targetCompanyId: string
): boolean {
  // Super admin can manage any company
  if (userRole === "super_admin") {
    return true;
  }

  // Company admin can only manage their own company
  if (userRole === "admin") {
    return userCompanyId === targetCompanyId;
  }

  // Other roles cannot manage company
  return false;
}

/**
 * Check if user can add/remove members
 */
export function canModifyMembers(userRole: string): boolean {
  return userRole === "admin" || userRole === "super_admin";
}

/**
 * Default permissions for new members
 */
export const DEFAULT_MEMBER_ROLE = "viewer";

/**
 * Generate an invitation code for new members
 */
export function generateInvitationCode(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}
