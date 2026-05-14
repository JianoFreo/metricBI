import { CompanyRepository } from "../repositories/company.repository";
import { UserRepository } from "../repositories/user.repository";
import { ICompany, UserRole } from "../types/tenant.types";
import { ConflictError, NotFoundError, AuthorizationError } from "@common/utils/errors";
import { generateSlug } from "../utils/slug-generator";

export class CompanyService {
  private repository = new CompanyRepository();
  private userRepository = new UserRepository();

  /**
   * Create a new company (tenant)
   * Only the owner will be added to members initially
   */
  async createCompany(
    data: {
      name: string;
      description?: string;
      industry?: string;
      employeeCount?: number;
    },
    ownerId: string
  ): Promise<any> {
    // Validate owner exists
    const owner = await this.userRepository.findById(ownerId);
    if (!owner) {
      throw new NotFoundError("Company owner not found");
    }

    // Generate unique slug
    const slug = generateSlug(data.name);

    const existingSlug = await this.repository.getCompanyBySlug(slug);
    if (existingSlug) {
      throw new ConflictError("Company name already taken");
    }

    const company = await this.repository.createCompany(
      {
        ...data,
        slug,
      },
      ownerId
    );

    return {
      id: company._id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      owner: company.owner,
      members: company.members,
      subscriptionTier: company.subscriptionTier,
      maxUsers: company.maxUsers,
      createdAt: company.createdAt,
    };
  }

  /**
   * Get company details for authenticated user
   */
  async getCompanyDetails(companyId: string): Promise<any> {
    const company = await this.repository.getUserCompany(companyId);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    return this.formatCompanyResponse(company);
  }

  /**
   * Update company settings
   */
  async updateCompanySettings(
    companyId: string,
    updates: {
      name?: string;
      description?: string;
      website?: string;
      logo?: string;
      customBranding?: any;
      settings?: any;
    },
    userRole: UserRole
  ): Promise<any> {
    // Only admin can update company settings
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new AuthorizationError(
        "Only company admin can update company settings"
      );
    }

    const company = await this.repository.updateCompany(
      companyId,
      updates,
      companyId
    );

    if (!company) {
      throw new NotFoundError("Company not found");
    }

    return this.formatCompanyResponse(company);
  }

  /**
   * Get company members
   */
  async getCompanyMembers(companyId: string): Promise<any[]> {
    const company = await this.repository.getUserCompany(companyId);
    if (!company) {
      throw new NotFoundError("Company not found");
    }

    return (company.members || []).map((member: any) => ({
      id: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role,
      department: member.department,
    }));
  }

  /**
   * Add user to company (invite or direct add)
   */
  async addMemberToCompany(
    companyId: string,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    // Only admin can add members
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new AuthorizationError(
        "Only company admin can add members"
      );
    }

    // Check subscription limit
    const limits = await this.repository.checkSubscriptionLimits(companyId);
    if (!limits.canAddUser) {
      throw new ConflictError(
        `Company has reached user limit (${limits.maxUsers}). Upgrade subscription to add more users.`
      );
    }

    // Check if user already member
    const isMember = await this.repository.isMember(companyId, userId);
    if (isMember) {
      throw new ConflictError("User is already a member of this company");
    }

    const company = await this.repository.addMember(companyId, userId, companyId);

    if (!company) {
      throw new NotFoundError("Company not found");
    }

    return this.formatCompanyResponse(company);
  }

  /**
   * Remove member from company
   */
  async removeMemberFromCompany(
    companyId: string,
    userId: string,
    userRole: UserRole,
    requesterUserId: string
  ): Promise<any> {
    // Only admin can remove members
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new AuthorizationError(
        "Only company admin can remove members"
      );
    }

    // Cannot remove yourself
    if (userId === requesterUserId) {
      throw new AuthorizationError("Cannot remove yourself from company");
    }

    const company = await this.repository.removeMember(companyId, userId, companyId);

    if (!company) {
      throw new NotFoundError("Company not found");
    }

    return this.formatCompanyResponse(company);
  }

  /**
   * Get subscription information
   */
  async getSubscriptionInfo(companyId: string): Promise<any> {
    const limits = await this.repository.checkSubscriptionLimits(companyId);

    return {
      tier: "starter", // TODO: Get from company
      status: "active", // TODO: Get from company
      currentUsers: limits.currentUsers,
      maxUsers: limits.maxUsers,
      usersPercentage: Math.round((limits.currentUsers / limits.maxUsers) * 100),
      currentDataPoints: limits.currentDataPoints,
      maxDataPoints: limits.maxDataPoints,
      canAddUser: limits.canAddUser,
    };
  }

  /**
   * Delete company (deactivate)
   */
  async deleteCompany(
    companyId: string,
    userRole: UserRole
  ): Promise<void> {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new AuthorizationError(
        "Only company admin can delete company"
      );
    }

    const result = await this.repository.deactivateCompany(companyId, companyId);

    if (!result) {
      throw new NotFoundError("Company not found");
    }
  }

  /**
   * Helper: Format company response
   */
  private formatCompanyResponse(company: any): any {
    return {
      id: company._id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      logo: company.logo,
      website: company.website,
      industry: company.industry,
      employeeCount: company.employeeCount,
      subscriptionTier: company.subscriptionTier,
      subscriptionStatus: company.subscriptionStatus,
      maxUsers: company.maxUsers,
      maxDataPoints: company.maxDataPoints,
      customBranding: company.customBranding,
      settings: company.settings,
      owner: company.owner,
      membersCount: company.members?.length || 0,
      isActive: company.isActive,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
