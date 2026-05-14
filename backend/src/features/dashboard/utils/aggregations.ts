import { PipelineStage } from 'mongoose';

/**
 * Dashboard Aggregation Pipelines
 * Optimized queries for dashboard data retrieval
 */
export class DashboardAggregations {
  /**
   * Get total assets value and status breakdown
   */
  static getAssetsPipeline(tenantId: string): PipelineStage[] {
    return [
      {
        $match: {
          tenant_id: tenantId,
        },
      },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalValue: { $sum: '$purchase_value' },
                count: { $sum: 1 },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
                value: { $sum: '$purchase_value' },
              },
            },
            {
              $project: {
                category: '$_id',
                count: 1,
                value: 1,
                _id: 0,
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
          recent: [
            {
              $sort: { created_at: -1 },
            },
            {
              $limit: 5,
            },
            {
              $project: {
                id: '$_id',
                name: 1,
                value: '$purchase_value',
                category: 1,
                addedDate: '$created_at',
                _id: 0,
              },
            },
          ],
        },
      },
    ];
  }

  /**
   * Get inventory status overview
   */
  static getInventoryPipeline(tenantId: string): PipelineStage[] {
    return [
      {
        $match: {
          tenant_id: tenantId,
        },
      },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalItems: { $sum: '$quantity' },
                totalValue: {
                  $sum: {
                    $multiply: ['$quantity', '$unit_cost'],
                  },
                },
                lowStock: {
                  $sum: {
                    $cond: [
                      {
                        $lte: ['$quantity', '$reorder_point'],
                      },
                      1,
                      0,
                    ],
                  },
                },
                outOfStock: {
                  $sum: {
                    $cond: [{ $eq: ['$quantity', 0] }, 1, 0],
                  },
                },
                overStock: {
                  $sum: {
                    $cond: [
                      {
                        $gte: ['$quantity', '$max_stock_level'],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          topItems: [
            {
              $addFields: {
                value: {
                  $multiply: ['$quantity', '$unit_cost'],
                },
              },
            },
            {
              $sort: { value: -1 },
            },
            {
              $limit: 5,
            },
            {
              $project: {
                itemId: '$_id',
                name: 1,
                quantity: 1,
                value: 1,
                turnover: '$turnover_ratio',
                _id: 0,
              },
            },
          ],
          byLocation: [
            {
              $group: {
                _id: '$location',
                itemCount: { $sum: 1 },
                value: {
                  $sum: {
                    $multiply: ['$quantity', '$unit_cost'],
                  },
                },
              },
            },
            {
              $project: {
                location: '$_id',
                itemCount: 1,
                value: 1,
                _id: 0,
              },
            },
          ],
        },
      },
    ];
  }

  /**
   * Get procurement overview
   */
  static getProcurementPipeline(tenantId: string): PipelineStage[] {
    return [
      {
        $facet: {
          orders: [
            {
              $match: {
                tenant_id: tenantId,
                status: { $ne: 'cancelled' },
              },
            },
            {
              $group: {
                _id: null,
                totalPending: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
                  },
                },
                totalValue: { $sum: '$total_amount' },
                onTimeCount: {
                  $sum: {
                    $cond: [
                      {
                        $lte: ['$actual_delivery_date', '$expected_delivery_date'],
                      },
                      1,
                      0,
                    ],
                  },
                },
                totalOrders: { $sum: 1 },
              },
            },
          ],
          suppliers: [
            {
              $group: {
                _id: '$supplier_id',
                name: { $first: '$supplier_name' },
                orderCount: { $sum: 1 },
                totalSpent: { $sum: '$total_amount' },
                avgRating: { $avg: '$supplier_rating' },
              },
            },
            {
              $sort: { totalSpent: -1 },
            },
            {
              $limit: 5,
            },
            {
              $project: {
                supplierId: '$_id',
                name: 1,
                orderCount: 1,
                totalSpent: 1,
                rating: '$avgRating',
                _id: 0,
              },
            },
          ],
          recentOrders: [
            {
              $match: {
                tenant_id: tenantId,
              },
            },
            {
              $sort: { created_at: -1 },
            },
            {
              $limit: 5,
            },
            {
              $project: {
                orderId: '$_id',
                supplierName: 1,
                orderValue: '$total_amount',
                status: 1,
                expectedDelivery: '$expected_delivery_date',
                actualDelivery: '$actual_delivery_date',
                _id: 0,
              },
            },
          ],
        },
      },
    ];
  }

  /**
   * Get financial summary using analytics data
   */
  static getFinancialPipeline(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): PipelineStage[] {
    return [
      {
        $match: {
          tenant_id: tenantId,
          created_at: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
    ];
  }
}
