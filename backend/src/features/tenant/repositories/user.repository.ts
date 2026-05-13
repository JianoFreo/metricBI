import { User } from "../models/User.js";
import { IUserMultiTenant } from "../types/tenant.types.js";
import { buildTenantFilter, verifyResourceOwnership } from "../utils/query-helper.js";

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<any | null> {
    return User.findById(userId).select("-password") as any;
  }

  /**
   * Find user by email within company
   */
  async findByEmailInCompany(email: string, companyId: string): Promise<any | null> {
    return User.findOne({
      email: email.toLowerCase(),
      companyId,
    }).select("-password") as any;
  }

  /**
   * Find user by email (global search)
   */
  async findByEmail(email: string): Promise<any | null> {
    return User.findOne({ email: email.toLowerCase() }).select("-password") as any;
  }

  /**
   * Find user with password (for login)
   */
  async findByEmailWithPassword(email: string): Promise<any | null> {
    return User.findOne({ email: email.toLowerCase() }) as any;
  }

  /**
   * Get all users in company
   */
  async getUsersByCompany(companyId: string): Promise<any[]> {
    return User.find(buildTenantFilter(companyId)).select("-password") as any;
  }

  /**
   * Get users by role in company
   */
  async getUsersByRole(companyId: string, role: string): Promise<any[]> {
    return User.find({
      ...buildTenantFilter(companyId),
      role,
    }).select("-password") as any;
  }

  /**
   * Create new user
   */
  async createUser(userData: Partial<IUserMultiTenant>): Promise<any> {
    const user = new User(userData);
    return user.save() as any;
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updateData: Partial<IUserMultiTenant>,
    userCompanyId: string
  ): Promise<any | null> {
    const user = (await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password")) as any;

    if (user) {
      verifyResourceOwnership(user, userCompanyId);
    }

    return user;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string, userCompanyId: string): Promise<any | null> {
    return this.updateUser(userId, { isActive: false }, userCompanyId);
  }

  /**
   * Get active users count in company
   */
  async getActiveUsersCount(companyId: string): Promise<number> {
    return User.countDocuments({
      ...buildTenantFilter(companyId),
      isActive: true,
    });
  }
}
