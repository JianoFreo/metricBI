import { z } from 'zod';

/**
 * Time Range Filter
 * Used for filtering analytics by date ranges
 */
export const TimeRangeFilterSchema = z.object({
  startDate: z.date().describe('Start date for analysis'),
  endDate: z.date().describe('End date for analysis'),
});

export type TimeRangeFilter = z.infer<typeof TimeRangeFilterSchema>;

/**
 * Aggregation Period Type
 * Determines the granularity of time-based aggregations
 */
export const PeriodTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']).describe(
  'Time period for aggregation'
);

export type PeriodType = z.infer<typeof PeriodTypeSchema>;

/**
 * Revenue Data Point
 */
export const RevenueDataPointSchema = z.object({
  period: z.string().describe('Time period (e.g., "2024-01-15" or "Week 3")'),
  revenue: z.number().min(0).describe('Total revenue for period'),
  previousPeriod: z.number().min(0).optional().describe('Revenue from previous period'),
  growth: z.number().describe('Growth percentage vs previous period'),
  byProduct: z.record(z.number()).optional().describe('Revenue breakdown by product'),
  byRegion: z.record(z.number()).optional().describe('Revenue breakdown by region'),
  avgOrderValue: z.number().optional().describe('Average order value'),
  orderCount: z.number().optional().describe('Number of orders'),
});

export type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>;

/**
 * Revenue Trends Response
 */
export const RevenueTrendsSchema = z.object({
  timeRange: TimeRangeFilterSchema,
  period: PeriodTypeSchema,
  data: z.array(RevenueDataPointSchema),
  summary: z.object({
    totalRevenue: z.number(),
    averageRevenue: z.number(),
    peakRevenue: z.number(),
    lowestRevenue: z.number(),
    totalGrowth: z.number().describe('Overall growth percentage'),
    trend: z.enum(['increasing', 'decreasing', 'stable']),
  }),
  forecast: z.array(RevenueDataPointSchema).optional().describe('Predicted revenue for future periods'),
});

export type RevenueTrends = z.infer<typeof RevenueTrendsSchema>;

/**
 * Expense Data Point
 */
export const ExpenseDataPointSchema = z.object({
  period: z.string(),
  totalExpense: z.number().min(0),
  previousPeriod: z.number().min(0).optional(),
  change: z.number().optional().describe('Change in expenses'),
  byCategory: z.record(z.number()).describe('Expenses by category'),
  averageDaily: z.number().optional().describe('Average daily expense'),
  percentage: z.number().optional().describe('Percentage of budget'),
});

export type ExpenseDataPoint = z.infer<typeof ExpenseDataPointSchema>;

/**
 * Expense Tracking Response
 */
export const ExpenseTrackingSchema = z.object({
  timeRange: TimeRangeFilterSchema,
  period: PeriodTypeSchema,
  data: z.array(ExpenseDataPointSchema),
  summary: z.object({
    totalExpense: z.number(),
    averageExpense: z.number(),
    maxExpense: z.number(),
    minExpense: z.number(),
    budgetUtilization: z.number().describe('Percentage of budget used'),
    topCategories: z.array(
      z.object({
        category: z.string(),
        amount: z.number(),
        percentage: z.number(),
      })
    ),
    trend: z.enum(['increasing', 'decreasing', 'stable']),
  }),
  anomalies: z
    .array(
      z.object({
        period: z.string(),
        anomaly: z.string(),
        severity: z.enum(['low', 'medium', 'high']),
      })
    )
    .optional(),
});

export type ExpenseTracking = z.infer<typeof ExpenseTrackingSchema>;

/**
 * Inventory Performance Metric
 */
export const InventoryMetricSchema = z.object({
  period: z.string(),
  totalItems: z.number(),
  lowStockItems: z.number(),
  overstockItems: z.number(),
  stockoutCount: z.number(),
  turnoverRatio: z.number().describe('Inventory turnover ratio'),
  avgHoldingPeriod: z.number().describe('Average holding period in days'),
  carryCost: z.number().describe('Cost of carrying inventory'),
  accuracy: z.number().min(0).max(1).describe('Inventory accuracy percentage'),
});

export type InventoryMetric = z.infer<typeof InventoryMetricSchema>;

/**
 * Inventory Performance Response
 */
export const InventoryPerformanceSchema = z.object({
  timeRange: TimeRangeFilterSchema,
  period: PeriodTypeSchema,
  data: z.array(InventoryMetricSchema),
  summary: z.object({
    avgTurnover: z.number(),
    avgAccuracy: z.number(),
    totalLowStockEvents: z.number(),
    totalStockouts: z.number(),
    totalCarryCost: z.number(),
    health: z.enum(['excellent', 'good', 'fair', 'poor']),
  }),
  recommendations: z
    .array(
      z.object({
        issue: z.string(),
        recommendation: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
      })
    )
    .optional(),
});

export type InventoryPerformance = z.infer<typeof InventoryPerformanceSchema>;

/**
 * Procurement Efficiency Metric
 */
