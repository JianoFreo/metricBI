import { Types } from "mongoose";

export type InventoryTransactionType = "stock_in" | "stock_out" | "adjustment";

export interface IInventoryHistoryEntry {
  action: "created" | "updated" | "stock_in" | "stock_out" | "adjustment" | "low_stock_alert";
  previousStock?: number;
  newStock?: number;
  changedBy: string | Types.ObjectId;
  note?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IInventoryItem {
  _id: string | Types.ObjectId;
  companyId: string | Types.ObjectId;
  name: string;
  sku?: string;
  category: string;
  description?: string;
  unitCost: number;
  currentStock: number;
  reorderLevel: number;
  lowStockThreshold: number;
  status: "active" | "inactive" | "discontinued";
  warehouseId?: string | Types.ObjectId | null;
  warehouseName?: string;
  unitOfMeasure?: string;
  supplierName?: string;
  notes?: string;
  history: IInventoryHistoryEntry[];
  isActive: boolean;
  createdBy: string | Types.ObjectId;
  updatedBy?: string | Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryTransaction {
  _id: string | Types.ObjectId;
  companyId: string | Types.ObjectId;
  inventoryItemId: string | Types.ObjectId;
  type: InventoryTransactionType;
  quantity: number;
  warehouseId?: string | Types.ObjectId | null;
  reference?: string;
  note?: string;
  createdBy: string | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}