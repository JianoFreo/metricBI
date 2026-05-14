import logger from '@config/logger.js';
import { CacheService } from '../utils/cache.service.js';
import { DashboardAggregations } from '../utils/aggregations.js';
import {
  Dashboard,
  AssetsSummary,
  InventoryStatus,
  ProcurementOverview,
  AIInsightsSummary,
  FinancialSummary,
  DashboardQuery,
} from '../schemas/dashboard.schemas.js';

/**
 * Dashboard Service
 * Orchestrates data gathering from multiple sources
 */
export class DashboardService {
  /**
   * Get complete dashboard data
   */
  static async getDashboard(
    tenantId: string,
    userId: string,
    query: DashboardQuery
  ): Promise<Dashboard> {
    try {
      // Generate cache key
      const cacheKey = CacheService.generateKey('dashboard', tenantId, userId, query.period);

      // Try to get from cache
      const cached = await CacheService.get<Dashboard>(cacheKey);
      if (cached) {
        logger.info('Dashboard retrieved from cache', { tenantId, userId });
        return cached;
      }

      logger.info('Building dashboard data', { tenantId, userId, period: query.period });

      // Get date range based on period
      const { startDate, endDate } = this.getDateRange(query.period);

      // Fetch data in parallel for efficiency
      const [financialSummary, assetsSummary, inventoryStatus, procurementOverview] = await Promise.all([
        this.getFinancialSummary(tenantId, startDate, endDate),
        this.getAssetsSummary(tenantId),
        this.getInventoryStatus(tenantId),
        this.getProcurementOverview(tenantId),
      ]);

      // Get AI insights if requested
      const aiInsights = query.includeInsights
        ? await this.getAIInsights(tenantId)
        : { totalInsights: 0, insights: [], lastUpdated: new Date() };

      const dashboard: Dashboard = {
        tenantId,
        userId,
        financialSummary,
        assetsSummary,
        inventoryStatus,
        procurementOverview,
        aiInsights,
        generatedAt: new Date(),
      };

      // Cache the result
      await CacheService.set(cacheKey, dashboard, 600); // 10 minutes

      logger.info('Dashboard data prepared successfully', { tenantId });
      return dashboard;
    } catch (error) {
      logger.error('Error fetching dashboard', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get financial summary
   */
  private static async getFinancialSummary(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialSummary> {
    try {
      // Mock implementation - integrate with your financial data source
      // This would use Analytics service or direct database queries

      const totalRevenue = 450000; // Placeholder
      const totalExpenses = 150000; // Placeholder
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = (netProfit / totalRevenue) * 100;

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        currency: 'USD',
        period: { startDate, endDate },
      };
    } catch (error) {
      logger.warn('Error fetching financial summary', { error: (error as Error).message });
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        currency: 'USD',
        period: { startDate, endDate },
      };
    }
  }

  /**
   * Get assets summary using aggregation
   */
  private static async getAssetsSummary(tenantId: string): Promise<AssetsSummary> {
    try {
      // Mock implementation - integrate with Asset collection
      // In real implementation, use: const Asset = mongoose.model('Asset');
      // const result = await Asset.aggregate(DashboardAggregations.getAssetsPipeline(tenantId));

      return {
        totalAssets: 2500000,
        assetCount: 150,
        byCategory: [
          { category: 'Vehicles', count: 25, value: 1500000, percentage: 60 },
          { category: 'Equipment', count: 75, value: 750000, percentage: 30 },
          { category: 'IT', count: 50, value: 250000, percentage: 10 },
        ],
        byStatus: {
          active: 140,
          inactive: 5,
          maintenance: 3,
          deprecated: 2,
        },
        recentAdditions: [
          {
            id: 'ASSET-001',
            name: 'Forklift Unit',
            value: 25000,
            category: 'Equipment',
            addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'ASSET-002',
            name: 'Delivery Truck',
            value: 45000,
            category: 'Vehicles',
            addedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        ],
      };
    } catch (error) {
      logger.warn('Error fetching assets summary', { error: (error as Error).message });
      return {
        totalAssets: 0,
        assetCount: 0,
        byCategory: [],
        byStatus: { active: 0, inactive: 0, maintenance: 0, deprecated: 0 },
        recentAdditions: [],
      };
    }
  }

  /**
   * Get inventory status
   */
  private static async getInventoryStatus(tenantId: string): Promise<InventoryStatus> {
    try {
      // Mock implementation - integrate with Inventory collection
      return {
        totalItems: 5000,
        totalValue: 500000,
        lowStockItems: 120,
        outOfStockItems: 15,
        overStockItems: 45,
        turnoverRatio: 4.2,
        averageStockLevel: 250,
        topItems: [
          { itemId: 'SKU-001', name: 'Widget A', quantity: 500, value: 50000, turnover: 8.5 },
          { itemId: 'SKU-002', name: 'Widget B', quantity: 300, value: 45000, turnover: 6.2 },
        ],
        byLocation: [
          { location: 'Warehouse A', itemCount: 2500, value: 250000 },
          { location: 'Warehouse B', itemCount: 2000, value: 200000 },
          { location: 'Store Front', itemCount: 500, value: 50000 },
        ],
      };
    } catch (error) {
      logger.warn('Error fetching inventory status', { error: (error as Error).message });
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        overStockItems: 0,
        turnoverRatio: 0,
        averageStockLevel: 0,
        topItems: [],
        byLocation: [],
      };
    }
  }

  /**
   * Get procurement overview
   */
  private static async getProcurementOverview(tenantId: string): Promise<ProcurementOverview> {
    try {
      // Mock implementation - integrate with Procurement collection
      return {
        totalPendingOrders: 24,
        totalOrderValue: 150000,
        suppliersCount: 8,
        averageLeadTime: 5.2,
        onTimeDeliveryRate: 95.5,
        costOptimization: 12.3,
        recentOrders: [
          {
            orderId: 'PO-001',
            supplierName: 'Supplier A',
            orderValue: 50000,
            status: 'shipped',
            expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
          {
            orderId: 'PO-002',
            supplierName: 'Supplier B',
            orderValue: 35000,
            status: 'pending',
            expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          },
        ],
        topSuppliers: [
          { supplierId: 'S-001', name: 'Supplier A', orderCount: 45, totalSpent: 450000, rating: 4.8 },
          { supplierId: 'S-002', name: 'Supplier B', orderCount: 32, totalSpent: 320000, rating: 4.5 },
        ],
      };
    } catch (error) {
      logger.warn('Error fetching procurement overview', { error: (error as Error).message });
      return {
        totalPendingOrders: 0,
        totalOrderValue: 0,
        suppliersCount: 0,
        averageLeadTime: 0,
        onTimeDeliveryRate: 0,
        costOptimization: 0,
        recentOrders: [],
        topSuppliers: [],
      };
    }
  }

  /**
   * Get AI-generated insights
   */
  private static async getAIInsights(tenantId: string): Promise<AIInsightsSummary> {
    try {
      // Mock implementation - integrate with AI Insights service
      return {
        totalInsights: 3,
        insights: [
          {
            id: 'INSIGHT-001',
            type: 'opportunity',
            title: 'Inventory Optimization Opportunity',
            description: 'Warehouse B has 15% excess stock in Widget A category',
            recommendation: 'Consider redistribution to Warehouse A or promotion',
            impact: 'high',
            createdAt: new Date(),
          },
          {
            id: 'INSIGHT-002',
            type: 'warning',
            title: 'Supplier Performance Alert',
            description: 'Supplier C has missed last 2 deliveries',
            recommendation: 'Review SLA terms and consider alternate suppliers',
            impact: 'high',
            createdAt: new Date(),
          },
          {
            id: 'INSIGHT-003',
            type: 'info',
            title: 'Monthly Performance Summary',
            description: 'Overall business metrics are trending positively',
            recommendation: 'Continue current operational strategy',
            impact: 'medium',
            createdAt: new Date(),
          },
        ],
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.warn('Error fetching AI insights', { error: (error as Error).message });
      return {
        totalInsights: 0,
        insights: [],
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Clear dashboard cache
   */
  static async clearCache(tenantId: string, userId?: string): Promise<void> {
    try {
      if (userId) {
        // Clear specific user dashboard
        const key = CacheService.generateKey('dashboard', tenantId, userId);
        await CacheService.delete(key);
        logger.info('Cleared user dashboard cache', { tenantId, userId });
      } else {
        // Clear all tenant dashboards
        await CacheService.clear();
        logger.info('Cleared all dashboard cache', { tenantId });
      }
    } catch (error) {
      logger.warn('Error clearing dashboard cache', { error: (error as Error).message });
    }
  }

  /**
   * Get date range for period
   */
  private static getDateRange(period: 'today' | 'week' | 'month' | 'quarter' | 'year'): {
    startDate: Date;
    endDate: Date;
  } {
    const today = new Date();
    const endDate = new Date(today);
    let startDate = new Date(today);

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(today.getDate() - today.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(today.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate.setMonth(quarter * 3);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth((quarter + 1) * 3);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        startDate.setMonth(0);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(11);
        endDate.setDate(31);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  }
}