export const ProcurementMetricSchema = z.object({
  period: z.string(),
  totalSpending: z.number(),
  vendorCount: z.number(),
  avgLeadTime: z.number().describe('Average lead time in days'),
  onTimeDeliveryRate: z.number().min(0).max(1),
  costPerOrder: z.number(),
  defectRate: z.number().min(0).max(1).optional(),
  orderCount: z.number(),
});

export type ProcurementMetric = z.infer<typeof ProcurementMetricSchema>;

/**
 * Procurement Efficiency Response
 */
export const ProcurementEfficiencySchema = z.object({
  timeRange: TimeRangeFilterSchema,
  period: PeriodTypeSchema,
  data: z.array(ProcurementMetricSchema),
  summary: z.object({
    totalSpending: z.number(),
    avgSpending: z.number(),
    avgLeadTime: z.number(),
    avgOnTimeDelivery: z.number(),
    costSavings: z.number().optional(),
    timelinePerformance: z.enum(['excellent', 'good', 'fair', 'poor']),
    qualityPerformance: z.enum(['excellent', 'good', 'fair', 'poor']),
  }),
  topVendors: z
    .array(
      z.object({
        name: z.string(),
        spending: z.number(),
        onTimeRate: z.number(),
        rating: z.number().min(1).max(5),
      })
    )
    .optional(),
  improvements: z
    .array(
      z.object({
        area: z.string(),
        current: z.number(),
        target: z.number(),
        action: z.string(),
      })
    )
    .optional(),
});

export type ProcurementEfficiency = z.infer<typeof ProcurementEfficiencySchema>;

/**
 * KPI (Key Performance Indicator)
 */
export const KPISchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['financial', 'operational', 'quality', 'customer']),
  currentValue: z.number(),
  targetValue: z.number(),
  threshold: z.object({
    warning: z.number().describe('Warning level'),
    critical: z.number().describe('Critical level'),
  }).optional(),
  unit: z.string().describe('Measurement unit (e.g., "%", "$", "days")'),
  status: z.enum(['on_track', 'warning', 'critical']),
  trend: z.enum(['up', 'down', 'stable']),
  change: z.number().describe('Percentage change from previous period'),
  lastUpdated: z.date(),
});

export type KPI = z.infer<typeof KPISchema>;

/**
 * KPI Calculation Response
 */
export const KPICalculationSchema = z.object({
  timeRange: TimeRangeFilterSchema,
  kpis: z.array(KPISchema),
  summary: z.object({
    totalKPIs: z.number(),
    onTrack: z.number(),
    warnings: z.number(),
    critical: z.number(),
    overallHealth: z.enum(['excellent', 'good', 'fair', 'poor']),
  }),
  alerts: z
    .array(
      z.object({
        kpi: z.string(),
        message: z.string(),
        severity: z.enum(['info', 'warning', 'critical']),
        action: z.string().optional(),
      })
    )
    .optional(),
  trends: z
    .record(z.array(z.number()))
    .optional()
    .describe('Historical KPI values for charting'),
});

export type KPICalculation = z.infer<typeof KPICalculationSchema>;

/**
 * Analytics Request DTO
 */
export const AnalyticsRequestSchema = z.object({
  timeRange: TimeRangeFilterSchema,
  period: PeriodTypeSchema.default('daily'),
  filters: z
    .object({
      product: z.string().optional(),
      region: z.string().optional(),
      vendor: z.string().optional(),
      category: z.string().optional(),
      department: z.string().optional(),
    })
    .optional(),
  includeForecasts: z.boolean().default(false),
  includeTrends: z.boolean().default(true),
});

export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>;

/**
 * Dashboard Summary (All analytics at a glance)
 */
export const DashboardSummarySchema = z.object({
  date: z.date(),
  revenue: z.object({
    current: z.number(),
    previous: z.number(),
    growth: z.number(),
    trend: z.enum(['up', 'down', 'stable']),
  }),
  expenses: z.object({
    current: z.number(),
    previous: z.number(),
    change: z.number(),
    budgetUtilization: z.number(),
  }),
  profit: z.object({
    current: z.number(),
    margin: z.number(),
    previous: z.number(),
  }),
  inventory: z.object({
    turnover: z.number(),
    accuracy: z.number(),
    lowStock: z.number(),
    stockouts: z.number(),
  }),
  procurement: z.object({
    spending: z.number(),
    avgLeadTime: z.number(),
    onTimeDelivery: z.number(),
    vendorScore: z.number(),
  }),
  kpis: z.object({
    total: z.number(),
    onTrack: z.number(),
    warnings: z.number(),
    critical: z.number(),
  }),
});

export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

/**
 * Comparison Data Point
 * For comparing periods or segments
 */
export const ComparisonDataPointSchema = z.object({
  label: z.string(),
  current: z.number(),
  previous: z.number(),
  change: z.number(),
  percentage: z.number(),
});

export type ComparisonDataPoint = z.infer<typeof ComparisonDataPointSchema>;
