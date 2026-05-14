import { Request, Response } from 'express';
import logger from '@config/logger.js';
import { asyncHandler } from '@common/utils/async-handler.js';
import { AppError } from '@common/utils/app-error.js';
import { DashboardService } from '../services/dashboard.service.js';
import { DashboardQuerySchema } from '../schemas/dashboard.schemas.js';

/**
 * Dashboard Controller
 * Handles dashboard-related HTTP requests
 */
export class DashboardController {
  /**
   * GET /api/v1/dashboard
   * Get complete dashboard with all metrics
   */
  static getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      throw new AppError('Tenant and user context required', 400);
    }

    // Parse and validate query parameters
    const query = DashboardQuerySchema.parse({
      period: req.query.period || 'month',
      includeInsights: req.query.includeInsights !== 'false',
      includeDetailed: req.query.includeDetailed === 'true',
    });

    logger.info('Fetching dashboard', {
      tenantId,
      userId,
      period: query.period,
    });

    const dashboard = await DashboardService.getDashboard(tenantId, userId, query);

    res.status(200).json({
      success: true,
      data: dashboard,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/v1/dashboard/summary
   * Get lightweight dashboard summary (no detailed breakdowns)
   */
  static getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      throw new AppError('Tenant and user context required', 400);
    }

    const query = DashboardQuerySchema.parse({
      period: req.query.period || 'month',
      includeInsights: false,
      includeDetailed: false,
    });

    logger.info('Fetching dashboard summary', { tenantId, userId });

    const dashboard = await DashboardService.getDashboard(tenantId, userId, query);

    // Return only summary data
    const summary = {
      financialSummary: dashboard.financialSummary,
      assetsSummary: {
        totalAssets: dashboard.assetsSummary.totalAssets,
        assetCount: dashboard.assetsSummary.assetCount,
      },
      inventoryStatus: {
        totalItems: dashboard.inventoryStatus.totalItems,
        totalValue: dashboard.inventoryStatus.totalValue,
        lowStockItems: dashboard.inventoryStatus.lowStockItems,
      },
      procurementOverview: {
        totalPendingOrders: dashboard.procurementOverview.totalPendingOrders,
        totalOrderValue: dashboard.procurementOverview.totalOrderValue,
      },
      generatedAt: dashboard.generatedAt,
    };

    res.status(200).json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/v1/dashboard/assets
   * Get assets summary only
   */
  static getAssetsSummary = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      throw new AppError('Tenant and user context required', 400);
    }

    logger.info('Fetching assets summary', { tenantId, userId });

    const query = DashboardQuerySchema.parse({
      period: req.query.period || 'month',
      includeInsights: false,
      includeDetailed: req.query.detailed === 'true',
    });

    const dashboard = await DashboardService.getDashboard(tenantId, userId, query);

    res.status(200).json({
      success: true,
      data: dashboard.assetsSummary,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/v1/dashboard/inventory
   * Get inventory status only
   */
  static getInventoryStatus = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      throw new AppError('Tenant and user context required', 400);
    }

    logger.info('Fetching inventory status', { tenantId, userId });

    const query = DashboardQuerySchema.parse({
      period: req.query.period || 'month',
      includeInsights: false,
      includeDetailed: req.query.detailed === 'true',
    });

    const dashboard = await DashboardService.getDashboard(tenantId, userId, query);

    res.status(200).json({
      success: true,
      data: dashboard.inventoryStatus,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/v1/dashboard/procurement
   * Get procurement overview only
   */
  static getProcurementOverview = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      throw new AppError('Tenant and user context required', 400);
    }

    logger.info('Fetching procurement overview', { tenantId, userId });

    const query = DashboardQuerySchema.parse({
      period: req.query.period || 'month',
      includeInsights: false,
      includeDetailed: req.query.detailed === 'true',
    });

    const dashboard = await DashboardService.getDashboard(tenantId, userId, query);

    res.status(200).json({
      success: true,
      data: dashboard.procurementOverview,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/v1/dashboard/financial
   * Get financial summary only
   */
  static getFinancialSummary = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      throw new AppError('Tenant and user context required', 400);
    }

    logger.info('Fetching financial summary', { tenantId, userId });

    const query = DashboardQuerySchema.parse({
      period: req.query.period || 'month',
      includeInsights: false,
      includeDetailed: false,
    });

    const dashboard = await DashboardService.getDashboard(tenantId, userId, query);

    res.status(200).json({
      success: true,
      data: dashboard.financialSummary,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/v1/dashboard/insights
   * Get AI-generated insights only
   */
  static getInsights = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      throw new AppError('Tenant and user context required', 400);
    }

    logger.info('Fetching AI insights', { tenantId, userId });

    const query = DashboardQuerySchema.parse({
      period: req.query.period || 'month',
      includeInsights: true,
      includeDetailed: false,
    });

    const dashboard = await DashboardService.getDashboard(tenantId, userId, query);

    res.status(200).json({
      success: true,
      data: dashboard.aiInsights,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * POST /api/v1/dashboard/cache-clear
   * Clear dashboard cache (admin only)
   */
  static clearCache = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      throw new AppError('Only admins can clear dashboard cache', 403);
    }

    if (!tenantId) {
      throw new AppError('Tenant context required', 400);
    }

    logger.info('Clearing dashboard cache', { tenantId });

    await DashboardService.clearCache(tenantId);

    res.status(200).json({
      success: true,
      message: 'Dashboard cache cleared successfully',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/v1/dashboard/health
   * Health check for dashboard service
   */
  static healthCheck = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'Dashboard service operational',
      timestamp: new Date().toISOString(),
    });
  });
}
