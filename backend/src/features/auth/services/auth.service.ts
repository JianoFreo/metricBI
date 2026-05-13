import jwt from "jsonwebtoken";
import env from "@config/env.js";
import { User } from "../models/User.js";
import {
  JwtPayload,
  TokenPair,
  DecodedToken,
  IAuthResponse,
} from "../types/auth.types.js";
import { AuthenticationError, ConflictError } from "@common/utils/errors.js";
import { authRepository } from "../repositories/auth.repository.js";
import { RegisterInput, LoginInput } from "../schemas/auth.schemas.js";
import logger from "@config/logger.js";

/**
 * Authentication Service
 * Handles user registration, login, token generation/verification
 */
export class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterInput): Promise<IAuthResponse> {
    const userExists = await authRepository.emailExists(data.email);
    if (userExists) {
      throw new ConflictError(`Email ${data.email} is already registered`);
    }

    const user = await authRepository.createUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "user",
    });

    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    logger.info(`User registered: ${user.email}`);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as any,
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput): Promise<IAuthResponse> {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isPasswordValid = await (
      User.findById(user._id) as any
    ).comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${user.email}`);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as any,
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        env.JWT_REFRESH_SECRET
      ) as DecodedToken;

      // Verify user still exists
      const user = await authRepository.findById(decoded.userId);
      if (!user) {
        throw new AuthenticationError("User not found");
      }

      return this.generateTokens({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
    } catch (error) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET as string, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    } as any);

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET as string, {
      expiresIn: env.JWT_REFRESH_EXPIRY,
    } as any);

    return { accessToken, refreshToken };
  }

  /**
   * Update password
   */
  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AuthenticationError("User not found");
    }

    const isPasswordValid = await (user as any).comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new AuthenticationError("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password updated for user: ${user.email}`);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string, secret: string): DecodedToken | null {
    try {
      return jwt.verify(token, secret) as DecodedToken;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
