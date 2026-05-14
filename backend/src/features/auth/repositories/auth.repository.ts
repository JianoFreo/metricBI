import { User } from "../models/User";
import { IUser } from "../types/auth.types";
import { ConflictError, NotFoundError } from "@common/utils/errors";

/**
 * Repository for User database operations
 * Follows repository pattern for data access abstraction
 */
export class AuthRepository {
  /**
   * Create a new user
   */
  async createUser(data: Partial<IUser>): Promise<any> {
    const existingUser = await User.findOne({
      email: data.email,
      companyId: data.companyId,
    });
    if (existingUser) {
      throw new ConflictError("Email already registered in this company");
    }

    const user = new User(data);
    await user.save();
    return user.toObject();
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string, companyId: string): Promise<any | null> {
    return User.findOne({ email, companyId }).select("+password +refreshTokenHash").lean();
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<any | null> {
    return User.findById(id).lean();
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<IUser>): Promise<any | null> {
    return User.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError("User not found");
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email });
    return count > 0;
  }

  async emailExistsInCompany(email: string, companyId: string): Promise<boolean> {
    const count = await User.countDocuments({ email, companyId });
    return count > 0;
  }

  async updateRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<any | null> {
    return User.findByIdAndUpdate(userId, { refreshTokenHash }, { new: true }).lean();
  }

  async updateLastLogin(userId: string): Promise<any | null> {
    return User.findByIdAndUpdate(userId, { lastLogin: new Date() }, { new: true }).lean();
  }

  /**
   * Get user list with pagination
   */
  async getUserList(
    skip: number,
    limit: number,
    filter?: Record<string, any>
  ): Promise<{ users: IUser[]; total: number }> {
    const query = filter || {};
    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    const total = await User.countDocuments(query);

    return { users, total };
  }
}

export const authRepository = new AuthRepository();
