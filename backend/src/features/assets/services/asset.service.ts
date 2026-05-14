import { Asset } from "../models/Asset";
import { NotFoundError } from "@common/utils/errors";
import { AssetStatus, IAssetHistoryEntry } from "../types/asset.types";

type CreateAssetInput = {
  name: string;
  category: string;
  cost: number;
  depreciation: number;
  serialNumber?: string;
  purchaseDate?: Date;
  lifecycleStage?: string;
  assignedTo?: string;
  location?: string;
  notes?: string;
};

type UpdateAssetInput = Partial<CreateAssetInput> & { status?: AssetStatus };

export class AssetService {
  async createAsset(companyId: string, userId: string, data: CreateAssetInput): Promise<any> {
    const asset = await Asset.create({
      companyId,
      createdBy: userId,
      updatedBy: userId,
      ...data,
      history: [
        {
          action: "created",
          changedBy: userId,
          note: "Asset created",
          createdAt: new Date(),
        },
      ],
    });

    return asset.toObject();
  }

  async listAssets(companyId: string, filters: { category?: string; status?: AssetStatus; search?: string }) {
    const query: Record<string, unknown> = { companyId, isActive: true };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: "i" };
    }

    return Asset.find(query).sort({ createdAt: -1 }).lean();
  }

  async getAssetById(companyId: string, assetId: string) {
    const asset = await Asset.findOne({ _id: assetId, companyId }).lean();
    if (!asset) {
      throw new NotFoundError("Asset not found");
    }

    return asset;
  }

  async updateAssetLifecycle(companyId: string, assetId: string, userId: string, updates: UpdateAssetInput) {
    const asset = await Asset.findOne({ _id: assetId, companyId });
    if (!asset) {
      throw new NotFoundError("Asset not found");
    }

    const previousStatus = asset.status as AssetStatus;
    Object.assign(asset, {
      ...updates,
      updatedBy: userId,
    });

    const historyEntry: IAssetHistoryEntry = {
      action: "lifecycle_updated",
      changedBy: userId,
      note: "Asset lifecycle updated",
      metadata: { updates },
      createdAt: new Date(),
    };

    if (updates.status && updates.status !== previousStatus) {
      historyEntry.action = "status_changed";
      historyEntry.previousStatus = previousStatus;
      historyEntry.nextStatus = updates.status;
    }

    asset.history.push(historyEntry);
    await asset.save();

    return asset.toObject();
  }

  async updateAssetStatus(companyId: string, assetId: string, userId: string, status: AssetStatus, note?: string) {
    const asset = await Asset.findOne({ _id: assetId, companyId });
    if (!asset) {
      throw new NotFoundError("Asset not found");
    }

    const previousStatus = asset.status as AssetStatus;
    asset.status = status;
    asset.updatedBy = userId;
    asset.isActive = status !== "retired";

    asset.history.push({
      action: status === "retired" ? "retired" : "status_changed",
      previousStatus,
      nextStatus: status,
      changedBy: userId,
      note: note || `Asset status changed to ${status}`,
      createdAt: new Date(),
    });

    await asset.save();
    return asset.toObject();
  }

  async getAssetHistory(companyId: string, assetId: string) {
    const asset = await Asset.findOne({ _id: assetId, companyId }).select("history").lean();
    if (!asset) {
      throw new NotFoundError("Asset not found");
    }

    return asset.history || [];
  }
}

export const assetService = new AssetService();