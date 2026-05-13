import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { sendSuccess, sendError } from "@common/utils/response.js";
import { asyncHandler } from "@common/utils/asyncHandler.js";
import logger from "@config/logger.js";

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
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
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

    // In production, fetch full user details from database
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
    logger.info(`User logged out: ${req.user?.email}`);
    sendSuccess(res, { message: "Logged out successfully" }, 200);
  }
);
