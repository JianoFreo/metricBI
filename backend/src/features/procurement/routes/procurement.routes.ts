import { Router } from "express";
import { protect, requireRole, verifyTenant } from "@features/auth/middleware/auth.middleware.js";
import { validate, validateParams, validateQuery } from "@common/middleware/validation.middleware.js";
import { apiLimiter } from "@common/middleware/rateLimiter.middleware.js";
import * as procurementController from "../controllers/procurement.controller.js";
import {
  createSupplierSchema,
  updateSupplierSchema,
  createPurchaseRequestSchema,
  approvePurchaseRequestSchema,
  rejectPurchaseRequestSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  confirmPurchaseOrderSchema,
  updateOrderStatusSchema,
  recordPaymentSchema,
  supplierQuerySchema,
  purchaseRequestQuerySchema,
  purchaseOrderQuerySchema,
} from "../schemas/procurement.schemas.js";
import { z } from "zod";

const router = Router();

// Apply authentication middleware to all routes
router.use(protect, verifyTenant);

// ========== SUPPLIER ROUTES ==========

/**
 * POST /api/v1/procurement/suppliers
 * Create new supplier (manager/admin only)
 */
router.post(
  "/suppliers",
  apiLimiter,
  requireRole("manager" as any, "admin" as any),
  validate(createSupplierSchema),
  procurementController.createSupplier
);

/**
 * GET /api/v1/procurement/suppliers
 * List all suppliers (viewer and above)
 */
router.get(
  "/suppliers",
  requireRole(
    "viewer" as any,
    "analyst" as any,
    "manager" as any,
    "admin" as any,
    "super_admin" as any
  ),
  validateQuery(supplierQuerySchema),
  procurementController.listSuppliers
);

/**
 * GET /api/v1/procurement/suppliers/:id
 * Get supplier details
 */
router.get(
  "/suppliers/:id",
  requireRole(
    "viewer" as any,
    "analyst" as any,
    "manager" as any,
    "admin" as any,
    "super_admin" as any
  ),
  procurementController.getSupplier
);

/**
 * PUT /api/v1/procurement/suppliers/:id
 * Update supplier (manager/admin only)
 */
router.put(
  "/suppliers/:id",
  requireRole("manager" as any, "admin" as any),
  validate(updateSupplierSchema),
  procurementController.updateSupplier
);

/**
 * DELETE /api/v1/procurement/suppliers/:id
 * Delete supplier (admin only)
 */
router.delete(
  "/suppliers/:id",
  requireRole("admin" as any),
  procurementController.deleteSupplier
);

// ========== PURCHASE REQUEST ROUTES ==========

/**
 * POST /api/v1/procurement/requests
 * Create purchase request (manager/admin)
 */
router.post(
  "/requests",
  apiLimiter,
  requireRole("manager" as any, "admin" as any),
  validate(createPurchaseRequestSchema),
  procurementController.createPurchaseRequest
);

/**
 * GET /api/v1/procurement/requests
 * List purchase requests (viewer and above)
 */
router.get(
  "/requests",
  requireRole(
    "viewer" as any,
    "analyst" as any,
    "manager" as any,
    "admin" as any,
    "super_admin" as any
  ),
  validateQuery(purchaseRequestQuerySchema),
  procurementController.listPurchaseRequests
);

/**
 * GET /api/v1/procurement/requests/:id
 * Get purchase request details
 */
router.get(
  "/requests/:id",
  requireRole(
    "viewer" as any,
    "analyst" as any,
    "manager" as any,
    "admin" as any,
    "super_admin" as any
  ),
  procurementController.getPurchaseRequest
);

/**
 * POST /api/v1/procurement/requests/:id/approve
 * Approve purchase request (admin/manager)
 */
router.post(
  "/requests/:id/approve",
  requireRole("manager" as any, "admin" as any),
  validate(approvePurchaseRequestSchema),
  procurementController.approvePurchaseRequest
);

/**
 * POST /api/v1/procurement/requests/:id/reject
 * Reject purchase request (admin/manager)
 */
router.post(
  "/requests/:id/reject",
  requireRole("manager" as any, "admin" as any),
  validate(rejectPurchaseRequestSchema),
  procurementController.rejectPurchaseRequest
);

// ========== PURCHASE ORDER ROUTES ==========

/**
 * POST /api/v1/procurement/orders
 * Create purchase order (manager/admin)
 */
router.post(
  "/orders",
  apiLimiter,
  requireRole("manager" as any, "admin" as any),
  validate(createPurchaseOrderSchema),
  procurementController.createPurchaseOrder
);

/**
 * GET /api/v1/procurement/orders
 * List purchase orders (viewer and above)
 */
router.get(
  "/orders",
  requireRole(
    "viewer" as any,
    "analyst" as any,
    "manager" as any,
    "admin" as any,
    "super_admin" as any
  ),
  validateQuery(purchaseOrderQuerySchema),
  procurementController.listPurchaseOrders
);

/**
 * GET /api/v1/procurement/orders/:id
 * Get purchase order details
 */
router.get(
  "/orders/:id",
  requireRole(
    "viewer" as any,
    "analyst" as any,
    "manager" as any,
    "admin" as any,
    "super_admin" as any
  ),
  procurementController.getPurchaseOrder
);

/**
 * PUT /api/v1/procurement/orders/:id
 * Update purchase order (manager/admin, draft status only)
 */
router.put(
  "/orders/:id",
  requireRole("manager" as any, "admin" as any),
  validate(updatePurchaseOrderSchema),
  procurementController.updatePurchaseOrder
);

/**
 * POST /api/v1/procurement/orders/:id/confirm
 * Confirm purchase order (manager/admin)
 */
router.post(
  "/orders/:id/confirm",
  requireRole("manager" as any, "admin" as any),
  validate(confirmPurchaseOrderSchema),
  procurementController.confirmPurchaseOrder
);

/**
 * POST /api/v1/procurement/orders/:id/status
 * Update order status (manager/admin)
 */
router.post(
  "/orders/:id/status",
  requireRole("manager" as any, "admin" as any),
  validate(updateOrderStatusSchema),
  procurementController.updateOrderStatus
);

/**
 * POST /api/v1/procurement/orders/:id/payment
 * Record payment (manager/admin)
 */
router.post(
  "/orders/:id/payment",
  requireRole("manager" as any, "admin" as any),
  validate(recordPaymentSchema),
  procurementController.recordPayment
);

// ========== STATISTICS ROUTES ==========

/**
 * GET /api/v1/procurement/stats
 * Get procurement statistics (viewer and above)
 */
router.get(
  "/stats",
  requireRole(
    "viewer" as any,
    "analyst" as any,
    "manager" as any,
    "admin" as any,
    "super_admin" as any
  ),
  procurementController.getProcurementStats
);

export default router;
