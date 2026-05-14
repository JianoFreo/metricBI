import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess, sendError } from "@common/utils/response";
import { asyncHandler } from "@common/utils/asyncHandler";
import logger from "@config/logger";
import env from "@config/env";
import {
  getRefreshTokenFromRequest,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/token.utils";

/**
 * Authentication Controller
 * Handles HTTP requests for auth endpoints
 */

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body);
    if (env.AUTH_USE_COOKIES) {
      setRefreshTokenCookie(res, result.tokens.refreshToken);
    }
    logger.info(`User registered: ${result.user.email}`);
    sendSuccess(res, result, 201);
  }
);

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);
    if (env.AUTH_USE_COOKIES) {
      setRefreshTokenCookie(res, result.tokens.refreshToken);
    }
    logger.info(`User logged in: ${result.user.email}`);
    sendSuccess(res, result, 200);
  }
);

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      sendError(res, 400, "Refresh token is required", "BAD_REQUEST");
      return;
    }
    const tokens = await authService.refreshAccessToken(refreshToken);
    if (env.AUTH_USE_COOKIES) {
      setRefreshTokenCookie(res, tokens.refreshToken);
    }
    sendSuccess(res, tokens, 200);
  }
);

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export const getProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
      return;
    }

    sendSuccess(res, req.user, 200);
  }
);

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
      return;
    }

    const { oldPassword, newPassword } = req.body;
    await authService.updatePassword(req.user.userId, oldPassword, newPassword);

    sendSuccess(
      res,
      { message: "Password changed successfully" },
      200
    );
  }
);

/**
 * Logout user (client-side action, but can clear tokens on server if needed)
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      await authService.logout(req.user.userId);
      logger.info(`User logged out: ${req.user.email}`);
    }

    if (env.AUTH_USE_COOKIES) {
      clearRefreshTokenCookie(res);
    }

    sendSuccess(res, { message: "Logged out successfully" }, 200);
  }
);
