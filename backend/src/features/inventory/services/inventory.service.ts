import { InventoryItem } from "../models/InventoryItem";
import { InventoryTransaction } from "../models/InventoryTransaction";
import { NotFoundError, ConflictError } from "@common/utils/errors";
import { AssetStatus } from "@features/assets/types/asset.types";
import { IInventoryHistoryEntry, InventoryTransactionType } from "../types/inventory.types";

type CreateInventoryInput = {
  name: string;
  sku?: string;
  category: string;
  description?: string;
  unitCost: number;
  currentStock?: number;
  reorderLevel?: number;
  lowStockThreshold?: number;
  status?: "active" | "inactive" | "discontinued";
  warehouseId?: string;
  warehouseName?: string;
  unitOfMeasure?: string;
  supplierName?: string;
  notes?: string;
};

type UpdateInventoryInput = Partial<CreateInventoryInput>;

export class InventoryService {
  async createItem(companyId: string, userId: string, data: CreateInventoryInput): Promise<any> {
    if (data.sku) {
      const existing = await InventoryItem.findOne({ companyId, sku: data.sku });
      if (existing) {
        throw new ConflictError("SKU already exists in this company");
      }
    }

    const item = await InventoryItem.create({
      companyId,
      createdBy: userId,
      updatedBy: userId,
      currentStock: data.currentStock ?? 0,
      reorderLevel: data.reorderLevel ?? 0,
      lowStockThreshold: data.lowStockThreshold ?? 0,
      status: data.status ?? "active",
      ...data,
      history: [
        {
          action: "created",
          changedBy: userId,
          note: "Inventory item created",
          createdAt: new Date(),
        },
      ],
    });

    return item.toObject();
  }

  async listItems(companyId: string, filters: { category?: string; status?: "active" | "inactive" | "discontinued"; search?: string; lowStockOnly?: boolean }) {
    const query: Record<string, unknown> = { companyId, isActive: true };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { sku: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.lowStockOnly) {
      query.$expr = { $lte: ["$currentStock", "$lowStockThreshold"] };
    }

    return InventoryItem.find(query).sort({ createdAt: -1 }).lean();
  }

  async getItemById(companyId: string, itemId: string) {
    const item = await InventoryItem.findOne({ _id: itemId, companyId }).lean();
    if (!item) {
      throw new NotFoundError("Inventory item not found");
    }

    return item;
  }

  async updateItem(companyId: string, itemId: string, userId: string, updates: UpdateInventoryInput) {
    const item = await InventoryItem.findOne({ _id: itemId, companyId });
    if (!item) {
      throw new NotFoundError("Inventory item not found");
    }

    if (updates.sku && updates.sku !== item.sku) {
      const skuExists = await InventoryItem.findOne({ companyId, sku: updates.sku, _id: { $ne: itemId } });
      if (skuExists) {
        throw new ConflictError("SKU already exists in this company");
      }
    }

    Object.assign(item, {
      ...updates,
      updatedBy: userId,
    });

    item.history.push({
      action: "updated",
      changedBy: userId,
      note: "Inventory item updated",
      metadata: { updates },
      createdAt: new Date(),
    });

    await item.save();
    return item.toObject();
  }

  async stockMovement(
    companyId: string,
    itemId: string,
    userId: string,
    type: InventoryTransactionType,
    quantity: number,
    payload: { warehouseId?: string; reference?: string; note?: string }
  ) {
    const item = await InventoryItem.findOne({ _id: itemId, companyId });
    if (!item) {
      throw new NotFoundError("Inventory item not found");
    }

    const previousStock = item.currentStock;
    const delta = type === "stock_in" ? quantity : type === "stock_out" ? -quantity : quantity;
    const nextStock = previousStock + delta;

    if (type === "stock_out" && nextStock < 0) {
      throw new ConflictError("Insufficient stock for stock out transaction");
    }

    item.currentStock = Math.max(0, nextStock);
    item.updatedBy = userId;

    const historyAction = type === "stock_in" ? "stock_in" : type === "stock_out" ? "stock_out" : "adjustment";

    item.history.push({
      action: historyAction,
      previousStock,
      newStock: item.currentStock,
      changedBy: userId,
      note: payload.note || `${type} transaction recorded`,
      metadata: {
        quantity,
        transactionType: type,
        warehouseId: payload.warehouseId,
        reference: payload.reference,
      },
      createdAt: new Date(),
    });

    await item.save();

    await InventoryTransaction.create({
      companyId,
      inventoryItemId: itemId,
      type,
      quantity,
      warehouseId: payload.warehouseId || null,
      reference: payload.reference || "",
      note: payload.note || "",
      createdBy: userId,
    });

    return item.toObject();
  }

  async getLowStockItems(companyId: string) {
    return InventoryItem.find({
      companyId,
      isActive: true,
      $expr: { $lte: ["$currentStock", "$lowStockThreshold"] },
    })
      .sort({ currentStock: 1 })
      .lean();
  }

  async getItemHistory(companyId: string, itemId: string) {
    const item = await InventoryItem.findOne({ _id: itemId, companyId }).select("history").lean();
    if (!item) {
      throw new NotFoundError("Inventory item not found");
    }

    return item.history || [];
  }

  async getTransactions(companyId: string, itemId: string) {
    return InventoryTransaction.find({ companyId, inventoryItemId: itemId })
      .sort({ createdAt: -1 })
      .lean();
  }
}

export const inventoryService = new InventoryService();