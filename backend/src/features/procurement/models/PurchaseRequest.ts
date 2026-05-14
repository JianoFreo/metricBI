import mongoose, { Schema, Document } from "mongoose";
import {
  IPurchaseRequest,
  IPurchaseRequestItem,
  IPurchaseRequestHistory,
  PurchaseRequestStatus,
} from "../types/procurement.types.js";

/**
 * Purchase Request Item Sub-schema
 */
const PurchaseRequestItemSchema = new Schema<IPurchaseRequestItem>({
  itemId: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  estimatedUnitCost: { type: Number, required: true, min: 0 },
  notes: { type: String, default: null },
});

/**
 * Purchase Request History Sub-schema
 */
const PurchaseRequestHistorySchema = new Schema<IPurchaseRequestHistory>({
  action: {
    type: String,
    enum: ["created", "updated", "approved", "rejected"],
    required: true,
  },
  performedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: null },
  metadata: { type: Schema.Types.Mixed, default: null },
});

/**
 * Purchase Request Schema
 */
const PurchaseRequestSchema = new Schema<IPurchaseRequest & Document>(
  {
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    requestNumber: {
      type: String,
      required: true,
      index: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    items: {
      type: [PurchaseRequestItemSchema],
      required: true,
      validate: {
        validator: function (v: IPurchaseRequestItem[]) {
          return v && v.length > 0;
        },
        message: "At least one item is required",
      },
    },
    totalEstimatedCost: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PurchaseRequestStatus),
      default: PurchaseRequestStatus.PENDING,
      index: true,
    },
    approvedBy: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
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
      type: [PurchaseRequestHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PurchaseRequestSchema.index({ companyId: 1, requestNumber: 1 }, { unique: true });
PurchaseRequestSchema.index({ companyId: 1, status: 1 });
PurchaseRequestSchema.index({ companyId: 1, supplierId: 1 });
PurchaseRequestSchema.index({ companyId: 1, requestedBy: 1 });
PurchaseRequestSchema.index({ companyId: 1, createdAt: -1 });

export const PurchaseRequest = mongoose.model<IPurchaseRequest & Document>(
  "PurchaseRequest",
  PurchaseRequestSchema
);
