import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IUserMultiTenant, UserRole } from "../types/tenant.types.js";

/**
 * User Schema - Multi-tenant aware with RBAC
 * Users now belong to a company (tenantId) and have role-based permissions
 */
const UserSchema = new Schema<IUserMultiTenant & Document>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 1,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: 1,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Never include password in queries by default
      minlength: 6,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    // Multi-tenancy: which company/tenant does this user belong to?
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "User must belong to a company"],
      index: true,
    },
    // Role-based access control
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.VIEWER,
      index: true,
    },
    // Custom permissions (override role defaults)
    permissions: [
      {
        type: String,
        default: [],
      },
    ],
    // User profile information
    department: {
      type: String,
      default: null,
      trim: true,
    },
    position: {
      type: String,
      default: null,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Multi-tenant index: prevent duplicate emails within same company would require compound unique index
// For now, emails are globally unique but in production, you'd use: { email: 1, companyId: 1 } unique
// Indexes for efficient queries
UserSchema.index({ companyId: 1, isActive: 1 });
UserSchema.index({ companyId: 1, role: 1 });
UserSchema.index({ companyId: 1, email: 1 });

/**
 * Hash password before saving if it's modified
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const pwd = (this as any).password;
    (this as any).password = await bcrypt.hash(pwd, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Method to compare password with hashed password
 */
UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, (this as any).password);
};

export const User = mongoose.model<IUserMultiTenant & Document>(
  "User",
  UserSchema
);
