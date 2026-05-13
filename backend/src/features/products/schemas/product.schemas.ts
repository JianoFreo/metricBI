import { z } from "zod";

/**
 * Validation schemas for product endpoints
 */

export const createProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than 0"),
  cost: z.number().positive("Cost must be greater than 0").optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  category: z.string().min(2, "Category is required"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;
