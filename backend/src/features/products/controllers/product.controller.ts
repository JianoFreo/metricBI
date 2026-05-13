import { Request, Response } from "express";
import { productService } from "../services/product.service.js";
import { sendSuccess, sendPaginated, sendError } from "@common/utils/response.js";
import { asyncHandler } from "@common/utils/asyncHandler.js";
import logger from "@config/logger.js";

/**
 * Product Controller
 * Handles HTTP requests for product endpoints
 */

/**
 * Create product
 * POST /api/v1/products
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.tenantId) {
      sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
      return;
    }

    const product = await productService.createProduct(
      req.body,
      req.tenantId,
      req.user.userId
    );

    logger.info(`Product created: ${product._id}`);
    sendSuccess(res, product, 201);
  }
);

/**
 * Get all products
 * GET /api/v1/products
 */
export const getProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.tenantId) {
      sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string | undefined;

    const { products, total, pages } = await productService.getProducts(
      req.tenantId,
      page,
      limit,
      category
    );

    sendPaginated(res, products, total, page, limit, 200);
  }
);

/**
 * Get product by ID
 * GET /api/v1/products/:id
 */
export const getProductById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.tenantId) {
      sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
      return;
    }

    const product = await productService.getProductById(req.params.id, req.tenantId);
    sendSuccess(res, product, 200);
  }
);

/**
 * Update product
 * PUT /api/v1/products/:id
 */
export const updateProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.tenantId) {
      sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
      return;
    }

    const product = await productService.updateProduct(
      req.params.id,
      req.tenantId,
      req.body
    );

    logger.info(`Product updated: ${product._id}`);
    sendSuccess(res, product, 200);
  }
);

/**
 * Delete product
 * DELETE /api/v1/products/:id
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.tenantId) {
      sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
      return;
    }

    await productService.deleteProduct(req.params.id, req.tenantId);

    logger.info(`Product deleted: ${req.params.id}`);
    sendSuccess(res, { message: "Product deleted successfully" }, 200);
  }
);

/**
 * Search products
 * GET /api/v1/products/search/:query
 */
export const searchProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.tenantId) {
      sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.params.query as string;

    const { products, total, pages } = await productService.searchProducts(
      req.tenantId,
      searchTerm,
      page,
      limit
    );

    sendPaginated(res, products, total, page, limit, 200);
  }
);

/**
 * Get products by category
 * GET /api/v1/products/category/:category
 */
export const getProductsByCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.tenantId) {
      sendError(res, 401, "Unauthorized", "UNAUTHORIZED");
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.params.category as string;

    const { products, total, pages } = await productService.getProductsByCategory(
      req.tenantId,
      category,
      page,
      limit
    );

    sendPaginated(res, products, total, page, limit, 200);
  }
);
