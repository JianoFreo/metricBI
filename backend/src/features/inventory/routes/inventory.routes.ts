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
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validate(createInventoryItemSchema),
  createInventoryItem
);

router.get(
  "/",
  requireRole("viewer" as AuthRole, "analyst" as AuthRole, "manager" as AuthRole, "admin" as AuthRole, "super_admin" as AuthRole),
  validateQuery(inventoryQuerySchema),
  listInventoryItems
);

router.get(
  "/low-stock",
  requireRole("viewer" as AuthRole, "analyst" as AuthRole, "manager" as AuthRole, "admin" as AuthRole, "super_admin" as AuthRole),
  getLowStockItems
);

router.get(
  "/:itemId",
  requireRole("viewer" as AuthRole, "analyst" as AuthRole, "manager" as AuthRole, "admin" as AuthRole, "super_admin" as AuthRole),
  validateParams(inventoryItemIdParamsSchema),
  getInventoryItemById
);

router.put(
  "/:itemId",
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validateParams(inventoryItemIdParamsSchema),
  validate(updateInventoryItemSchema),
  updateInventoryItem
);

router.post(
  "/:itemId/stock-in",
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validateParams(inventoryItemIdParamsSchema),
  validate(stockTransactionSchema),
  stockIn
);

router.post(
  "/:itemId/stock-out",
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validateParams(inventoryItemIdParamsSchema),
  validate(stockTransactionSchema),
  stockOut
);

router.post(
  "/:itemId/adjust",
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validateParams(inventoryItemIdParamsSchema),
  validate(stockTransactionSchema),
  adjustStock
);

router.get(
  "/:itemId/history",
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validateParams(inventoryItemIdParamsSchema),
  getInventoryHistory
);

router.get(
  "/:itemId/transactions",
  requireRole("admin" as AuthRole, "manager" as AuthRole),
  validateParams(inventoryItemIdParamsSchema),
  getInventoryTransactions
);

export default router;