import { z } from "zod";

/**
 * Supplier Validation Schemas
 */
export const createSupplierSchema = z.object({
  name: z.string().min(2, "Supplier name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid zip code format"),
  country: z.string().min(2, "Country is required"),
  taxId: z.string().optional(),
  bankAccountDetails: z
    .object({
      accountName: z.string().optional(),
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      swiftCode: z.string().optional(),
    })
    .optional(),
  paymentTerms: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

/**
 * Purchase Request Item Schema
 */
const purchaseRequestItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  estimatedUnitCost: z.number().min(0, "Cost cannot be negative"),
  notes: z.string().optional(),
});

/**
 * Purchase Request Validation Schemas
 */
export const createPurchaseRequestSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  items: z
    .array(purchaseRequestItemSchema)
    .min(1, "At least one item is required"),
  dueDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Due date must be in the future",
  }),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export const approvePurchaseRequestSchema = z.object({
  approvalNote: z.string().optional(),
});

export const rejectPurchaseRequestSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters"),
});

/**
 * Purchase Order Item Schema
 */
const purchaseOrderItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0, "Cost cannot be negative"),
});

/**
 * Purchase Order Validation Schemas
 */
export const createPurchaseOrderSchema = z.object({
  purchaseRequestId: z.string().optional(),
  supplierId: z.string().min(1, "Supplier is required"),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, "At least one item is required"),
  expectedDeliveryDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Expected delivery date must be in the future",
  }),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export const updatePurchaseOrderSchema = createPurchaseOrderSchema.partial().extend({
  expectedDeliveryDate: z.string().optional(),
});

export const confirmPurchaseOrderSchema = z.object({
  confirmationNote: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "draft",
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  note: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  amountPaid: z.number().min(0, "Amount must be at least 0"),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Query Schemas
 */
export const supplierQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  isActive: z.string().optional(),
  sortBy: z.enum(["name", "rating", "totalSpent", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const purchaseRequestQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  supplierId: z.string().optional(),
  requestedBy: z.string().optional(),
  sortBy: z.enum(["createdAt", "dueDate", "totalEstimatedCost"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const purchaseOrderQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum([
    "draft",
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]).optional(),
  paymentStatus: z.enum(["not_paid", "partially_paid", "paid"]).optional(),
  supplierId: z.string().optional(),
  sortBy: z.enum(["orderDate", "expectedDeliveryDate", "totalOrderValue"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/**
 * Type Exports
 */
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreatePurchaseRequestInput = z.infer<typeof createPurchaseRequestSchema>;
export type ApprovePurchaseRequestInput = z.infer<typeof approvePurchaseRequestSchema>;
export type RejectPurchaseRequestInput = z.infer<typeof rejectPurchaseRequestSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type ConfirmPurchaseOrderInput = z.infer<typeof confirmPurchaseOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
