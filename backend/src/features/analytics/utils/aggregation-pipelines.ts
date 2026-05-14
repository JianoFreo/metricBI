import { PipelineStage } from 'mongoose';
import { PeriodType, TimeRangeFilter } from '../schemas/analytics.schemas.js';

/**
 * MongoDB Aggregation Pipelines
 * Optimized aggregation queries for analytics
 */
export class AggregationPipelines {
  /**
   * Get period grouping format string
   */
  private static getPeriodFormat(period: PeriodType): string {
    switch (period) {
      case 'daily':
        return '%Y-%m-%d';
      case 'weekly':
        return '%Y-W%V'; // Year-Week
      case 'monthly':
        return '%Y-%m';
      case 'yearly':
        return '%Y';
      default:
        return '%Y-%m-%d';
    }
  }

  /**
   * Get period increment value for $dateAdd
   */
  private static getPeriodIncrement(period: PeriodType): { unit: string; amount: number } {
    switch (period) {
      case 'daily':
        return { unit: 'day', amount: 1 };
      case 'weekly':
        return { unit: 'week', amount: 1 };
      case 'monthly':
        return { unit: 'month', amount: 1 };
      case 'yearly':
        return { unit: 'year', amount: 1 };
      default:
        return { unit: 'day', amount: 1 };
    }
  }

