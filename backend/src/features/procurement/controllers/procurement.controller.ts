import { Request, Response } from "express";
import { procurementService } from "../services/procurement.service.js";
import { sendSuccess, sendError } from "@common/utils/response.js";
import { asyncHandler } from "@common/utils/asyncHandler.js";
import logger from "@config/logger.js";

/**
 * Procurement Controller
 * Handles HTTP requests for procurement endpoints
 */

// ========== SUPPLIER ENDPOINTS ==========

/**
 * POST /api/v1/procurement/suppliers
 * Create new supplier
 */
export const createSupplier = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const supplier = await procurementService.createSupplier(
      req.companyId!,
      req.body
    );
    sendSuccess(res, supplier, 201);
  }
);

/**
 * GET /api/v1/procurement/suppliers
 * List all suppliers
 */
export const listSuppliers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await procurementService.listSuppliers(
      req.companyId!,
      req.query
    );
    sendSuccess(res, result, 200);
  }
);

/**
 * GET /api/v1/procurement/suppliers/:id
 * Get supplier details
 */
export const getSupplier = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const supplier = await procurementService.getSupplier(
      req.params.id,
      req.companyId!
    );
    sendSuccess(res, supplier, 200);
  }
);

/**
 * PUT /api/v1/procurement/suppliers/:id
 * Update supplier
 */
export const updateSupplier = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const supplier = await procurementService.updateSupplier(
      req.params.id,
      req.companyId!,
      req.body
    );
    sendSuccess(res, supplier, 200);
  }
);

/**
 * DELETE /api/v1/procurement/suppliers/:id
 * Delete supplier
 */
export const deleteSupplier = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await procurementService.deleteSupplier(req.params.id, req.companyId!);
    sendSuccess(res, { message: "Supplier deleted successfully" }, 200);
  }
);

// ========== PURCHASE REQUEST ENDPOINTS ==========

/**
 * POST /api/v1/procurement/requests
 * Create purchase request
 */
export const createPurchaseRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const request = await procurementService.createPurchaseRequest(
      req.companyId!,
      req.user!.userId,
      req.body
    );
    sendSuccess(res, request, 201);
  }
);

/**
 * GET /api/v1/procurement/requests
 * List purchase requests
 */
export const listPurchaseRequests = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await procurementService.listPurchaseRequests(
      req.companyId!,
      req.query
    );
    sendSuccess(res, result, 200);
  }
);

/**
 * GET /api/v1/procurement/requests/:id
 * Get purchase request details
 */
export const getPurchaseRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const request = await procurementService.getPurchaseRequest(
      req.params.id,
      req.companyId!
    );
    sendSuccess(res, request, 200);
  }
);

/**
 * POST /api/v1/procurement/requests/:id/approve
 * Approve purchase request
 */
export const approvePurchaseRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const request = await procurementService.approvePurchaseRequest(
      req.params.id,
      req.companyId!,
      req.user!.userId,
      req.body.approvalNote
    );
    sendSuccess(res, request, 200);
  }
);

/**
 * POST /api/v1/procurement/requests/:id/reject
 * Reject purchase request
 */
export const rejectPurchaseRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const request = await procurementService.rejectPurchaseRequest(
      req.params.id,
      req.companyId!,
      req.body.rejectionReason,
      req.user!.userId
    );
    sendSuccess(res, request, 200);
  }
);

// ========== PURCHASE ORDER ENDPOINTS ==========

/**
 * POST /api/v1/procurement/orders
 * Create purchase order
 */
export const createPurchaseOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const order = await procurementService.createPurchaseOrder(
      req.companyId!,
      req.user!.userId,
      req.body
    );
    sendSuccess(res, order, 201);
  }
);

/**
 * GET /api/v1/procurement/orders
 * List purchase orders
 */
export const listPurchaseOrders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await procurementService.listPurchaseOrders(
      req.companyId!,
      req.query
    );
    sendSuccess(res, result, 200);
  }
);

/**
 * GET /api/v1/procurement/orders/:id
 * Get purchase order details
 */
export const getPurchaseOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const order = await procurementService.getPurchaseOrder(
      req.params.id,
      req.companyId!
    );
    sendSuccess(res, order, 200);
  }
);

/**
 * PUT /api/v1/procurement/orders/:id
 * Update purchase order
 */
export const updatePurchaseOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const order = await procurementService.updatePurchaseOrder(
      req.params.id,
      req.companyId!,
      req.body,
      req.user!.userId
    );
    sendSuccess(res, order, 200);
  }
);

/**
 * POST /api/v1/procurement/orders/:id/confirm
 * Confirm purchase order
 */
export const confirmPurchaseOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const order = await procurementService.confirmPurchaseOrder(
      req.params.id,
      req.companyId!,
      req.user!.userId,
      req.body.confirmationNote
    );
    sendSuccess(res, order, 200);
  }
);

/**
 * POST /api/v1/procurement/orders/:id/status
 * Update order status
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const order = await procurementService.updateOrderStatus(
      req.params.id,
      req.companyId!,
      req.body.status,
      req.user!.userId,
      req.body.note
    );
    sendSuccess(res, order, 200);
  }
);

/**
 * POST /api/v1/procurement/orders/:id/payment
 * Record payment
 */
export const recordPayment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const order = await procurementService.recordPayment(
      req.params.id,
      req.companyId!,
      req.body,
      req.user!.userId
    );
    sendSuccess(res, order, 200);
  }
);

// ========== STATISTICS ENDPOINTS ==========

/**
 * GET /api/v1/procurement/stats
 * Get procurement statistics
 */
export const getProcurementStats = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const stats = await procurementService.getProcurementStats(req.companyId!);
    sendSuccess(res, stats, 200);
  }
);
