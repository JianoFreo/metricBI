import { Types } from "mongoose";

export type AssetStatus = "active" | "damaged" | "retired";

export interface IAssetHistoryEntry {
  action: "created" | "updated" | "status_changed" | "lifecycle_updated" | "retired";
  previousStatus?: AssetStatus;
  nextStatus?: AssetStatus;
  changedBy: string | Types.ObjectId;
  note?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IAsset {
  _id: string | Types.ObjectId;
  companyId: string | Types.ObjectId;
  name: string;
  category: string;
  cost: number;
  depreciation: number;
  status: AssetStatus;
  serialNumber?: string;
  purchaseDate?: Date;
  lifecycleStage?: string;
  assignedTo?: string | Types.ObjectId | null;
  location?: string;
  notes?: string;
  history: IAssetHistoryEntry[];
  isActive: boolean;
  createdBy: string | Types.ObjectId;
  updatedBy?: string | Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}