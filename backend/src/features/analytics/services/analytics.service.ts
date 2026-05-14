import { logger } from '@common/utils/logger.js';
import {
  RevenueTrends,
  RevenueTrendsSchema,
  ExpenseTracking,
  ExpenseTrackingSchema,
  InventoryPerformance,
  InventoryPerformanceSchema,
  ProcurementEfficiency,
  ProcurementEfficiencySchema,
  KPICalculation,
  KPICalculationSchema,
  DashboardSummary,
  DashboardSummarySchema,
  TimeRangeFilter,
  PeriodType,
  AnalyticsRequest,
} from '../schemas/analytics.schemas.js';
import { AggregationPipelines } from '../utils/aggregation-pipelines.js';

/**
 * Analytics Service
 * Handles all analytics calculations and reporting
 * Uses MongoDB aggregation pipelines for performance optimization
 */
export class AnalyticsService {
  // Cache for analytics data (15 minutes TTL)
  private static readonly CACHE_TTL = 15 * 60 * 1000;
  private static analyticsCache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Generate revenue trends report
   */
  static async getRevenueTrends(request: AnalyticsRequest): Promise<RevenueTrends> {
    const cacheKey = this.getCacheKey('revenue-trends', request);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      logger.info('Revenue trends from cache', { cacheKey });
      return cached;
    }

