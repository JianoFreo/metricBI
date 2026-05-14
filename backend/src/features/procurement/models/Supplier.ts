import mongoose, { Schema, Document } from "mongoose";
import { ISupplier } from "../types/procurement.types.js";

/**
 * Supplier Schema - Represents vendor/supplier information
 */
const SupplierSchema = new Schema<ISupplier & Document>(
  {
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    taxId: {
      type: String,
      default: null,
    },
    bankAccountDetails: {
      type: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        swiftCode: String,
      },
      default: null,
    },
    paymentTerms: {
      type: String,
      default: "Net 30",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalOrdersCount: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SupplierSchema.index({ companyId: 1, name: 1 });
SupplierSchema.index({ companyId: 1, isActive: 1 });
SupplierSchema.index({ companyId: 1, email: 1 }, { unique: true });

export const Supplier = mongoose.model<ISupplier & Document>(
  "Supplier",
  SupplierSchema
);
