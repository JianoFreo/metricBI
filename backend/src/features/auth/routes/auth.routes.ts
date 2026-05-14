import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "@common/middleware/validation.middleware";
import { protect, authorize, requireRole, verifyTenant } from "../middleware/auth.middleware";
import { authLimiter } from "@common/middleware/rateLimiter.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "../schemas/auth.schemas";

const router = Router();

/**
 * Public routes (no authentication required)
 */

/**
 * POST /api/v1/auth/register
 * Register new user
 */
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  authController.login
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken
);

/**
 * Protected routes (authentication required)
 */

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get("/me", protect, verifyTenant, authController.getProfile);

/**
 * POST /api/v1/auth/change-password
 * Change password
 */
router.post(
  "/change-password",
  protect,
  verifyTenant,
  validate(changePasswordSchema),
  authController.changePassword
);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post("/logout", protect, verifyTenant, authController.logout);

export default router;
