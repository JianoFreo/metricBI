import { Router } from "express";
import { protect, requireRole, verifyTenant } from "@features/auth/middleware/auth.middleware.js";
import { validate, validateParams, validateQuery } from "@common/middleware/validation.middleware.js";
import { apiLimiter } from "@common/middleware/rateLimiter.middleware.js";
import { AuthRole } from "@features/auth/types/auth.types.js";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  stockTransactionSchema,
  inventoryItemIdParamsSchema,
  inventoryQuerySchema,
} from "../schemas/inventory.schemas.js";
import {
  createInventoryItem,
  listInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  stockIn,
  stockOut,
  adjustStock,
  getLowStockItems,
  getInventoryHistory,
  getInventoryTransactions,
} from "../controllers/inventory.controller.js";

const router = Router();

router.use(protect, verifyTenant);

router.post(
  "/",
  apiLimiter,
  requireRole(AuthRole.ADMIN, AuthRole.MANAGER),
  validate(createInventoryItemSchema),
  createInventoryItem
);

router.get(
  "/",
  requireRole(AuthRole.VIEWER, AuthRole.ANALYST, AuthRole.MANAGER, AuthRole.ADMIN, AuthRole.SUPER_ADMIN),
  validateQuery(inventoryQuerySchema),
  listInventoryItems
);

router.get(
  "/low-stock",
  requireRole(AuthRole.VIEWER, AuthRole.ANALYST, AuthRole.MANAGER, AuthRole.ADMIN, AuthRole.SUPER_ADMIN),
  getLowStockItems
);

router.get(
  "/:itemId",
  requireRole(AuthRole.VIEWER, AuthRole.ANALYST, AuthRole.MANAGER, AuthRole.ADMIN, AuthRole.SUPER_ADMIN),
  validateParams(inventoryItemIdParamsSchema),
  getInventoryItemById
);

router.put(
  "/:itemId",
  requireRole(AuthRole.ADMIN, AuthRole.MANAGER),
  validateParams(inventoryItemIdParamsSchema),
  validate(updateInventoryItemSchema),
  updateInventoryItem
);

router.post(
  "/:itemId/stock-in",
  requireRole(AuthRole.ADMIN, AuthRole.MANAGER),
  validateParams(inventoryItemIdParamsSchema),
  validate(stockTransactionSchema),
  stockIn
);

router.post(
  "/:itemId/stock-out",
  requireRole(AuthRole.ADMIN, AuthRole.MANAGER),
  validateParams(inventoryItemIdParamsSchema),
  validate(stockTransactionSchema),
  stockOut
);

router.post(
  "/:itemId/adjust",
  requireRole(AuthRole.ADMIN, AuthRole.MANAGER),
  validateParams(inventoryItemIdParamsSchema),
  validate(stockTransactionSchema),
  adjustStock
);

router.get(
  "/:itemId/history",
  requireRole(AuthRole.ADMIN, AuthRole.MANAGER),
  validateParams(inventoryItemIdParamsSchema),
  getInventoryHistory
);

router.get(
  "/:itemId/transactions",
  requireRole(AuthRole.ADMIN, AuthRole.MANAGER),
  validateParams(inventoryItemIdParamsSchema),
  getInventoryTransactions
);

export default router;