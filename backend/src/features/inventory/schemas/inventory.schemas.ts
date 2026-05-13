import { z } from "zod";

export const createInventoryItemSchema = z.object({
  name: z.string().min(2, "Item name is required").max(150),
  sku: z.string().max(100).optional(),
  category: z.string().min(2, "Category is required").max(100),
  description: z.string().max(1000).optional(),
  unitCost: z.number().min(0, "Unit cost must be zero or greater"),
  currentStock: z.number().min(0).optional(),
  reorderLevel: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
  warehouseId: z.string().optional(),
  warehouseName: z.string().max(150).optional(),
  unitOfMeasure: z.string().max(50).optional(),
  supplierName: z.string().max(150).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateInventoryItemSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  sku: z.string().max(100).optional(),
  category: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  unitCost: z.number().min(0).optional(),
  reorderLevel: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
  warehouseId: z.string().nullable().optional(),
  warehouseName: z.string().max(150).optional(),
  unitOfMeasure: z.string().max(50).optional(),
  supplierName: z.string().max(150).optional(),
  notes: z.string().max(1000).optional(),
});

export const stockTransactionSchema = z.object({
  quantity: z.number().positive("Quantity must be greater than 0"),
  warehouseId: z.string().optional(),
  reference: z.string().max(150).optional(),
  note: z.string().max(500).optional(),
});

export const inventoryItemIdParamsSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
});

export const inventoryQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
  search: z.string().optional(),
  lowStockOnly: z.coerce.boolean().optional(),
});