import jwt from "jsonwebtoken";
import env from "@config/env";
import { User } from "../models/User";
import {
  JwtPayload,
  TokenPair,
  DecodedToken,
  IAuthResponse,
} from "../types/auth.types";
import { AuthenticationError, ConflictError } from "@common/utils/errors";
import { authRepository } from "../repositories/auth.repository";
import { RegisterInput, LoginInput } from "../schemas/auth.schemas";
import logger from "@config/logger";
import {
  createTokenPair,
  hashRefreshToken,
  compareRefreshToken,
  verifyToken,
} from "../utils/token.utils";

/**
 * Authentication Service
 * Handles user registration, login, token generation/verification
 */
export class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterInput): Promise<IAuthResponse> {
    const userExists = await authRepository.emailExistsInCompany(data.email, data.companyId);
    if (userExists) {
      throw new ConflictError(`Email ${data.email} is already registered in this company`);
    }

    const user = await authRepository.createUser({
      companyId: data.companyId,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || "viewer",
    });

    const tokens = createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      companyId: user.companyId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await authRepository.updateRefreshTokenHash(
      user._id.toString(),
      await hashRefreshToken(tokens.refreshToken)
    );

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
    const user = await authRepository.findByEmail(data.email, data.companyId);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isPasswordValid = await (
      User.findById(user._id).select("+password") as any
    ).comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    const tokens = createTokenPair({
      userId: user._id.toString(),
      email: user.email,
      companyId: user.companyId,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await authRepository.updateRefreshTokenHash(
      user._id.toString(),
      await hashRefreshToken(tokens.refreshToken)
    );
    await authRepository.updateLastLogin(user._id.toString());

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
      const decoded = verifyToken(refreshToken, env.JWT_REFRESH_SECRET);
      if (!decoded) {
        throw new AuthenticationError("Invalid or expired refresh token");
      }

      // Verify user still exists
      const user = await authRepository.findById(decoded.userId);
      if (!user) {
        throw new AuthenticationError("User not found");
      }

      const storedUser = await User.findById(decoded.userId).select("+refreshTokenHash");
      if (!storedUser?.refreshTokenHash) {
        throw new AuthenticationError("Refresh token has been revoked");
      }

      const isValidRefreshToken = await compareRefreshToken(refreshToken, storedUser.refreshTokenHash);
      if (!isValidRefreshToken) {
        throw new AuthenticationError("Refresh token has been revoked");
      }

      const tokens = createTokenPair({
        userId: decoded.userId,
        email: decoded.email,
        companyId: decoded.companyId,
        role: decoded.role,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      });

      await authRepository.updateRefreshTokenHash(
        decoded.userId,
        await hashRefreshToken(tokens.refreshToken)
      );

      return tokens;
    } catch (error) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }
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
    await authRepository.updateRefreshTokenHash(userId, null);

    logger.info(`Password updated for user: ${user.email}`);
  }

  async logout(userId: string): Promise<void> {
    await authRepository.updateRefreshTokenHash(userId, null);
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
