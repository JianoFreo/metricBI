import mongoose, { Schema, Document } from "mongoose";
import { IProduct } from "../types/product.types.js";

/**
 * Product Schema - Stores product information
 */
const ProductSchema = new Schema<IProduct & Document>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    cost: {
      type: Number,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound index for faster queries
 */
ProductSchema.index({ tenantId: 1, isActive: 1 });
ProductSchema.index({ category: 1, price: 1 });

export const Product = mongoose.model<IProduct & Document>(
  "Product",
  ProductSchema
);
