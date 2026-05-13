import { User } from "../models/User.js";
import { IUser } from "../types/auth.types.js";
import { ConflictError, NotFoundError } from "@common/utils/errors.js";

/**
 * Repository for User database operations
 * Follows repository pattern for data access abstraction
 */
export class AuthRepository {
  /**
   * Create a new user
   */
  async createUser(data: Partial<IUser>): Promise<IUser & { _id: any }> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const user = new User(data);
    await user.save();
    return user.toObject();
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<(IUser & { _id: any }) | null> {
    return User.findOne({ email }).select("+password").lean();
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<(IUser & { _id: any }) | null> {
    return User.findById(id).lean();
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    data: Partial<IUser>
  ): Promise<(IUser & { _id: any }) | null> {
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
