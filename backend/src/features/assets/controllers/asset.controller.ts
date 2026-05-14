import { Request, Response } from "express";
import { asyncHandler } from "@common/utils/asyncHandler";
import { sendSuccess } from "@common/utils/response";
import { assetService } from "../services/asset.service";

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.createAsset(req.companyId!, req.user!.userId, req.body);
  sendSuccess(res, asset, 201);
});

export const listAssets = asyncHandler(async (req: Request, res: Response) => {
  const assets = await assetService.listAssets(req.companyId!, {
    category: req.query.category as string | undefined,
    status: req.query.status as any,
    search: req.query.search as string | undefined,
  });

  sendSuccess(res, assets, 200);
});

export const getAssetById = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.getAssetById(req.companyId!, req.params.assetId);
  sendSuccess(res, asset, 200);
});

export const updateAssetLifecycle = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.updateAssetLifecycle(
    req.companyId!,
    req.params.assetId,
    req.user!.userId,
    req.body
  );

  sendSuccess(res, asset, 200);
});

export const updateAssetStatus = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.updateAssetStatus(
    req.companyId!,
    req.params.assetId,
    req.user!.userId,
    req.body.status,
    req.body.note
  );

  sendSuccess(res, asset, 200);
});

export const getAssetHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await assetService.getAssetHistory(req.companyId!, req.params.assetId);
  sendSuccess(res, history, 200);
});