    try {
      logger.info('Calculating revenue trends', {
        startDate: request.timeRange.startDate,
        endDate: request.timeRange.endDate,
        period: request.period,
      });

      // Build aggregation pipeline
      const pipeline = AggregationPipelines.revenueAggregation(
        request.timeRange,
        request.period,
        request.filters
      );

      // Execute aggregation (simulated for now, swap with actual DB execution)
      const data = await this.executeAggregation('Sales', pipeline);

      // Calculate summary statistics
      const revenues = data.map((d: any) => d.revenue);
      const totalRevenue = revenues.reduce((a: number, b: number) => a + b, 0);
      const avgRevenue = totalRevenue / revenues.length;
      const peakRevenue = Math.max(...revenues);
      const lowestRevenue = Math.min(...revenues);

      // Calculate trend
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));
      const firstHalfAvg = firstHalf.reduce((a: number, d: any) => a + d.revenue, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((a: number, d: any) => a + d.revenue, 0) / secondHalf.length;
      const totalGrowth = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      const trend = totalGrowth > 2 ? 'increasing' : totalGrowth < -2 ? 'decreasing' : 'stable';

      const result: RevenueTrends = {
        timeRange: request.timeRange,
        period: request.period,
        data,
        summary: {
          totalRevenue,
          averageRevenue: avgRevenue,
          peakRevenue,
          lowestRevenue,
          totalGrowth,
          trend,
        },
      };

      // Validate schema
      const validated = RevenueTrendsSchema.parse(result);

      // Cache result
      this.setCache(cacheKey, validated);

      return validated;
    } catch (error) {
      logger.error('Failed to calculate revenue trends', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate expense tracking report
   */
  static async getExpenseTracking(request: AnalyticsRequest): Promise<ExpenseTracking> {
    const cacheKey = this.getCacheKey('expense-tracking', request);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      logger.info('Calculating expense tracking', { period: request.period });

      const pipeline = AggregationPipelines.expenseAggregation(
        request.timeRange,
        request.period,
        request.filters
      );

      const data = await this.executeAggregation('Expenses', pipeline);

      const expenses = data.map((d: any) => d.totalExpense);
      const totalExpense = expenses.reduce((a: number, b: number) => a + b, 0);
      const avgExpense = totalExpense / expenses.length;
      const maxExpense = Math.max(...expenses);
      const minExpense = Math.min(...expenses);

      // Get budget (mocked - should come from config)
      const monthlyBudget = 100000;
      const budgetUtilization = (totalExpense / (monthlyBudget * (expenses.length / 30))) * 100;

      // Calculate top categories
      const topCategories = data
        .flatMap((d: any) => d.byCategory)
        .reduce((acc: any[], item: any) => {
          const existing = acc.find((a) => a.category === item.category);
          if (existing) {
            existing.totalAmount += item.amount;
          } else {
            acc.push({ category: item.category, totalAmount: item.amount });
          }
          return acc;
        }, [])
        .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map((item: any) => ({
          category: item.category,
          amount: item.totalAmount,
          percentage: (item.totalAmount / totalExpense) * 100,
        }));

      // Detect trend
      const firstHalf = expenses.slice(0, Math.floor(expenses.length / 2));
      const secondHalf = expenses.slice(Math.floor(expenses.length / 2));
      const firstHalfAvg = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length;
      const trend =
        secondHalfAvg > firstHalfAvg * 1.05 ? 'increasing' : secondHalfAvg < firstHalfAvg * 0.95 ? 'decreasing' : 'stable';

      const result: ExpenseTracking = {
        timeRange: request.timeRange,
        period: request.period,
        data,
        summary: {
          totalExpense,
          averageExpense: avgExpense,
          maxExpense,
          minExpense,
          budgetUtilization,
          topCategories,
          trend,
        },
      };

      const validated = ExpenseTrackingSchema.parse(result);
      this.setCache(cacheKey, validated);

      return validated;
    } catch (error) {
      logger.error('Failed to calculate expense tracking', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate inventory performance report
   */
  static async getInventoryPerformance(request: AnalyticsRequest): Promise<InventoryPerformance> {
    const cacheKey = this.getCacheKey('inventory-performance', request);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      logger.info('Calculating inventory performance', { period: request.period });

      const pipeline = AggregationPipelines.inventoryAggregation(request.timeRange, request.period);

      const data = await this.executeAggregation('Inventory', pipeline);

      const turnovers = data.map((d: any) => d.accuracy);
      const avgTurnover = turnovers.reduce((a: number, b: number) => a + b, 0) / turnovers.length;

      const accuracies = data.map((d: any) => d.accuracy);
      const avgAccuracy = accuracies.reduce((a: number, b: number) => a + b, 0) / accuracies.length;

      const totalLowStockEvents = data.reduce((sum: number, d: any) => sum + d.lowStockItems, 0);
      const totalStockouts = data.reduce((sum: number, d: any) => sum + d.stockoutCount, 0);
      const totalCarryCost = data.reduce((sum: number, d: any) => sum + d.carryCost, 0);

      // Determine health
      let health: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
      if (avgAccuracy > 0.98 && avgTurnover > 6 && totalStockouts === 0) health = 'excellent';
      else if (avgAccuracy < 0.90 || totalStockouts > 5) health = 'poor';
      else if (avgAccuracy < 0.95 || totalStockouts > 2) health = 'fair';

      const result: InventoryPerformance = {
        timeRange: request.timeRange,
        period: request.period,
        data,
        summary: {
          avgTurnover,
          avgAccuracy,
          totalLowStockEvents,
          totalStockouts,
          totalCarryCost,
          health,
        },
      };

      const validated = InventoryPerformanceSchema.parse(result);
      this.setCache(cacheKey, validated);

      return validated;
    } catch (error) {
      logger.error('Failed to calculate inventory performance', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate procurement efficiency report
   */
  static async getProcurementEfficiency(request: AnalyticsRequest): Promise<ProcurementEfficiency> {
    const cacheKey = this.getCacheKey('procurement-efficiency', request);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      logger.info('Calculating procurement efficiency', { period: request.period });

      const pipeline = AggregationPipelines.procurementAggregation(
        request.timeRange,
        request.period,
        request.filters
      );

      const data = await this.executeAggregation('Procurement', pipeline);

      const totalSpending = data.reduce((sum: number, d: any) => sum + d.totalSpending, 0);
      const avgSpending = totalSpending / data.length;
      const avgLeadTime = data.reduce((sum: number, d: any) => sum + d.avgLeadTime, 0) / data.length;
      const avgOnTimeDelivery =
        data.reduce((sum: number, d: any) => sum + d.onTimeDeliveryRate, 0) / data.length;

      // Get top vendors
      const topVendorsPipeline = AggregationPipelines.topVendorsPipeline(request.timeRange, 5);
      const topVendors = await this.executeAggregation('Procurement', topVendorsPipeline);

      // Determine performance
      let timelinePerformance: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
      if (avgLeadTime < 5 && avgOnTimeDelivery > 0.98) timelinePerformance = 'excellent';
      else if (avgLeadTime > 10 || avgOnTimeDelivery < 0.90) timelinePerformance = 'poor';
      else if (avgLeadTime > 7 || avgOnTimeDelivery < 0.95) timelinePerformance = 'fair';

      let qualityPerformance: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
      const avgDefectRate = data.reduce((sum: number, d: any) => sum + (d.defectRate || 0), 0) / data.length;
      if (avgDefectRate < 0.01) qualityPerformance = 'excellent';
      else if (avgDefectRate > 0.05) qualityPerformance = 'poor';
      else if (avgDefectRate > 0.03) qualityPerformance = 'fair';

      const result: ProcurementEfficiency = {
        timeRange: request.timeRange,
        period: request.period,
        data,
        summary: {
          totalSpending,
          avgSpending,
          avgLeadTime,
          avgOnTimeDelivery,
          timelinePerformance,
          qualityPerformance,
        },
        topVendors,
      };

      const validated = ProcurementEfficiencySchema.parse(result);
      this.setCache(cacheKey, validated);

      return validated;
    } catch (error) {
      logger.error('Failed to calculate procurement efficiency', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Calculate Key Performance Indicators
   */
  static async calculateKPIs(request: AnalyticsRequest): Promise<KPICalculation> {
    const cacheKey = this.getCacheKey('kpi-calculation', request);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      logger.info('Calculating KPIs', { timeRange: request.timeRange });

      // Get all analytics needed for KPIs
      const [revenueTrends, expenseTracking, inventoryPerformance, procurementEfficiency] =
        await Promise.all([
          this.getRevenueTrends(request),
          this.getExpenseTracking(request),
          this.getInventoryPerformance(request),
          this.getProcurementEfficiency(request),
        ]);

      // Calculate KPIs
      const kpis = [
        {
          id: 'revenue-growth',
          name: 'Revenue Growth',
          category: 'financial' as const,
          currentValue: revenueTrends.summary.totalGrowth,
          targetValue: 15,
          unit: '%',
          status: revenueTrends.summary.totalGrowth > 15 ? 'on_track' : 'warning',
          trend: revenueTrends.summary.trend === 'increasing' ? 'up' : revenueTrends.summary.trend === 'decreasing' ? 'down' : 'stable',
          change: revenueTrends.summary.totalGrowth,
        },
        {
          id: 'profit-margin',
          name: 'Profit Margin',
          category: 'financial' as const,
          currentValue: revenueTrends.summary.totalGrowth - 20, // Simplified
          targetValue: 20,
          unit: '%',
          status: revenueTrends.summary.totalGrowth - 20 > 20 ? 'on_track' : 'warning',
          trend: 'stable',
          change: 0,
        },
        {
          id: 'budget-utilization',
          name: 'Budget Utilization',
          category: 'financial' as const,
          currentValue: expenseTracking.summary.budgetUtilization,
          targetValue: 80,
          unit: '%',
          status: expenseTracking.summary.budgetUtilization <= 80 ? 'on_track' : 'critical',
          trend: expenseTracking.summary.trend === 'increasing' ? 'up' : 'down',
          change: expenseTracking.summary.budgetUtilization - 80,
        },
        {
          id: 'inventory-accuracy',
          name: 'Inventory Accuracy',
          category: 'operational' as const,
          currentValue: inventoryPerformance.summary.avgAccuracy * 100,
          targetValue: 97,
          unit: '%',
          status: inventoryPerformance.summary.avgAccuracy > 0.97 ? 'on_track' : 'warning',
          trend: 'stable',
          change: 0,
        },
        {
          id: 'on-time-delivery',
          name: 'On-Time Delivery',
          category: 'operational' as const,
          currentValue: procurementEfficiency.summary.avgOnTimeDelivery * 100,
          targetValue: 95,
          unit: '%',
          status: procurementEfficiency.summary.avgOnTimeDelivery > 0.95 ? 'on_track' : 'warning',
          trend: procurementEfficiency.summary.timelinePerformance === 'excellent' ? 'up' : 'down',
          change: 0,
        },
      ];

      const onTrack = kpis.filter((k) => k.status === 'on_track').length;
      const warnings = kpis.filter((k) => k.status === 'warning').length;
      const critical = kpis.filter((k) => k.status === 'critical').length;

      let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
      if (critical === 0 && warnings < 2) overallHealth = 'excellent';
      else if (critical > 0 || warnings > 3) overallHealth = 'poor';
      else if (critical > 0 || warnings > 2) overallHealth = 'fair';

      const result: KPICalculation = {
        timeRange: request.timeRange,
        kpis: kpis.map((k) => ({
          ...k,
          lastUpdated: new Date(),
        })),
        summary: {
          totalKPIs: kpis.length,
          onTrack,
          warnings,
          critical,
          overallHealth,
        },
      };

      const validated = KPICalculationSchema.parse(result);
      this.setCache(cacheKey, validated);

      return validated;
    } catch (error) {
      logger.error('Failed to calculate KPIs', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get dashboard summary (all metrics at a glance)
   */
  static async getDashboardSummary(tenantId: string): Promise<DashboardSummary> {
    try {
      logger.info('Building dashboard summary', { tenantId });

      // Get today's and yesterday's data
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const request: AnalyticsRequest = {
        timeRange: {
          startDate: sevenDaysAgo,
          endDate: today,
        },
        period: 'daily',
      };

      const [revenue, expenses, inventory, procurement, kpis] = await Promise.all([
        this.getRevenueTrends(request),
        this.getExpenseTracking(request),
        this.getInventoryPerformance(request),
        this.getProcurementEfficiency(request),
        this.calculateKPIs(request),
      ]);

      // Extract today's values
      const currentRevenue = revenue.data[revenue.data.length - 1]?.revenue || 0;
      const previousRevenue = revenue.data[revenue.data.length - 2]?.revenue || 0;

      const currentExpense = expenses.data[expenses.data.length - 1]?.totalExpense || 0;
      const previousExpense = expenses.data[expenses.data.length - 2]?.totalExpense || 0;

      const profit = currentRevenue - currentExpense;
      const previousProfit = previousRevenue - previousExpense;

      const summary: DashboardSummary = {
        date: today,
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
          trend: revenue.summary.trend,
        },
        expenses: {
          current: currentExpense,
          previous: previousExpense,
          change: currentExpense - previousExpense,
          budgetUtilization: expenses.summary.budgetUtilization,
        },
        profit: {
          current: profit,
          margin: currentRevenue > 0 ? (profit / currentRevenue) * 100 : 0,
          previous: previousProfit,
        },
        inventory: {
          turnover: inventory.summary.avgTurnover,
          accuracy: inventory.summary.avgAccuracy,
          lowStock: inventory.summary.totalLowStockEvents,
          stockouts: inventory.summary.totalStockouts,
        },
        procurement: {
          spending: procurement.summary.totalSpending,
          avgLeadTime: procurement.summary.avgLeadTime,
          onTimeDelivery: procurement.summary.avgOnTimeDelivery,
          vendorScore: 4.5, // Simplified
        },
        kpis: {
          total: kpis.summary.totalKPIs,
          onTrack: kpis.summary.onTrack,
          warnings: kpis.summary.warnings,
          critical: kpis.summary.critical,
        },
      };

      return DashboardSummarySchema.parse(summary);
    } catch (error) {
      logger.error('Failed to generate dashboard summary', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Clear cache
   */
  static clearCache(key?: string): void {
    if (key) {
      this.analyticsCache.delete(key);
      logger.info('Cleared cache entry', { key });
    } else {
      this.analyticsCache.clear();
      logger.info('Cleared all analytics cache');
    }
  }

  /**
   * Helper: Generate cache key
   */
  private static getCacheKey(type: string, request: AnalyticsRequest): string {
    return `${type}:${request.timeRange.startDate.getTime()}:${request.timeRange.endDate.getTime()}:${request.period}:${JSON.stringify(request.filters || {})}`;
  }

  /**
   * Helper: Get from cache
   */
  private static getFromCache(key: string): any | null {
    const cached = this.analyticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      this.analyticsCache.delete(key);
    }
    return null;
  }

  /**
   * Helper: Set cache
   */
  private static setCache(key: string, data: any): void {
    this.analyticsCache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Execute aggregation pipeline
   * In production, this would execute against MongoDB
   */
  private static async executeAggregation(collection: string, pipeline: any[]): Promise<any[]> {
    // For demo purposes, return mock data
    // In production: return await db.collection(collection).aggregate(pipeline).toArray();

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 10);
    });
  }
}
