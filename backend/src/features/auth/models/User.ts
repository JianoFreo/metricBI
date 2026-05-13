import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, AuthRole } from "../types/auth.types.js";

/**
 * User Schema - Stores user credentials and profile information
 */
const UserSchema = new Schema<IUser & Document>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include password by default
    },
    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    role: {
      type: String,
      enum: ["viewer", "analyst", "manager", "admin", "super_admin"],
      default: "viewer",
    },
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1, companyId: 1 }, { unique: true });
UserSchema.index({ companyId: 1, role: 1 });

/**
 * Hash password before saving if it's modified
 */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash((this as any).password, salt);
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

export const User = mongoose.model<IUser & Document>("User", UserSchema);