  /**
   * Revenue Trends Pipeline
   * Aggregates revenue data by time period
   */
  static revenueAggregation(
    timeRange: TimeRangeFilter,
    period: PeriodType,
    filters?: Record<string, any>
  ): PipelineStage[] {
    const periodFormat = this.getPeriodFormat(period);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
          ...filters,
        },
      },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: periodFormat, date: '$date' } },
          },
          revenue: { $sum: '$amount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$amount' },
        },
      },
      {
        $sort: { '_id.period': 1 },
      },
      {
        $project: {
          period: '$_id.period',
          revenue: 1,
          orderCount: 1,
          avgOrderValue: 1,
          _id: 0,
        },
      },
    ];

    return pipeline;
  }

  /**
   * Revenue by Product Pipeline
   */
  static revenueByProductPipeline(
    timeRange: TimeRangeFilter,
    period: PeriodType
  ): PipelineStage[] {
    const periodFormat = this.getPeriodFormat(period);

    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: periodFormat, date: '$date' } },
            product: '$productId',
          },
          revenue: { $sum: '$amount' },
          quantity: { $sum: '$quantity' },
        },
      },
      {
        $group: {
          _id: '$_id.period',
          byProduct: {
            $push: {
              product: '$_id.product',
              revenue: '$revenue',
              quantity: '$quantity',
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];
  }

  /**
   * Expense Tracking Pipeline
   */
  static expenseAggregation(
    timeRange: TimeRangeFilter,
    period: PeriodType,
    filters?: Record<string, any>
  ): PipelineStage[] {
    const periodFormat = this.getPeriodFormat(period);

    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
          ...filters,
        },
      },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: periodFormat, date: '$date' } },
            category: '$category',
          },
          amount: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: '$_id.period',
          totalExpense: { $sum: '$amount' },
          byCategory: {
            $push: {
              category: '$_id.category',
              amount: '$amount',
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          period: '$_id',
          totalExpense: 1,
          byCategory: 1,
          _id: 0,
        },
      },
    ];
  }

  /**
   * Inventory Performance Pipeline
   */
  static inventoryAggregation(
    timeRange: TimeRangeFilter,
    period: PeriodType
  ): PipelineStage[] {
    const periodFormat = this.getPeriodFormat(period);

    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: periodFormat, date: '$date' } },
          totalItems: { $sum: '$quantity' },
          lowStockItems: {
            $sum: { $cond: [{ $lt: ['$quantity', '$minimumLevel'] }, 1, 0] },
          },
          overstockItems: {
            $sum: { $cond: [{ $gt: ['$quantity', '$maximumLevel'] }, 1, 0] },
          },
          stockoutCount: { $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] } },
          avgHoldingPeriod: { $avg: '$daysHeld' },
          carryCost: { $sum: '$carryingCost' },
          accuracy: { $avg: '$accuracy' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          period: '$_id',
          totalItems: 1,
          lowStockItems: 1,
          overstockItems: 1,
          stockoutCount: 1,
          avgHoldingPeriod: 1,
          carryCost: 1,
          accuracy: 1,
          _id: 0,
        },
      },
    ];
  }

  /**
   * Inventory Turnover Pipeline
   */
  static inventoryTurnoverPipeline(
    timeRange: TimeRangeFilter,
    period: PeriodType
  ): PipelineStage[] {
    const periodFormat = this.getPeriodFormat(period);

    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: periodFormat, date: '$date' } },
          costOfGoodsSold: { $sum: '$cogs' },
          avgInventoryValue: { $avg: '$inventoryValue' },
        },
      },
      {
        $addFields: {
          turnoverRatio: {
            $cond: [
              { $eq: ['$avgInventoryValue', 0] },
              0,
              { $divide: ['$costOfGoodsSold', '$avgInventoryValue'] },
            ],
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];
  }

  /**
   * Procurement Efficiency Pipeline
   */
  static procurementAggregation(
    timeRange: TimeRangeFilter,
    period: PeriodType,
    filters?: Record<string, any>
  ): PipelineStage[] {
    const periodFormat = this.getPeriodFormat(period);

    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
          ...filters,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: periodFormat, date: '$date' } },
          totalSpending: { $sum: '$amount' },
          vendorCount: { $addToSet: '$vendorId' },
          avgLeadTime: { $avg: '$leadTime' },
          onTimeDeliveries: {
            $sum: { $cond: [{ $eq: ['$onTime', true] }, 1, 0] },
          },
          totalOrders: { $sum: 1 },
          orderCount: { $sum: 1 },
          defectiveItems: { $sum: '$defectiveQty' },
          totalReceived: { $sum: '$quantity' },
        },
      },
      {
        $addFields: {
          vendorCount: { $size: '$vendorCount' },
          onTimeDeliveryRate: {
            $cond: [
              { $eq: ['$totalOrders', 0] },
              0,
              { $divide: ['$onTimeDeliveries', '$totalOrders'] },
            ],
          },
          costPerOrder: {
            $cond: [
              { $eq: ['$orderCount', 0] },
              0,
              { $divide: ['$totalSpending', '$orderCount'] },
            ],
          },
          defectRate: {
            $cond: [
              { $eq: ['$totalReceived', 0] },
              0,
              { $divide: ['$defectiveItems', '$totalReceived'] },
            ],
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          period: '$_id',
          totalSpending: 1,
          vendorCount: 1,
          avgLeadTime: 1,
          onTimeDeliveryRate: 1,
          costPerOrder: 1,
          defectRate: 1,
          orderCount: 1,
          _id: 0,
        },
      },
    ];
  }

  /**
   * Top Vendors Pipeline
   */
  static topVendorsPipeline(
    timeRange: TimeRangeFilter,
    limit: number = 10
  ): PipelineStage[] {
    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: '$vendorId',
          spending: { $sum: '$amount' },
          onTimeDeliveries: {
            $sum: { $cond: [{ $eq: ['$onTime', true] }, 1, 0] },
          },
          totalOrders: { $sum: 1 },
          rating: { $avg: '$rating' },
          name: { $first: '$vendorName' },
        },
      },
      {
        $addFields: {
          onTimeRate: {
            $cond: [
              { $eq: ['$totalOrders', 0] },
              0,
              { $divide: ['$onTimeDeliveries', '$totalOrders'] },
            ],
          },
        },
      },
      {
        $sort: { spending: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          name: 1,
          spending: 1,
          onTimeRate: 1,
          rating: 1,
          _id: 0,
        },
      },
    ];
  }

  /**
   * Profit Margin Pipeline
   */
  static profitMarginPipeline(
    timeRange: TimeRangeFilter,
    period: PeriodType
  ): PipelineStage[] {
    const periodFormat = this.getPeriodFormat(period);

    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
        },
      },
      {
        $facet: {
          revenue: [
            {
              $group: {
                _id: { $dateToString: { format: periodFormat, date: '$date' } },
                total: { $sum: '$revenue' },
              },
            },
          ],
          expenses: [
            {
              $group: {
                _id: { $dateToString: { format: periodFormat, date: '$date' } },
                total: { $sum: '$expenses' },
              },
            },
          ],
        },
      },
      {
        $project: {
          period: { $arrayElemAt: ['$revenue._id', 0] },
          revenue: { $arrayElemAt: ['$revenue.total', 0] },
          expenses: { $arrayElemAt: ['$expenses.total', 0] },
        },
      },
      {
        $addFields: {
          profit: { $subtract: ['$revenue', '$expenses'] },
          margin: {
            $cond: [
              { $eq: ['$revenue', 0] },
              0,
              {
                $multiply: [
                  { $divide: [{ $subtract: ['$revenue', '$expenses'] }, '$revenue'] },
                  100,
                ],
              },
            ],
          },
        },
      },
    ];
  }

  /**
   * Anomaly Detection Pipeline
   * Identifies unusual spending patterns
   */
  static anomalyDetectionPipeline(
    timeRange: TimeRangeFilter,
    period: PeriodType,
    stdDevThreshold: number = 2
  ): PipelineStage[] {
    const periodFormat = this.getPeriodFormat(period);

    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: periodFormat, date: '$date' } },
          spending: { $sum: '$amount' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $group: {
          _id: null,
          periods: { $push: '$$ROOT' },
          avgSpending: { $avg: '$spending' },
        },
      },
      {
        $unwind: '$periods',
      },
      {
        $addFields: {
          stdDev: {
            $sqrt: {
              $avg: {
                $pow: [{ $subtract: ['$periods.spending', '$avgSpending'] }, 2],
              },
            },
          },
        },
      },
      {
        $addFields: {
          isAnomaly: {
            $and: [
              { $gte: ['$periods.spending', { $add: ['$avgSpending', { $multiply: ['$stdDev', stdDevThreshold] }] }] },
              { $lte: ['$periods.spending', { $subtract: ['$avgSpending', { $multiply: ['$stdDev', stdDevThreshold] }] }] },
            ],
          },
        },
      },
      {
        $match: { isAnomaly: true },
      },
    ];
  }

  /**
   * Time Series Data Pipeline
   * For charting and trend analysis
   */
  static timeSeriesPipeline(
    timeRange: TimeRangeFilter,
    period: PeriodType,
    metric: 'revenue' | 'expenses' | 'profit'
  ): PipelineStage[] {
    const periodFormat = this.getPeriodFormat(period);
    const fieldMap = {
      revenue: 'amount',
      expenses: 'cost',
      profit: 'profit',
    };

    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: periodFormat, date: '$date' } },
          value: { $sum: `$${fieldMap[metric]}` },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          period: '$_id',
          value: 1,
          _id: 0,
        },
      },
    ];
  }

  /**
   * Category Distribution Pipeline
   */
  static distributionPipeline(
    timeRange: TimeRangeFilter,
    groupBy: string
  ): PipelineStage[] {
    return [
      {
        $match: {
          date: {
            $gte: timeRange.startDate,
            $lte: timeRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: `$${groupBy}`,
          count: { $sum: 1 },
          total: { $sum: '$amount' },
          percentage: { $avg: '$percentage' },
        },
      },
      {
        $sort: { total: -1 },
      },
    ];
  }
}
