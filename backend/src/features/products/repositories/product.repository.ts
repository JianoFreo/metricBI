import { Product } from "../models/Product.js";
import { IProduct } from "../types/product.types.js";
import { CreateProductInput } from "../schemas/product.schemas.js";
import { NotFoundError } from "@common/utils/errors.js";

/**
 * Product Repository
 * Handles all database operations for products
 */
export class ProductRepository {
  /**
   * Create product
   */
  async createProduct(
    data: CreateProductInput & { tenantId: string; createdBy: string }
  ): Promise<IProduct & { _id: any }> {
    const product = new Product(data);
    await product.save();
    return product.toObject();
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string, tenantId: string): Promise<(IProduct & { _id: any }) | null> {
    return Product.findOne({ _id: id, tenantId }).lean();
  }

  /**
   * Get all products with pagination
   */
  async getProducts(
    tenantId: string,
    skip: number,
    limit: number,
    filter?: Record<string, any>
  ): Promise<{ products: IProduct[]; total: number }> {
    const query = { tenantId, isActive: true, ...filter };

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Product.countDocuments(query);

    return { products, total };
  }

  /**
   * Update product
   */
  async updateProduct(
    id: string,
    tenantId: string,
    data: Partial<IProduct>
  ): Promise<(IProduct & { _id: any }) | null> {
    return Product.findOneAndUpdate(
      { _id: id, tenantId },
      data,
      { new: true }
    ).lean();
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id: string, tenantId: string): Promise<void> {
    const result = await Product.findOneAndUpdate(
      { _id: id, tenantId },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      throw new NotFoundError("Product not found");
    }
  }

  /**
   * Search products
   */
  async searchProducts(
    tenantId: string,
    searchTerm: string,
    skip: number,
    limit: number
  ): Promise<{ products: IProduct[]; total: number }> {
    const query = {
      tenantId,
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { tags: { $regex: searchTerm, $options: "i" } },
      ],
    };

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Product.countDocuments(query);

    return { products, total };
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    tenantId: string,
    category: string,
    skip: number,
    limit: number
  ): Promise<{ products: IProduct[]; total: number }> {
    const query = { tenantId, category, isActive: true };

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    return { products, total };
  }

  /**
   * Bulk update stock (for orders)
   */
  async updateStock(productId: string, quantity: number): Promise<void> {
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { new: true }
    );
  }
}

export const productRepository = new ProductRepository();
