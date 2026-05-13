import { Router } from "express";
import { protect, requireRole, verifyTenant } from "@features/auth/middleware/auth.middleware.js";
import { validate, validateParams, validateQuery } from "@common/middleware/validation.middleware.js";
import { apiLimiter } from "@common/middleware/rateLimiter.middleware.js";
import { AuthRole } from "@features/auth/types/auth.types.js";
import {
  assetIdParamsSchema,
  createAssetSchema,
  listAssetsQuerySchema,
  updateAssetLifecycleSchema,
  updateAssetStatusSchema,
} from "../schemas/asset.schemas.js";
import {
  createAsset,
  listAssets,
  getAssetById,
  updateAssetLifecycle,
  updateAssetStatus,
  getAssetHistory,
} from "../controllers/asset.controller.js";

const router = Router();

router.use(protect, verifyTenant);

router.post(
  "/",
  apiLimiter,
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validate(createAssetSchema),
  createAsset
);

router.get(
  "/",
  requireRole("viewer" as AuthRole, "analyst" as AuthRole, "manager" as AuthRole, "admin" as AuthRole, "super_admin" as AuthRole),
  validateQuery(listAssetsQuerySchema),
  listAssets
);

router.get(
  "/:assetId",
  requireRole("viewer" as AuthRole, "analyst" as AuthRole, "manager" as AuthRole, "admin" as AuthRole, "super_admin" as AuthRole),
  validateParams(assetIdParamsSchema),
  getAssetById
);

router.patch(
  "/:assetId/lifecycle",
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validateParams(assetIdParamsSchema),
  validate(updateAssetLifecycleSchema),
  updateAssetLifecycle
);

router.patch(
  "/:assetId/status",
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validateParams(assetIdParamsSchema),
  validate(updateAssetStatusSchema),
  updateAssetStatus
);

router.get(
  "/:assetId/history",
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validateParams(assetIdParamsSchema),
  getAssetHistory
);

export default router;