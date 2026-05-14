import mongoose, { Schema, Document } from "mongoose";
import { ICompany } from "../types/tenant.types";

/**
 * Company Schema - Represents a tenant in the multi-tenant system
 * All data belonging to a company is identified by this companyId
 */
const CompanySchema = new Schema<ICompany & Document>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[a-z0-9-]+$/,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    logo: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    industry: {
      type: String,
      default: null,
      index: true,
    },
    employeeCount: {
      type: Number,
      default: 1,
    },
    // Subscription management
    maxUsers: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
    },
    maxDataPoints: {
      type: Number,
      required: true,
      default: 10000,
      min: 100,
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "starter", "professional", "enterprise"],
      default: "free",
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    // Multi-tenancy ownership
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Company must have an owner"],
      index: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    // Custom branding
    customBranding: {
      primaryColor: String,
      logoUrl: String,
    },
    // Security and features settings
    settings: {
      twoFactorRequired: {
        type: Boolean,
        default: false,
      },
      dataExportAllowed: {
        type: Boolean,
        default: true,
      },
      apiAccessAllowed: {
        type: Boolean,
        default: true,
      },
    },
    // Flexible metadata for future extensibility
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index on common queries
CompanySchema.index({ slug: 1, isActive: 1 });
CompanySchema.index({ owner: 1, isActive: 1 });
CompanySchema.index({ subscriptionTier: 1, subscriptionStatus: 1 });

export const Company = mongoose.model<ICompany & Document>(
  "Company",
  CompanySchema
);
