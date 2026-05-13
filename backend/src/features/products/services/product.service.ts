import { productRepository } from "../repositories/product.repository.js";
import { IProduct } from "../types/product.types.js";
import {
  CreateProductInput,
  UpdateProductInput,
} from "../schemas/product.schemas.js";
import { NotFoundError, BadRequestError } from "@common/utils/errors.js";
import logger from "@config/logger.js";

/**
 * Product Service
 * Business logic for product operations
 */
export class ProductService {
  /**
   * Create product
   */
  async createProduct(
    data: CreateProductInput,
    tenantId: string,
    userId: string
  ): Promise<IProduct> {
    // Check if SKU already exists for this tenant
    const existingProduct = await productRepository.getProductById(data.sku, tenantId);
    if (existingProduct) {
      throw new BadRequestError(`Product with SKU ${data.sku} already exists`);
    }

    const product = await productRepository.createProduct({
      ...data,
      tenantId,
      createdBy: userId,
    });

    logger.info(`Product created: ${product._id} for tenant: ${tenantId}`);

    return product;
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string, tenantId: string): Promise<IProduct> {
    const product = await productRepository.getProductById(id, tenantId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return product;
  }

  /**
   * Get all products with pagination
   */
  async getProducts(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    category?: string,
    sortBy: string = "createdAt"
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (category) {
      filter.category = category;
    }

    const { products, total } = await productRepository.getProducts(
      tenantId,
      skip,
      limit,
      filter
    );

    return {
      products,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update product
   */
  async updateProduct(
    id: string,
    tenantId: string,
    data: UpdateProductInput
  ): Promise<IProduct> {
    const product = await productRepository.updateProduct(id, tenantId, data);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    logger.info(`Product updated: ${id}`);

    return product;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string, tenantId: string): Promise<void> {
    await productRepository.deleteProduct(id, tenantId);
    logger.info(`Product deleted: ${id}`);
  }

  /**
   * Search products
   */
  async searchProducts(
    tenantId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new BadRequestError("Search term must be at least 2 characters");
    }

    const { products, total } = await productRepository.searchProducts(
      tenantId,
      searchTerm,
      skip,
      limit
    );

    return {
      products,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    tenantId: string,
    category: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: IProduct[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const { products, total } = await productRepository.getProductsByCategory(
      tenantId,
      category,
      skip,
      limit
    );

    return {
      products,
      total,
      pages: Math.ceil(total / limit),
    };
  }
}

export const productService = new ProductService();
