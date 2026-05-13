import { z } from "zod";

export const createAssetSchema = z.object({
  name: z.string().min(2, "Asset name is required").max(150),
  category: z.string().min(2, "Asset category is required").max(100),
  cost: z.number().min(0, "Asset cost must be zero or greater"),
  depreciation: z.number().min(0).max(100, "Depreciation must be between 0 and 100"),
  serialNumber: z.string().max(120).optional(),
  purchaseDate: z.coerce.date().optional(),
  lifecycleStage: z.string().max(100).optional(),
  assignedTo: z.string().optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateAssetSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  category: z.string().min(2).max(100).optional(),
  cost: z.number().min(0).optional(),
  depreciation: z.number().min(0).max(100).optional(),
  serialNumber: z.string().max(120).optional(),
  purchaseDate: z.coerce.date().optional(),
  lifecycleStage: z.string().max(100).optional(),
  assignedTo: z.string().nullable().optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateAssetLifecycleSchema = updateAssetSchema.extend({
  status: z.enum(["active", "damaged", "retired"]).optional(),
});

export const updateAssetStatusSchema = z.object({
  status: z.enum(["active", "damaged", "retired"]),
  note: z.string().max(500).optional(),
});

export const assetIdParamsSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
});

export const listAssetsQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(["active", "damaged", "retired"]).optional(),
  search: z.string().optional(),
});