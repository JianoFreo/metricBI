import mongoose, { Schema, Document } from "mongoose";
import { IInventoryItem } from "../types/inventory.types.js";

const InventoryHistorySchema = new Schema(
  {
    action: {
      type: String,
      enum: ["created", "updated", "stock_in", "stock_out", "adjustment", "low_stock_alert"],
      required: true,
    },
    previousStock: {
      type: Number,
      default: null,
    },
    newStock: {
      type: Number,
      default: null,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const InventoryItemSchema = new Schema<IInventoryItem & Document>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
      index: true,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
      index: true,
    },
    warehouseName: {
      type: String,
      default: "",
      trim: true,
    },
    unitOfMeasure: {
      type: String,
      default: "unit",
      trim: true,
    },
    supplierName: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    history: {
      type: [InventoryHistorySchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

InventoryItemSchema.index({ companyId: 1, sku: 1 }, { unique: true, sparse: true });
InventoryItemSchema.index({ companyId: 1, name: 1 });
InventoryItemSchema.index({ companyId: 1, currentStock: 1 });
InventoryItemSchema.index({ companyId: 1, warehouseId: 1 });

export const InventoryItem = mongoose.model<IInventoryItem & Document>("InventoryItem", InventoryItemSchema);