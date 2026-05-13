import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "@common/middleware/validation.middleware.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { authLimiter } from "@common/middleware/rateLimiter.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "../schemas/auth.schemas.js";

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
router.get("/me", protect, authController.getProfile);

/**
 * POST /api/v1/auth/change-password
 * Change password
 */
router.post(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  authController.changePassword
);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post("/logout", protect, authController.logout);

export default router;
