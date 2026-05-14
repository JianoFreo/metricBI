import { z } from 'zod';

/**
 * Financial Summary Schema
 */
export const FinancialSummarySchema = z.object({
  totalRevenue: z.number().default(0),
  totalExpenses: z.number().default(0),
  netProfit: z.number().default(0),
  profitMargin: z.number().default(0),
  currency: z.string().default('USD'),
  period: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
});

export type FinancialSummary = z.infer<typeof FinancialSummarySchema>;

/**
 * Assets Summary Schema
 */
export const AssetsSummarySchema = z.object({
  totalAssets: z.number(),
  assetCount: z.number(),
  byCategory: z.array(
    z.object({
      category: z.string(),
      count: z.number(),
      value: z.number(),
      percentage: z.number(),
    })
  ),
  byStatus: z.object({
    active: z.number(),
    inactive: z.number(),
    maintenance: z.number(),
    deprecated: z.number(),
  }),
  recentAdditions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      value: z.number(),
      category: z.string(),
      addedDate: z.date(),
    })
  ),
});

export type AssetsSummary = z.infer<typeof AssetsSummarySchema>;

/**
 * Inventory Status Schema
 */
export const InventoryStatusSchema = z.object({
  totalItems: z.number(),
  totalValue: z.number(),
  lowStockItems: z.number(),
  outOfStockItems: z.number(),
  overStockItems: z.number(),
  turnoverRatio: z.number(),
  averageStockLevel: z.number(),
  topItems: z.array(
    z.object({
      itemId: z.string(),
      name: z.string(),
      quantity: z.number(),
      value: z.number(),
      turnover: z.number(),
    })
  ),
  byLocation: z.array(
    z.object({
      location: z.string(),
      itemCount: z.number(),
      value: z.number(),
    })
  ),
});

export type InventoryStatus = z.infer<typeof InventoryStatusSchema>;

/**
 * Procurement Overview Schema
 */
export const ProcurementOverviewSchema = z.object({
  totalPendingOrders: z.number(),
  totalOrderValue: z.number(),
  suppliersCount: z.number(),
  averageLeadTime: z.number(),
  onTimeDeliveryRate: z.number(),
  costOptimization: z.number(),
  recentOrders: z.array(
    z.object({
      orderId: z.string(),
      supplierName: z.string(),
      orderValue: z.number(),
      status: z.enum(['pending', 'shipped', 'delivered', 'cancelled']),
      expectedDelivery: z.date(),
      actualDelivery: z.date().optional(),
    })
  ),
  topSuppliers: z.array(
    z.object({
      supplierId: z.string(),
      name: z.string(),
      orderCount: z.number(),
      totalSpent: z.number(),
      rating: z.number(),
    })
  ),
});

export type ProcurementOverview = z.infer<typeof ProcurementOverviewSchema>;

/**
 * AI Insights Schema
 */
export const AIInsightSchema = z.object({
  id: z.string(),
  type: z.enum(['opportunity', 'warning', 'info', 'success']),
  title: z.string(),
  description: z.string(),
  recommendation: z.string().optional(),
  impact: z.enum(['high', 'medium', 'low']),
  createdAt: z.date(),
});

export const AIInsightsSummarySchema = z.object({
  totalInsights: z.number(),
  insights: z.array(AIInsightSchema),
  lastUpdated: z.date(),
});

export type AIInsightsSummary = z.infer<typeof AIInsightsSummarySchema>;

/**
 * Complete Dashboard Schema
 */
export const DashboardSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  financialSummary: FinancialSummarySchema,
  assetsSummary: AssetsSummarySchema,
  inventoryStatus: InventoryStatusSchema,
  procurementOverview: ProcurementOverviewSchema,
  aiInsights: AIInsightsSummarySchema,
  generatedAt: z.date(),
  cachedAt: z.date().optional(),
});

export type Dashboard = z.infer<typeof DashboardSchema>;

/**
 * Dashboard Query Schema
 */
export const DashboardQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'quarter', 'year']).default('month'),
  includeInsights: z.boolean().default(true),
  includeDetailed: z.boolean().default(false),
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
