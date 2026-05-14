import mongoose, { Schema, Document } from "mongoose";
import {
  IPurchaseOrder,
  IPurchaseOrderItem,
  IPurchaseOrderHistory,
  PurchaseOrderStatus,
  PaymentStatus,
} from "../types/procurement.types.js";

/**
 * Purchase Order Item Sub-schema
 */
const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>({
  itemId: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 },
});

/**
 * Purchase Order History Sub-schema
 */
const PurchaseOrderHistorySchema = new Schema<IPurchaseOrderHistory>({
  action: {
    type: String,
    enum: [
      "created",
      "updated",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
      "payment_recorded",
    ],
    required: true,
  },
  performedBy: { type: String, required: true },
  previousStatus: {
    type: String,
    default: null,
  },
  newStatus: {
    type: String,
    default: null,
  },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: null },
  metadata: { type: Schema.Types.Mixed, default: null },
});

/**
 * Purchase Order Schema
 */
const PurchaseOrderSchema = new Schema<IPurchaseOrder & Document>(
  {
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    purchaseRequestId: {
      type: Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      default: null,
      index: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [PurchaseOrderItemSchema],
      required: true,
      validate: {
        validator: function (v: IPurchaseOrderItem[]) {
          return v && v.length > 0;
        },
        message: "At least one item is required",
      },
    },
    totalOrderValue: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
      index: true,
    },
    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PurchaseOrderStatus),
      default: PurchaseOrderStatus.DRAFT,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.NOT_PAID,
      index: true,
    },
    paymentTerms: {
      type: String,
      required: true,
      default: "Net 30",
    },
    deliveryTerms: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    attachments: {
      type: [String],
      default: [],
    },
    history: {
      type: [PurchaseOrderHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PurchaseOrderSchema.index({ companyId: 1, orderNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ companyId: 1, status: 1 });
PurchaseOrderSchema.index({ companyId: 1, paymentStatus: 1 });
PurchaseOrderSchema.index({ companyId: 1, supplierId: 1 });
PurchaseOrderSchema.index({ companyId: 1, createdBy: 1 });
PurchaseOrderSchema.index({ companyId: 1, orderDate: -1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder & Document>(
  "PurchaseOrder",
  PurchaseOrderSchema
);
