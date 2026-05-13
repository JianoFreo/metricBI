import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { protect, authorize, verifyTenant } from "@features/auth/middleware/auth.middleware.js";
import { validate } from "@common/middleware/validation.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schemas.js";

const router = Router();

/**
 * All product routes require authentication
 */
router.use(protect, verifyTenant);

/**
 * POST /api/v1/products
 * Create new product (admin/seller only)
 */
router.post(
  "/",
  authorize("admin", "seller"),
  validate(createProductSchema),
  productController.createProduct
);

/**
 * GET /api/v1/products
 * Get all products
 */
router.get("/", productController.getProducts);

/**
 * GET /api/v1/products/search/:query
 * Search products
 */
router.get("/search/:query", productController.searchProducts);

/**
 * GET /api/v1/products/category/:category
 * Get products by category
 */
router.get("/category/:category", productController.getProductsByCategory);

/**
 * GET /api/v1/products/:id
 * Get product by ID
 */
router.get("/:id", productController.getProductById);

/**
 * PUT /api/v1/products/:id
 * Update product (admin/seller only)
 */
router.put(
  "/:id",
  authorize("admin", "seller"),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * DELETE /api/v1/products/:id
 * Delete product (admin/seller only)
 */
router.delete(
  "/:id",
  authorize("admin", "seller"),
  productController.deleteProduct
);

export default router;
