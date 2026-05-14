import logger from "@common/logger";
import {
  AggregatedData,
  AIInsightResponseSchema,
} from "../schemas/insights.schemas.js";

interface DataAggregationOptions {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  includeSpending?: boolean;
  includeInventory?: boolean;
  includeProcurement?: boolean;
  includeFinance?: boolean;
}

/**
 * Data Aggregation Service
 * Collects and pre-processes data from different business modules
 * Ensures clean, validated data is sent to AI with NO database access by AI
 */
export class DataAggregationService {
  /**
   * Aggregate all required business data
   * This is where all data collection happens - AI only sees the result
   */
  static async aggregateData(
    options: DataAggregationOptions
  ): Promise<AggregatedData> {
    logger.info("[DataAggregation] Starting data aggregation", {
      tenantId: options.tenantId,
      startDate: options.startDate,
      endDate: options.endDate,
    });

    try {
      const [spending, inventory, procurement, finance] = await Promise.all([
        options.includeSpending
          ? this.aggregateSpendingData(options)
          : Promise.resolve(undefined),
        options.includeInventory
          ? this.aggregateInventoryData(options)
          : Promise.resolve(undefined),
        options.includeProcurement
          ? this.aggregateProcurementData(options)
          : Promise.resolve(undefined),
        options.includeFinance
          ? this.aggregateFinanceData(options)
          : Promise.resolve(undefined),
      ]);

      const warnings: string[] = [];

      // Calculate data quality
      let totalDataPoints = 0;
      if (spending) totalDataPoints += 10;
      if (inventory) totalDataPoints += 15;
      if (procurement) totalDataPoints += 12;
      if (finance) totalDataPoints += 8;

      const dataQuality = this.calculateDataQuality(warnings);

      const aggregatedData: AggregatedData = {
        tenantId: options.tenantId,
        dataCollectionPeriod: {
          startDate: options.startDate,
          endDate: options.endDate,
        },
        spending,
        inventory,
        procurement,
        finance,
        metadata: {
          dataQuality,
          dataPointsIncluded: totalDataPoints,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
      };

      logger.info(
        "[DataAggregation] Data aggregation completed successfully",
        {
          tenantId: options.tenantId,
          dataQuality,
          dataPoints: totalDataPoints,
        }
      );

      return aggregatedData;
    } catch (error) {
      logger.error("[DataAggregation] Error aggregating data", {
        error: error instanceof Error ? error.message : String(error),
        tenantId: options.tenantId,
      });
      throw error;
    }
  }

  /**
   * Aggregate spending data from procurement/purchase order data
   * IMPORTANT: This pre-processes all spending data - AI sees aggregated totals only
   */
  private static async aggregateSpendingData(
    options: DataAggregationOptions
  ): Promise<AggregatedData["spending"]> {
    try {
      // NOTE: In real implementation, query from procurement module
      // For now, this is a mock implementation showing the pattern
      const mockData = {
        totalSpent: 125000,
        byCategory: {
          Raw_Materials: 45000,
          Office_Supplies: 15000,
          Equipment: 35000,
          Shipping_Costs: 20000,
          Utilities: 10000,
        },
        bySupplier: {
          "Supplier A": 45000,
          "Supplier B": 35000,
          "Supplier C": 25000,
          "Supplier D": 20000,
        },
        trends: [
          { date: "2024-01-01", amount: 30000 },
          { date: "2024-02-01", amount: 32000 },
          { date: "2024-03-01", amount: 63000 },
        ],
      };

      logger.info("[DataAggregation] Spending data aggregated", {
        tenantId: options.tenantId,
        totalSpent: mockData.totalSpent,
      });

      return mockData as AggregatedData["spending"];
    } catch (error) {
      logger.error("[DataAggregation] Error aggregating spending data", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Aggregate inventory data from inventory module
   */
  private static async aggregateInventoryData(
    options: DataAggregationOptions
  ): Promise<AggregatedData["inventory"]> {
    try {
      // NOTE: In real implementation, query from inventory module
      const mockData = {
        totalItems: 450,
        valueAtRisk: 45000,
        sku_distribution: {
          "SKU-001": 150,
          "SKU-002": 120,
          "SKU-003": 100,
          "SKU-004": 80,
        },
        stockLevels: [
          {
            name: "SKU-001",
            current: 45,
            minimum: 50,
            reorderPoint: 75,
            riskLevel: "high",
          },
          {
            name: "SKU-002",
            current: 120,
            minimum: 30,
            reorderPoint: 50,
            riskLevel: "low",
          },
          {
            name: "SKU-003",
            current: 25,
            minimum: 40,
            reorderPoint: 60,
            riskLevel: "high",
          },
          {
            name: "SKU-004",
            current: 80,
            minimum: 20,
            reorderPoint: 40,
            riskLevel: "low",
          },
        ],
      };

      logger.info("[DataAggregation] Inventory data aggregated", {
        tenantId: options.tenantId,
        totalItems: mockData.totalItems,
        valueAtRisk: mockData.valueAtRisk,
      });

      return mockData as AggregatedData["inventory"];
    } catch (error) {
      logger.error("[DataAggregation] Error aggregating inventory data", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Aggregate procurement data from procurement module
   */
  private static async aggregateProcurementData(
    options: DataAggregationOptions
  ): Promise<AggregatedData["procurement"]> {
    try {
      // NOTE: In real implementation, query from procurement module
      const mockData = {
        totalOrders: 125,
        averageOrderValue: 1000,
        orderStatuses: {
          draft: 5,
          confirmed: 10,
          shipped: 20,
          delivered: 85,
          cancelled: 5,
        },
        supplierMetrics: [
          {
            supplierId: "sup-1",
            name: "Supplier A",
            orderCount: 45,
            averageDeliveryTime: 5,
            qualityScore: 4.8,
          },
          {
            supplierId: "sup-2",
            name: "Supplier B",
            orderCount: 35,
            averageDeliveryTime: 7,
            qualityScore: 4.5,
          },
          {
            supplierId: "sup-3",
            name: "Supplier C",
            orderCount: 25,
            averageDeliveryTime: 6,
            qualityScore: 4.2,
          },
          {
            supplierId: "sup-4",
            name: "Supplier D",
            orderCount: 20,
            averageDeliveryTime: 8,
            qualityScore: 3.9,
          },
        ],
      };

      logger.info("[DataAggregation] Procurement data aggregated", {
        tenantId: options.tenantId,
        totalOrders: mockData.totalOrders,
      });

      return mockData as AggregatedData["procurement"];
    } catch (error) {
      logger.error("[DataAggregation] Error aggregating procurement data", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Aggregate financial data
   */
  private static async aggregateFinanceData(
    options: DataAggregationOptions
  ): Promise<AggregatedData["finance"]> {
    try {
      // NOTE: In real implementation, query from finance module
      const mockData = {
        revenue: 500000,
        expenses: 125000,
        profitMargin: 0.75,
        cashFlow: 250000,
        budgetUtilization: {
          Operations: 0.85,
          Marketing: 0.6,
          IT: 0.75,
          HR: 0.5,
        },
      };

      logger.info("[DataAggregation] Finance data aggregated", {
        tenantId: options.tenantId,
        revenue: mockData.revenue,
        expenses: mockData.expenses,
      });

      return mockData as AggregatedData["finance"];
    } catch (error) {
      logger.error("[DataAggregation] Error aggregating finance data", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Calculate overall data quality score
   */
  private static calculateDataQuality(
    warnings: string[]
  ): "excellent" | "good" | "fair" | "poor" {
    if (warnings.length === 0) return "excellent";
    if (warnings.length <= 2) return "good";
    if (warnings.length <= 4) return "fair";
    return "poor";
  }

  /**
   * Validate aggregated data before sending to AI
   */
  static validateData(data: AggregatedData): boolean {
    try {
      AIInsightResponseSchema.parse({
        success: true,
        timestamp: new Date(),
        analysisType: "test",
        insights: [],
        metadata: {
          dataPointsAnalyzed: data.metadata.dataPointsIncluded,
          analysisTimeMs: 0,
          modelVersion: "1.0",
          dataQuality: data.metadata.dataQuality,
        },
        summary: {
          keyFindings: [],
          overallHealthScore: 50,
          areasOfConcern: [],
          opportunitiesForOptimization: [],
        },
      });

      return true;
    } catch (error) {
      logger.error("[DataAggregation] Data validation failed", {
        error:
          error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

export default DataAggregationService;
