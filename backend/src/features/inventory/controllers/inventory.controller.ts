import { Request, Response } from "express";
import { asyncHandler } from "@common/utils/asyncHandler";
import { sendSuccess } from "@common/utils/response";
import { inventoryService } from "../services/inventory.service";

export const createInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.createItem(req.companyId!, req.user!.userId, req.body);
  sendSuccess(res, item, 201);
});

export const listInventoryItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await inventoryService.listItems(req.companyId!, {
    category: req.query.category as string | undefined,
    status: req.query.status as any,
    search: req.query.search as string | undefined,
    lowStockOnly: req.query.lowStockOnly as any,
  });

  sendSuccess(res, items, 200);
});

export const getInventoryItemById = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.getItemById(req.companyId!, req.params.itemId);
  sendSuccess(res, item, 200);
});

export const updateInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.updateItem(req.companyId!, req.params.itemId, req.user!.userId, req.body);
  sendSuccess(res, item, 200);
});

export const stockIn = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.stockMovement(
    req.companyId!,
    req.params.itemId,
    req.user!.userId,
    "stock_in",
    req.body.quantity,
    req.body
  );

  sendSuccess(res, item, 200);
});

export const stockOut = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.stockMovement(
    req.companyId!,
    req.params.itemId,
    req.user!.userId,
    "stock_out",
    req.body.quantity,
    req.body
  );

  sendSuccess(res, item, 200);
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.stockMovement(
    req.companyId!,
    req.params.itemId,
    req.user!.userId,
    "adjustment",
    req.body.quantity,
    req.body
  );

  sendSuccess(res, item, 200);
});

export const getLowStockItems = asyncHandler(async (req: Request, res: Response) => {
  const items = await inventoryService.getLowStockItems(req.companyId!);
  sendSuccess(res, items, 200);
});

export const getInventoryHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await inventoryService.getItemHistory(req.companyId!, req.params.itemId);
  sendSuccess(res, history, 200);
});

export const getInventoryTransactions = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await inventoryService.getTransactions(req.companyId!, req.params.itemId);
  sendSuccess(res, transactions, 200);
});