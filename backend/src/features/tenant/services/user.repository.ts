import { Document } from "mongoose";
import { User } from "../models/User.js";
import { IUserMultiTenant } from "../types/tenant.types.js";
import { buildTenantFilter, verifyResourceOwnership } from "../utils/query-helper.js";

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<(IUserMultiTenant & Document) | null> {
    return User.findById(userId).select("-password");
  }

  /**
   * Find user by email within company
   */
  async findByEmailInCompany(
    email: string,
    companyId: string
  ): Promise<(IUserMultiTenant & Document) | null> {
    return User.findOne({
      email: email.toLowerCase(),
      companyId,
    }).select("-password");
  }

  /**
   * Find user by email (global search)
   */
  async findByEmail(email: string): Promise<(IUserMultiTenant & Document) | null> {
    return User.findOne({ email: email.toLowerCase() }).select("-password");
  }

  /**
   * Find user with password (for login)
   */
  async findByEmailWithPassword(email: string): Promise<(IUserMultiTenant & Document) | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Get all users in company
   */
  async getUsersByCompany(companyId: string): Promise<(IUserMultiTenant & Document)[]> {
    return User.find(buildTenantFilter(companyId)).select("-password");
  }

  /**
   * Get users by role in company
   */
  async getUsersByRole(
    companyId: string,
    role: string
  ): Promise<(IUserMultiTenant & Document)[]> {
    return User.find({
      ...buildTenantFilter(companyId),
      role,
    }).select("-password");
  }

  /**
   * Create new user
   */
  async createUser(
    userData: Partial<IUserMultiTenant>
  ): Promise<IUserMultiTenant & Document> {
    const user = new User(userData);
    return user.save();
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updateData: Partial<IUserMultiTenant>,
    userCompanyId: string
  ): Promise<(IUserMultiTenant & Document) | null> {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (user) {
      verifyResourceOwnership(user, userCompanyId);
    }

    return user;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(
    userId: string,
    userCompanyId: string
  ): Promise<(IUserMultiTenant & Document) | null> {
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
