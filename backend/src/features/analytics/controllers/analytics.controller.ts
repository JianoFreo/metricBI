import { Request, Response } from 'express';
import { logger } from '@common/utils/logger.js';
import { asyncHandler } from '@common/utils/async-handler.js';
import { AppError } from '@common/utils/app-error.js';
import {
  AnalyticsRequestSchema,
  RevenueTrendsSchema,
  ExpenseTrackingSchema,
  InventoryPerformanceSchema,
  ProcurementEfficiencySchema,
  KPICalculationSchema,
  DashboardSummarySchema,
  TimeRangeFilterSchema,
} from '../schemas/analytics.schemas.js';
import { AnalyticsService } from '../services/analytics.service.js';

/**
 * Analytics Controller
 * Handles HTTP requests for analytics endpoints
 */
export class AnalyticsController {
  /**
   * POST /analytics/revenue-trends
   * Get revenue trends for specified period
   */
  static getRevenueTrends = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    const validated = AnalyticsRequestSchema.parse(req.body);

    logger.info('Fetching revenue trends', {
      tenantId,
      userId,
      period: validated.period,
    });

    const trends = await AnalyticsService.getRevenueTrends(validated);

    res.status(200).json({
      success: true,
      data: trends,
    });
  });

  /**
   * POST /analytics/expense-tracking
   * Get expense tracking for specified period
   */
  static getExpenseTracking = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    const validated = AnalyticsRequestSchema.parse(req.body);

    logger.info('Fetching expense tracking', {
      tenantId,
      userId,
      period: validated.period,
    });

    const tracking = await AnalyticsService.getExpenseTracking(validated);

    res.status(200).json({
      success: true,
      data: tracking,
    });
  });

  /**
   * POST /analytics/inventory-performance
   * Get inventory performance metrics
   */
  static getInventoryPerformance = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    const validated = AnalyticsRequestSchema.parse(req.body);

    logger.info('Fetching inventory performance', {
      tenantId,
      userId,
      period: validated.period,
    });

    const performance = await AnalyticsService.getInventoryPerformance(validated);

    res.status(200).json({
      success: true,
      data: performance,
    });
  });

  /**
   * POST /analytics/procurement-efficiency
   * Get procurement efficiency metrics
   */
  static getProcurementEfficiency = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    const validated = AnalyticsRequestSchema.parse(req.body);

    logger.info('Fetching procurement efficiency', {
      tenantId,
      userId,
      period: validated.period,
    });

    const efficiency = await AnalyticsService.getProcurementEfficiency(validated);

    res.status(200).json({
      success: true,
      data: efficiency,
    });
  });

  /**
   * POST /analytics/kpis
   * Calculate Key Performance Indicators
   */
  static calculateKPIs = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    const validated = AnalyticsRequestSchema.parse(req.body);

    logger.info('Calculating KPIs', {
      tenantId,
      userId,
    });

    const kpis = await AnalyticsService.calculateKPIs(validated);

    res.status(200).json({
      success: true,
      data: kpis,
    });
  });

  /**
   * GET /analytics/dashboard
   * Get dashboard summary (all metrics at a glance)
   */
  static getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId;
    const userId = (req as any).user?.id;

    logger.info('Fetching dashboard summary', { tenantId, userId });

    const summary = await AnalyticsService.getDashboardSummary(tenantId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  });

  /**
   * GET /analytics/revenue/daily
   * Quick endpoint for daily revenue
   */
  static getDailyRevenue = asyncHandler(async (req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const validated = AnalyticsRequestSchema.parse({
      timeRange: {
        startDate: today,
        endDate: tomorrow,
      },
      period: 'daily',
    });

    const trends = await AnalyticsService.getRevenueTrends(validated);

    res.status(200).json({
      success: true,
      data: trends.data[0] || null,
    });
  });

  /**
   * GET /analytics/expenses/daily
   * Quick endpoint for daily expenses
   */
  static getDailyExpenses = asyncHandler(async (req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const validated = AnalyticsRequestSchema.parse({
      timeRange: {
        startDate: today,
        endDate: tomorrow,
      },
      period: 'daily',
    });

    const tracking = await AnalyticsService.getExpenseTracking(validated);

    res.status(200).json({
      success: true,
      data: tracking.data[0] || null,
    });
  });

  /**
   * GET /analytics/profit-margin
   * Quick profit margin calculation
   */
  static getProfitMargin = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('startDate and endDate query parameters are required', 400);
    }

    const timeRange = TimeRangeFilterSchema.parse({
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    });

    const validated = AnalyticsRequestSchema.parse({
      timeRange,
      period: 'monthly',
    });

    const [revenue, expenses] = await Promise.all([
      AnalyticsService.getRevenueTrends(validated),
      AnalyticsService.getExpenseTracking(validated),
    ]);

    const totalRevenue = revenue.summary.totalRevenue;
    const totalExpense = expenses.summary.totalExpense;
    const profit = totalRevenue - totalExpense;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        revenue: totalRevenue,
        expenses: totalExpense,
        profit,
        margin,
      },
    });
  });

  /**
   * POST /analytics/comparison
   * Compare two time periods
   */
  static comparePeriods = asyncHandler(async (req: Request, res: Response) => {
    const { period1, period2, metric } = req.body;

    if (!period1 || !period2 || !metric) {
      throw new AppError('period1, period2, and metric are required', 400);
    }

    const validMetric = ['revenue', 'expenses', 'inventory', 'procurement'] as const;
    if (!validMetric.includes(metric)) {
      throw new AppError(`Invalid metric. Must be one of: ${validMetric.join(', ')}`, 400);
    }

    logger.info('Comparing periods', {
      metric,
      period1: period1,
      period2: period2,
    });

    const request1: any = AnalyticsRequestSchema.parse({
      timeRange: period1,
      period: 'monthly',
    });

    const request2: any = AnalyticsRequestSchema.parse({
      timeRange: period2,
      period: 'monthly',
    });

    let data1: any, data2: any;

    switch (metric) {
      case 'revenue':
        [data1, data2] = await Promise.all([
          AnalyticsService.getRevenueTrends(request1),
          AnalyticsService.getRevenueTrends(request2),
        ]);
        break;
      case 'expenses':
        [data1, data2] = await Promise.all([
          AnalyticsService.getExpenseTracking(request1),
          AnalyticsService.getExpenseTracking(request2),
        ]);
        break;
      case 'inventory':
        [data1, data2] = await Promise.all([
          AnalyticsService.getInventoryPerformance(request1),
          AnalyticsService.getInventoryPerformance(request2),
        ]);
        break;
      case 'procurement':
        [data1, data2] = await Promise.all([
          AnalyticsService.getProcurementEfficiency(request1),
          AnalyticsService.getProcurementEfficiency(request2),
        ]);
        break;
    }

    const comparison = {
      metric,
      period1: {
        range: period1,
        summary: data1.summary,
      },
      period2: {
        range: period2,
        summary: data2.summary,
      },
      change: data2.summary - data1.summary,
      percentageChange:
        data1.summary > 0 ? ((data2.summary - data1.summary) / data1.summary) * 100 : 0,
    };

    res.status(200).json({
      success: true,
      data: comparison,
    });
  });

  /**
   * GET /analytics/health
   * Health check for analytics service
   */
  static healthCheck = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'Analytics service operational',
      timestamp: new Date(),
    });
  });

  /**
   * POST /analytics/clear-cache
   * Clear analytics cache (admin only)
   */
  static clearCache = asyncHandler(async (req: Request, res: Response) => {
    const userRole = (req as any).user?.role;

    if (userRole !== 'admin') {
      throw new AppError('Only admins can clear analytics cache', 403);
    }

    const { key } = req.body;

    AnalyticsService.clearCache(key);

    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
    });
  });
}
