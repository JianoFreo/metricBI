/**
 * Product-related type definitions
 */

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  cost?: number;
  sku: string;
  images: string[];
  category: string;
  tags?: string[];
  stock: number;
  isActive: boolean;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVariant {
  _id: string;
  productId: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
}
