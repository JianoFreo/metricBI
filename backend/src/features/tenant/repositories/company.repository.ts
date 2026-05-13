import { Document } from "mongoose";
import { Company } from "../models/Company.js";
import { User } from "../models/User.js";
import { ICompany } from "../types/tenant.types.js";
import {
  scopeByTenant,
  buildTenantFilter,
  verifyResourceOwnership,
} from "../utils/query-helper.js";

export class CompanyRepository {
  /**
   * Create a new company/tenant
   */
  async createCompany(
    data: Partial<ICompany>,
    ownerId: string
  ): Promise<ICompany & Document> {
    const company = new Company({
      ...data,
      owner: ownerId,
      members: [ownerId],
    });

    return company.save();
  }

  /**
   * Find company by ID (scoped to tenant)
   * @throws Error if not found or cross-tenant access
   */
  async getCompanyById(
    companyId: string,
    userCompanyId?: string
  ): Promise<(ICompany & Document) | null> {
    const company = await Company.findById(companyId)
      .populate("owner", "firstName lastName email")
      .populate("members", "firstName lastName email role");

    if (company && userCompanyId) {
      verifyResourceOwnership(company, userCompanyId);
    }

    return company;
  }

  /**
   * Find company by slug (public lookup, no tenant scoping)
   */
  async getCompanyBySlug(slug: string): Promise<(ICompany & Document) | null> {
    return Company.findOne({ slug: slug.toLowerCase() })
      .populate("owner", "firstName lastName email")
      .populate("members", "firstName lastName email role");
  }

  /**
   * Get company details for authenticated user
   * Always scopes to user's company
   */
  async getUserCompany(companyId: string): Promise<(ICompany & Document) | null> {
    return Company.findOne(buildTenantFilter(companyId)).populate([
      { path: "owner", select: "firstName lastName email" },
      { path: "members", select: "firstName lastName email role department" },
    ]);
  }

  /**
   * Update company details
   */
  async updateCompany(
    companyId: string,
    updateData: Partial<ICompany>,
    userCompanyId: string
  ): Promise<(ICompany & Document) | null> {
    const query = Company.findByIdAndUpdate(companyId, updateData, {
      new: true,
    });
    const company = await query.populate([
      { path: "owner", select: "firstName lastName email" },
      { path: "members", select: "firstName lastName email role department" },
    ]);

    if (company) {
      verifyResourceOwnership(company, userCompanyId);
    }

    return company;
  }

  /**
   * Add member to company
   */
  async addMember(
    companyId: string,
    userId: string,
    userCompanyId: string
  ): Promise<(ICompany & Document) | null> {
    const company = await Company.findOneAndUpdate(
      buildTenantFilter(companyId),
      { $addToSet: { members: userId } },
      { new: true }
    ).populate("members", "firstName lastName email role");

    if (company) {
      verifyResourceOwnership(company, userCompanyId);
    }

    return company;
  }

  /**
   * Remove member from company
   */
  async removeMember(
    companyId: string,
    userId: string,
    userCompanyId: string
  ): Promise<(ICompany & Document) | null> {
    const company = await Company.findOneAndUpdate(
      buildTenantFilter(companyId),
      { $pull: { members: userId } },
      { new: true }
    ).populate("members", "firstName lastName email role");

    if (company) {
      verifyResourceOwnership(company, userCompanyId);
    }

    return company;
  }

  /**
   * Get company members count
   */
  async getMemberCount(companyId: string): Promise<number> {
    const company = await Company.findOne(buildTenantFilter(companyId));
    return company?.members?.length || 0;
  }

  /**
   * Check if user is company member
   */
  async isMember(companyId: string, userId: string): Promise<boolean> {
    const result = await Company.countDocuments({
      ...buildTenantFilter(companyId),
      members: userId,
    });

    return result > 0;
  }

  /**
   * Delete company (soft delete - just mark as inactive)
   */
  async deactivateCompany(
    companyId: string,
    userCompanyId: string
  ): Promise<(ICompany & Document) | null> {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { isActive: false },
      { new: true }
    );

    if (company) {
      verifyResourceOwnership(company, userCompanyId);
    }

    return company;
  }

  /**
   * Get companies by subscription tier (admin only)
   */
  async getCompaniesByTier(
    tier: string
  ): Promise<(ICompany & Document)[]> {
    return Company.find({ subscriptionTier: tier, isActive: true }).populate(
      "owner",
      "firstName lastName email"
    );
  }

  /**
   * Check subscription limits
   */
  async checkSubscriptionLimits(
    companyId: string
  ): Promise<{
    currentUsers: number;
    maxUsers: number;
    canAddUser: boolean;
    currentDataPoints: number;
    maxDataPoints: number;
  }> {
    const company = await Company.findOne(buildTenantFilter(companyId));
    if (!company) {
      throw new Error("Company not found");
    }

    const currentUsers = company.members?.length || 0;

    return {
      currentUsers,
      maxUsers: company.maxUsers,
      canAddUser: currentUsers < company.maxUsers,
      currentDataPoints: 0, // TODO: Calculate from actual data
      maxDataPoints: company.maxDataPoints,
    };
  }
}
