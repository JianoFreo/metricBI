import { logger } from '@common/utils/logger.js';
import { ChatContextData, ChatContextDataSchema } from '../schemas/chat.schemas.js';

/**
 * Context Builder Service
 * Fetches and structures company data for chat assistant context
 * Acts as security boundary - aggregates data summaries only
 */
export class ContextBuilderService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static contextCache = new Map<string, { data: ChatContextData; timestamp: number }>();

  /**
   * Build comprehensive context from company data
   */
  static async buildContext(options: {
    tenantId: string;
    timeRange?: { start: Date; end: Date };
    focusAreas?: string[];
  }): Promise<ChatContextData> {
    const cacheKey = `${options.tenantId}-${JSON.stringify(options.timeRange)}`;
    const cached = this.contextCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.info('Using cached context', { tenantId: options.tenantId });
      return cached.data;
    }

    try {
      logger.info('Building chat context', { tenantId: options.tenantId });

      const startDate = options.timeRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = options.timeRange?.end || new Date();

      // Parallel data collection from all modules
      const [financialData, procurementData, inventoryData, performanceData] = await Promise.all([
        this.aggregateFinancialMetrics(options.tenantId, startDate, endDate),
        this.aggregateProcurementMetrics(options.tenantId, startDate, endDate),
        this.aggregateInventoryMetrics(options.tenantId, startDate, endDate),
        this.aggregatePerformanceMetrics(options.tenantId, startDate, endDate),
      ]);

      // Detect anomalies across data
      const anomalies = this.detectAnomalies({
        financialData,
        procurementData,
        inventoryData,
      });

      const contextData: ChatContextData = {
        period: { start: startDate, end: endDate },
        metrics: {
          revenue: financialData.revenue,
          expenses: financialData.expenses,
          profitMargin: financialData.profitMargin,
          growth: performanceData.growth,
          customMetrics: {
            procurementSpending: procurementData.totalSpending,
            inventoryTurnover: inventoryData.turnover,
            vendorCount: procurementData.vendorCount,
            averageLeadTime: procurementData.averageLeadTime,
          },
        },
        topPerformers: performanceData.topPerformers,
        anomalies,
        departmentData: {
          procurement: procurementData,
          inventory: inventoryData,
          financial: financialData,
        },
      };

      // Validate against schema
      const validatedData = ChatContextDataSchema.parse(contextData);

      // Cache the result
      this.contextCache.set(cacheKey, {
        data: validatedData,
        timestamp: Date.now(),
      });

      logger.info('Context built successfully', {
        tenantId: options.tenantId,
        anomalyCount: anomalies.length,
      });

      return validatedData;
    } catch (error) {
      logger.error('Failed to build context', {
        tenantId: options.tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Clear cache for specific tenant
   */
  static clearContextCache(tenantId?: string): void {
    if (tenantId) {
      const keysToDelete = Array.from(this.contextCache.keys()).filter((key) =>
        key.startsWith(tenantId)
      );
      keysToDelete.forEach((key) => this.contextCache.delete(key));
      logger.info('Cleared cache entries', { tenantId, count: keysToDelete.length });
    } else {
      this.contextCache.clear();
      logger.info('Cleared all context cache');
    }
  }

  /**
   * Aggregate financial metrics
   * Returns summaries only, not raw records
   */
  private static async aggregateFinancialMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      // Mock financial data aggregation
      // In production, this would query from financial database
      // and return only aggregated summaries (totals, averages, trends)
      // NOT individual transactions

      const revenue = 1250000; // Mock: total revenue
      const expenses = 875000; // Mock: total expenses
      const profitMargin = ((revenue - expenses) / revenue) * 100;

      logger.info('Aggregated financial metrics', {
        tenantId,
        revenue,
        expenses,
        profitMargin,
      });

      return {
        revenue,
        expenses,
        profitMargin,
        quarterlyTrend: [
          { quarter: 'Q1', value: 1100000 },
          { quarter: 'Q2', value: 1200000 },
          { quarter: 'Q3', value: 1250000 },
        ],
        costBreakdown: {
          labor: 0.4,
          materials: 0.35,
          operations: 0.25,
        },
      };
    } catch (error) {
      logger.error('Failed to aggregate financial metrics', {
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { revenue: 0, expenses: 0, profitMargin: 0 };
    }
  }

  /**
   * Aggregate procurement metrics
   */
  private static async aggregateProcurementMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      // Mock procurement data aggregation
      // Returns summary statistics only

      const totalSpending = 450000;
      const vendorCount = 42;
      const averageLeadTime = 7.5; // days
      const onTimeDeliveryRate = 0.94;

      logger.info('Aggregated procurement metrics', {
        tenantId,
        spending: totalSpending,
        vendors: vendorCount,
      });

      return {
        totalSpending,
        vendorCount,
        averageLeadTime,
        onTimeDeliveryRate,
        topCategories: [
          { category: 'Materials', spending: 180000, percentage: 40 },
          { category: 'Services', spending: 135000, percentage: 30 },
          { category: 'Equipment', spending: 90000, percentage: 20 },
        ],
        costTrend: 'stable', // 'up' | 'down' | 'stable'
      };
    } catch (error) {
      logger.error('Failed to aggregate procurement metrics', {
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        totalSpending: 0,
        vendorCount: 0,
        averageLeadTime: 0,
        onTimeDeliveryRate: 0,
      };
    }
  }

  /**
   * Aggregate inventory metrics
   */
  private static async aggregateInventoryMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      // Mock inventory data aggregation

      const turnover = 4.2; // times per year
      const stockoutEvents = 3;
      const overstock = 12; // percentage of inventory
      const understock = 2;

      logger.info('Aggregated inventory metrics', {
        tenantId,
        turnover,
        stockouts: stockoutEvents,
      });

      return {
        turnover,
        stockoutEvents,
        overstock,
        understock,
        totalItems: 15000,
        lowStockItems: 234,
        overstockItems: 89,
        inventoryValue: 425000,
        accuracy: 0.97, // 97% accuracy in counting
      };
    } catch (error) {
      logger.error('Failed to aggregate inventory metrics', {
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        turnover: 0,
        stockoutEvents: 0,
      };
    }
  }

  /**
   * Aggregate performance metrics
   */
  private static async aggregatePerformanceMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      // Mock performance data aggregation

      const growth = 12.5; // percentage YoY
      const topPerformers = [
        { name: 'Product A', value: 450000, trend: 'up' as const },
        { name: 'Service X', value: 320000, trend: 'up' as const },
        { name: 'Product B', value: 280000, trend: 'stable' as const },
      ];

      logger.info('Aggregated performance metrics', {
        tenantId,
        growth,
        topPerformerCount: topPerformers.length,
      });

      return {
        growth,
        topPerformers,
        marketShare: 18.5, // percentage
        customerSatisfaction: 0.88,
        nps: 42,
      };
    } catch (error) {
      logger.error('Failed to aggregate performance metrics', {
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        growth: 0,
        topPerformers: [],
      };
    }
  }

  /**
   * Detect anomalies in aggregated data
   */
  private static detectAnomalies(data: {
    financialData: any;
    procurementData: any;
    inventoryData: any;
  }) {
    const anomalies = [];

    // Detect cost spikes
    if (data.financialData.expenses > 900000) {
      anomalies.push({
        type: 'cost_spike',
        severity: 'medium' as const,
        description: 'Expenses exceed historical average by 8%',
      });
    }

    // Detect inventory issues
    if (data.inventoryData.overstock > 10) {
      anomalies.push({
        type: 'overstock',
        severity: 'low' as const,
        description: 'Overstock percentage above normal threshold',
      });
    }

    // Detect procurement delays
    if (data.procurementData.averageLeadTime > 8) {
      anomalies.push({
        type: 'procurement_delay',
        severity: 'medium' as const,
        description: 'Average lead time increased by 1.5 days',
      });
    }

    // Detect delivery issues
    if (data.procurementData.onTimeDeliveryRate < 0.95) {
      anomalies.push({
        type: 'delivery_performance',
        severity: 'low' as const,
        description: 'On-time delivery rate declined to 94%',
      });
    }

    return anomalies;
  }

  /**
   * Get focused context for specific topic
   */
  static async getFocusedContext(options: {
    tenantId: string;
    focusArea: string;
    timeRange?: { start: Date; end: Date };
  }): Promise<Partial<ChatContextData>> {
    const fullContext = await this.buildContext({
      tenantId: options.tenantId,
      timeRange: options.timeRange,
      focusAreas: [options.focusArea],
    });

    // Return only relevant data for focus area
    switch (options.focusArea.toLowerCase()) {
      case 'procurement':
        return {
          period: fullContext.period,
          metrics: {
            customMetrics: fullContext.metrics.customMetrics,
          },
          departmentData: {
            procurement: fullContext.departmentData?.procurement,
          },
        };
      case 'inventory':
        return {
          period: fullContext.period,
          metrics: {
            customMetrics: fullContext.metrics.customMetrics,
          },
          departmentData: {
            inventory: fullContext.departmentData?.inventory,
          },
          anomalies: fullContext.anomalies?.filter((a) => a.type.includes('stock')),
        };
      case 'financial':
        return {
          period: fullContext.period,
          metrics: {
            revenue: fullContext.metrics.revenue,
            expenses: fullContext.metrics.expenses,
            profitMargin: fullContext.metrics.profitMargin,
          },
          departmentData: {
            financial: fullContext.departmentData?.financial,
          },
        };
      default:
        return fullContext;
    }
  }
}
