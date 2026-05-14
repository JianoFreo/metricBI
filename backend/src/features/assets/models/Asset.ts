import mongoose, { Schema, Document } from "mongoose";
import { IAsset } from "../types/asset.types";

const AssetHistorySchema = new Schema(
  {
    action: {
      type: String,
      enum: ["created", "updated", "status_changed", "lifecycle_updated", "retired"],
      required: true,
    },
    previousStatus: {
      type: String,
      enum: ["active", "damaged", "retired"],
    },
    nextStatus: {
      type: String,
      enum: ["active", "damaged", "retired"],
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

const AssetSchema = new Schema<IAsset & Document>(
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
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    depreciation: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["active", "damaged", "retired"],
      default: "active",
      index: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      default: "",
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    lifecycleStage: {
      type: String,
      default: "in_service",
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    location: {
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
      type: [AssetHistorySchema],
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

AssetSchema.index({ companyId: 1, status: 1 });
AssetSchema.index({ companyId: 1, category: 1 });
AssetSchema.index({ companyId: 1, name: 1 });

export const Asset = mongoose.model<IAsset & Document>("Asset", AssetSchema);