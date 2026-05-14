import { z } from "zod";

/**
 * Insight Schema - Response from AI analysis
 */
export const InsightSchema = z.object({
  type: z.enum([
    "spending_analysis",
    "inventory_analysis",
    "procurement_analysis",
    "financial_analysis",
    "anomaly_detection",
    "forecast",
    "recommendation",
  ]),
  title: z.string().min(5).max(200),
  summary: z.string().min(20),
  details: z.string().min(50),
  confidence: z.number().min(0).max(1),
  issueSeverity: z.enum(["low", "medium", "high", "critical"]).optional(),
  actionItems: z.array(z.string()).optional(),
  metrics: z
    .record(
      z.union([z.number(), z.string(), z.array(z.number()), z.object({})])
    )
    .optional(),
  timestamp: z.date().optional(),
});

export type Insight = z.infer<typeof InsightSchema>;

/**
 * Anomaly Schema - Specific anomalies detected
 */
export const AnomalySchema = z.object({
  id: z.string(),
  type: z.enum([
    "cost_spike",
    "unusual_inventory_level",
    "low_stock_risk",
    "supplier_delay",
    "budget_overrun",
    "demand_surge",
    "quality_issue",
  ]),
  description: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  affectedEntity: z.string(),
  expectedValue: z.number().optional(),
  actualValue: z.number().optional(),
  deviation: z.number().optional(),
  detectedAt: z.date().optional(),
  recommendation: z.string().optional(),
});

export type Anomaly = z.infer<typeof AnomalySchema>;

/**
 * Forecast Schema - Trend predictions
 */
export const ForecastSchema = z.object({
  metric: z.string(),
  forecastType: z.enum(["trend", "seasonal", "linear", "exponential"]),
  currentValue: z.number(),
  predictions: z.array(
    z.object({
      period: z.string(),
      predictedValue: z.number(),
      confidence: z.number().min(0).max(1),
      range: z.object({
        min: z.number(),
        max: z.number(),
      }),
    })
  ),
  trend: z.enum(["increasing", "decreasing", "stable"]),
  changePercentage: z.number(),
  key_drivers: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

export type Forecast = z.infer<typeof ForecastSchema>;

/**
 * Recommendation Schema - Actionable recommendations
 */
export const RecommendationSchema = z.object({
  id: z.string(),
  category: z.enum([
    "cost_optimization",
    "inventory_management",
    "supplier_optimization",
    "process_improvement",
    "risk_mitigation",
  ]),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  estimatedImpact: z.object({
    type: z.string(),
    amount: z.number(),
    currency: z.string().optional(),
  }),
  implementationEffort: z.enum(["easy", "medium", "hard"]),
  timeToImplement: z.string(),
  supportingData: z.array(z.string()).optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

/**
 * Comprehensive AI Response Schema
 */
export const AIInsightResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.date(),
  analysisType: z.string(),
  insights: z.array(InsightSchema),
  anomalies: z.array(AnomalySchema).optional(),
  forecasts: z.array(ForecastSchema).optional(),
  recommendations: z.array(RecommendationSchema).optional(),
  summary: z.object({
    keyFindings: z.array(z.string()),
    overallHealthScore: z.number().min(0).max(100),
    areasOfConcern: z.array(z.string()),
    opportunitiesForOptimization: z.array(z.string()),
  }),
  metadata: z.object({
    dataPointsAnalyzed: z.number(),
    analysisTimeMs: z.number(),
    modelVersion: z.string(),
    dataQuality: z.enum(["excellent", "good", "fair", "poor"]),
  }),
});

export type AIInsightResponse = z.infer<typeof AIInsightResponseSchema>;

/**
 * Request Schema - What to analyze
 */
export const InsightRequestSchema = z.object({
  analysisType: z.enum([
    "spending",
    "inventory",
    "procurement",
    "financial",
    "holistic",
  ]),
  timeRange: z.object({
    startDate: z.date().or(z.string()),
    endDate: z.date().or(z.string()),
  }),
  focusAreas: z.array(z.string()).optional(),
  includeForecasts: z.boolean().default(false),
  includeTrendAnalysis: z.boolean().default(true),
  anomalySensitivity: z.enum(["low", "medium", "high"]).default("medium"),
  customPrompt: z.string().optional(),
});

export type InsightRequest = z.infer<typeof InsightRequestSchema>;

/**
 * Aggregated Data Schema - What gets sent to AI
 */
export const AggregatedDataSchema = z.object({
  tenantId: z.string(),
  dataCollectionPeriod: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  spending: z
    .object({
      totalSpent: z.number(),
      byCategory: z.record(z.number()),
      bySupplier: z.record(z.number()),
      trends: z.array(
        z.object({
          date: z.string(),
          amount: z.number(),
        })
      ),
    })
    .optional(),
  inventory: z
    .object({
      totalItems: z.number(),
      valueAtRisk: z.number(),
      sku_distribution: z.record(z.number()),
      stockLevels: z.array(
        z.object({
          name: z.string(),
          current: z.number(),
          minimum: z.number(),
          reorderPoint: z.number(),
          riskLevel: z.enum(["low", "medium", "high"]),
        })
      ),
    })
    .optional(),
  procurement: z
    .object({
      totalOrders: z.number(),
      averageOrderValue: z.number(),
      orderStatuses: z.record(z.number()),
      supplierMetrics: z.array(
        z.object({
          supplierId: z.string(),
          name: z.string(),
          orderCount: z.number(),
          averageDeliveryTime: z.number(),
          qualityScore: z.number().optional(),
        })
      ),
    })
    .optional(),
  finance: z
    .object({
      revenue: z.number().optional(),
      expenses: z.number(),
      profitMargin: z.number().optional(),
      cashFlow: z.number().optional(),
      budgetUtilization: z.record(z.number()).optional(),
    })
    .optional(),
  metadata: z.object({
    dataQuality: z.enum(["excellent", "good", "fair", "poor"]),
    dataPointsIncluded: z.number(),
    warnings: z.array(z.string()).optional(),
  }),
});

export type AggregatedData = z.infer<typeof AggregatedDataSchema>;
