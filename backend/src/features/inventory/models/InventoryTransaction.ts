import mongoose, { Schema, Document } from "mongoose";
import { IInventoryTransaction } from "../types/inventory.types.js";

const InventoryTransactionSchema = new Schema<IInventoryTransaction & Document>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    inventoryItemId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["stock_in", "stock_out", "adjustment"],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
      index: true,
    },
    reference: {
      type: String,
      default: "",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

InventoryTransactionSchema.index({ companyId: 1, inventoryItemId: 1, createdAt: -1 });

export const InventoryTransaction = mongoose.model<IInventoryTransaction & Document>(
  "InventoryTransaction",
  InventoryTransactionSchema
);