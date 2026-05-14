# Analytics Feature

## Overview

The Analytics feature provides comprehensive business intelligence and reporting capabilities for MetricBI. It includes revenue tracking, expense analysis, inventory performance metrics, procurement efficiency, KPI calculations, and profit margin analysis.

## Architecture

```
analytics/
├── controllers/
│   └── analytics.controller.ts      # Request handlers for analytics endpoints
├── routes/
│   └── analytics.routes.ts          # Route definitions and validation middleware
├── services/
│   └── analytics.service.ts         # Business logic for analytics calculations
├── schemas/
│   └── analytics.schemas.ts         # Zod validation schemas
├── utils/
│   └── aggregation-pipelines.ts     # MongoDB aggregation pipelines
└── README.md
```

## Features

### 1. Revenue Analytics
- **GET /api/v1/analytics/revenue/daily** - Quick revenue for today
- **POST /api/v1/analytics/revenue-trends** - Detailed revenue trends with custom periods

### 2. Expense Tracking
- **GET /api/v1/analytics/expenses/daily** - Quick expenses for today
- **POST /api/v1/analytics/expense-tracking** - Detailed expense tracking with filters

### 3. Inventory Performance
- **POST /api/v1/analytics/inventory-performance** - Inventory metrics and turnover rates

### 4. Procurement Efficiency
- **POST /api/v1/analytics/procurement-efficiency** - Supplier performance and cost optimization

### 5. KPI Analytics
- **POST /api/v1/analytics/kpis** - Calculate key performance indicators

### 6. Dashboard & Summary
- **GET /api/v1/analytics/dashboard** - Complete dashboard with all metrics (last 30 days)
- **GET /api/v1/analytics/profit-margin** - Quick profit margin calculation

### 7. Comparative Analysis
- **POST /api/v1/analytics/comparison** - Compare metrics between time periods

### 8. System
- **GET /api/v1/analytics/health** - Service health check
- **POST /api/v1/analytics/clear-cache** - Clear analytics cache (admin only)

## API Examples

### Revenue Trends
```bash
curl -X POST http://localhost:3000/api/v1/analytics/revenue-trends \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "timeRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "period": "daily"
  }'
```

### Expense Tracking
```bash
curl -X POST http://localhost:3000/api/v1/analytics/expense-tracking \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "timeRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "period": "monthly"
  }'
```

### Dashboard Summary
```bash
curl -X GET http://localhost:3000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer <token>"
```

### Profit Margin
```bash
curl -X GET "http://localhost:3000/api/v1/analytics/profit-margin?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

### Compare Periods
```bash
curl -X POST http://localhost:3000/api/v1/analytics/comparison \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "period1": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "period2": {
      "startDate": "2023-12-01",
      "endDate": "2023-12-31"
    },
    "metric": "revenue"
  }'
```

## Request Schema

### AnalyticsRequest
```typescript
{
  timeRange: {
    startDate: Date,  // ISO format or Date object
    endDate: Date     // ISO format or Date object
  },
  period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"  // Default: "monthly"
}
```

## Response Format

All analytics endpoints return a consistent response format:

```typescript
{
  success: boolean,
  data: {
    // Data varies by endpoint
    summary: {
      total: number,
      average: number,
      // ... metric-specific fields
    },
    data: []  // Granular data points
  }
}
```

## Services

### AnalyticsService
Main service handling all analytics calculations with built-in caching (15-minute TTL).

**Key Methods:**
- `getRevenueTrends(request)` - Calculate revenue trends
- `getExpenseTracking(request)` - Track expenses
- `getInventoryPerformance(request)` - Get inventory metrics
- `getProcurementEfficiency(request)` - Analyze procurement
- `calculateKPIs(request)` - Compute KPIs
- `getDashboardSummary(tenantId)` - Get dashboard data
- `clearCache(key?)` - Clear cache entries

## Caching Strategy

- **TTL**: 15 minutes for all analytics queries
- **Cache Key**: `${type}:${tenantId}:${startDate}:${endDate}:${period}`
- **Manual Invalidation**: Admin endpoint `/api/v1/analytics/clear-cache`

## Aggregation Pipelines

The `AggregationPipelines` utility provides optimized MongoDB aggregation pipelines:

- Revenue grouping by time period
- Expense categorization and summation
- Inventory turnover calculations
- Procurement efficiency scoring
- KPI metric computations

## Authentication & Authorization

All analytics endpoints require:
- **Authentication**: Bearer token (user must be logged in)
- **Authorization**: User must have access to their tenant data

**Admin-Only Endpoints:**
- `POST /api/v1/analytics/clear-cache` - Requires admin role

## Error Handling

Standard error responses:

```typescript
{
  success: false,
  error: "Error message",
  details?: {
    // Validation errors
  }
}
```

**Common Status Codes:**
- 200: Success
- 400: Invalid request format or validation error
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 500: Server error

## Performance Considerations

1. **Aggregation Pipelines**: Use MongoDB aggregation for large datasets
2. **Index Strategy**: Ensure indexes on date fields and tenant_id
3. **Caching**: 15-minute TTL reduces database queries
4. **Batch Operations**: Dashboard endpoint fetches all metrics in parallel
5. **Query Optimization**: Aggregation pipelines minimize data transfer

## Future Enhancements

- [ ] Real-time analytics via WebSockets
- [ ] Custom dimension analysis
- [ ] Predictive analytics (trend forecasting)
- [ ] Export functionality (CSV, PDF)
- [ ] Scheduled report generation
- [ ] Alert thresholds for KPIs
- [ ] Advanced filtering options
- [ ] Custom date ranges and periods

## Testing

### Test Coverage
- Controller request/response handling
- Service business logic
- Aggregation pipeline correctness
- Error handling
- Authentication/authorization

### Example Test
```typescript
describe('AnalyticsController', () => {
  it('should return revenue trends', async () => {
    const response = await request(app)
      .post('/api/v1/analytics/revenue-trends')
      .set('Authorization', `Bearer ${token}`)
      .send({
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});
```

## Troubleshooting

### Cache Issues
If data seems stale, clear the cache:
```bash
curl -X POST http://localhost:3000/api/v1/analytics/clear-cache \
  -H "Authorization: Bearer <admin-token>"
```

### Performance Issues
- Check MongoDB indexes: `db.collection.getIndexes()`
- Monitor aggregation pipeline execution: `db.collection.aggregate(...).explain("executionStats")`
- Review cache hit rate: Check server logs

### Validation Errors
Ensure request body follows `AnalyticsRequest` schema:
- `timeRange.startDate` and `timeRange.endDate` are valid dates
- `period` is one of allowed values
- Date strings are in ISO format (YYYY-MM-DD)

## Contributing

When adding new analytics endpoints:
1. Add schema to `schemas/analytics.schemas.ts`
2. Implement method in `AnalyticsService`
3. Add controller method in `AnalyticsController`
4. Register route in `routes/analytics.routes.ts`
5. Update this README with examples

## References

- [MongoDB Aggregation Framework](https://docs.mongodb.com/manual/aggregation/)
- [Zod Validation](https://zod.dev/)
- [Express.js Routing](https://expressjs.com/en/guide/routing.html)
