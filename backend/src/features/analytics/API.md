# Analytics API Documentation

## Base URL
```
http://localhost:3000/api/v1/analytics
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Optional validation or error details
  }
}
```

---

## Endpoints

### 1. Revenue Analytics

#### GET /revenue/daily
Get today's revenue summary.

**Description**: Quick endpoint to get revenue for the current day.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "amount": 15000,
    "currency": "USD",
    "transactions": 45
  }
}
```

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 500: Server error

---

#### POST /revenue-trends
Get detailed revenue trends with custom time periods.

**Description**: Calculate revenue trends for a specified time range with grouping by day, week, month, quarter, or year.

**Authentication**: Required

**Request Body**:
```json
{
  "timeRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "period": "daily"
}
```

**Parameters**:
- `timeRange.startDate` (string, ISO format): Start date for analysis
- `timeRange.endDate` (string, ISO format): End date for analysis
- `period` (string, optional): Grouping period - "daily", "weekly", "monthly", "quarterly", "yearly" (default: "monthly")

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 450000,
      "averageDailyRevenue": 14516.13,
      "highestDayRevenue": 25000,
      "lowestDayRevenue": 8000,
      "currency": "USD"
    },
    "data": [
      {
        "date": "2024-01-01",
        "revenue": 12000,
        "transactions": 32,
        "currency": "USD"
      },
      {
        "date": "2024-01-02",
        "revenue": 15000,
        "transactions": 41,
        "currency": "USD"
      }
    ]
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid request format
- 401: Unauthorized
- 500: Server error

---

### 2. Expense Analytics

#### GET /expenses/daily
Get today's expense summary.

**Description**: Quick endpoint to get expenses for the current day.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "total": 5000,
    "count": 12,
    "currency": "USD"
  }
}
```

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 500: Server error

---

#### POST /expense-tracking
Get detailed expense tracking with custom time periods.

**Description**: Track expenses for a specified time range with optional category filtering.

**Authentication**: Required

**Request Body**:
```json
{
  "timeRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "period": "monthly",
  "category": "operations"
}
```

**Parameters**:
- `timeRange.startDate` (string, ISO format): Start date for analysis
- `timeRange.endDate` (string, ISO format): End date for analysis
- `period` (string, optional): Grouping period (default: "monthly")
- `category` (string, optional): Filter by expense category

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalExpense": 150000,
      "averageDailyExpense": 4838.71,
      "highestDayExpense": 8500,
      "lowestDayExpense": 2100,
      "currency": "USD"
    },
    "data": [
      {
        "date": "2024-01-01",
        "expense": 4200,
        "category": "operations",
        "count": 8
      }
    ]
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid request format
- 401: Unauthorized
- 500: Server error

---

### 3. Inventory Performance

#### POST /inventory-performance
Get inventory performance metrics.

**Description**: Retrieve inventory metrics including turnover rates, stock levels, and performance indicators.

**Authentication**: Required

**Request Body**:
```json
{
  "timeRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "period": "monthly"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalInventoryValue": 500000,
      "turnoverRatio": 4.2,
      "stockOutDays": 2,
      "averageStockLevel": 125000
    },
    "data": [
      {
        "itemId": "ITEM-001",
        "name": "Product A",
        "turnover": 4.5,
        "stockLevel": 150,
        "unitsSold": 675
      }
    ]
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid request format
- 401: Unauthorized
- 500: Server error

---

### 4. Procurement Efficiency

#### POST /procurement-efficiency
Get procurement efficiency metrics.

**Description**: Analyze supplier performance, procurement costs, and efficiency metrics.

**Authentication**: Required

**Request Body**:
```json
{
  "timeRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "period": "monthly"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProcurementCost": 200000,
      "averageLeadTime": 5.2,
      "supplierCount": 8,
      "onTimeDeliveryRate": 95.5
    },
    "data": [
      {
        "supplierId": "SUPP-001",
        "supplierName": "Supplier A",
        "totalOrders": 24,
        "onTimeDeliveries": 23,
        "averageCost": 2500,
        "leadTimeAvg": 4.1
      }
    ]
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid request format
- 401: Unauthorized
- 500: Server error

---

### 5. KPI Analytics

#### POST /kpis
Calculate Key Performance Indicators.

**Description**: Compute comprehensive KPIs including profitability, efficiency, and growth metrics.

**Authentication**: Required

**Request Body**:
```json
{
  "timeRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "period": "monthly"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "profitability": {
      "grossProfit": 300000,
      "netProfit": 150000,
      "profitMargin": 28.5,
      "returnOnAssets": 12.3
    },
    "efficiency": {
      "assetTurnover": 2.1,
      "inventoryTurnover": 4.2,
      "receivablesTurnover": 8.5
    },
    "growth": {
      "revenueGrowth": 15.2,
      "profitGrowth": 22.5,
      "customerGrowth": 8.1
    },
    "liquidity": {
      "currentRatio": 1.8,
      "quickRatio": 1.3,
      "cashConversionCycle": 35
    }
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid request format
- 401: Unauthorized
- 500: Server error

---

### 6. Dashboard Summary

#### GET /dashboard
Get complete dashboard with all metrics.

**Description**: Retrieve a comprehensive dashboard summary for the last 30 days including all key metrics.

**Authentication**: Required

**Query Parameters**: None

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2023-12-16",
      "endDate": "2024-01-15"
    },
    "revenue": {
      "total": 450000,
      "average": 15000,
      "trends": []
    },
    "expenses": {
      "total": 150000,
      "average": 5000,
      "byCategory": []
    },
    "inventory": {
      "turnover": 4.2,
      "stockLevel": 125000
    },
    "procurement": {
      "efficiency": 95.5,
      "leadTime": 5.2
    },
    "kpis": {
      "profitMargin": 28.5,
      "assetTurnover": 2.1,
      "revenueGrowth": 15.2
    }
  }
}
```

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 500: Server error

---

### 7. Profit Margin

#### GET /profit-margin
Calculate profit margin for a period.

**Description**: Quick profit margin calculation for a specified time range.

**Authentication**: Required

**Query Parameters**:
- `startDate` (string, ISO format): Start date (required)
- `endDate` (string, ISO format): End date (required)

**Example**:
```
GET /profit-margin?startDate=2024-01-01&endDate=2024-01-31
```

**Response**:
```json
{
  "success": true,
  "data": {
    "revenue": 450000,
    "expenses": 150000,
    "profit": 300000,
    "margin": 66.67,
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }
}
```

**Status Codes**:
- 200: Success
- 400: Missing required parameters
- 401: Unauthorized
- 500: Server error

---

### 8. Comparison Analysis

#### POST /comparison
Compare metrics between two time periods.

**Description**: Compare revenue, expenses, inventory, or procurement metrics between two periods.

**Authentication**: Required

**Request Body**:
```json
{
  "period1": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "period2": {
    "startDate": "2023-12-01",
    "endDate": "2023-12-31"
  },
  "metric": "revenue"
}
```

**Parameters**:
- `period1` (object): First period with startDate and endDate
- `period2` (object): Second period with startDate and endDate
- `metric` (string): Metric to compare - "revenue", "expenses", "inventory", "procurement"

**Response**:
```json
{
  "success": true,
  "data": {
    "metric": "revenue",
    "period1": {
      "range": {"startDate": "2024-01-01", "endDate": "2024-01-31"},
      "value": 450000
    },
    "period2": {
      "range": {"startDate": "2023-12-01", "endDate": "2023-12-31"},
      "value": 380000
    },
    "change": 70000,
    "percentageChange": 18.42
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid metric or parameters
- 401: Unauthorized
- 500: Server error

---

### 9. Health Check

#### GET /health
Check analytics service health.

**Description**: Verify that the analytics service is operational.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "status": "Analytics service operational",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

**Status Codes**:
- 200: Service is healthy
- 500: Service error

---

### 10. Clear Cache (Admin Only)

#### POST /clear-cache
Clear analytics cache.

**Description**: Clear analytics cache entries for faster data refresh. Requires admin role.

**Authentication**: Required (admin)

**Request Body**:
```json
{
  "key": "revenue-trends:user-123:2024-01-01:2024-01-31:monthly"
}
```

**Parameters**:
- `key` (string, optional): Specific cache key to clear. If omitted, clears all cache.

**Response**:
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

**Status Codes**:
- 200: Cache cleared
- 403: Forbidden (admin role required)
- 500: Server error

---

## Error Codes

### Validation Errors
- `400 Bad Request` - Invalid request format or missing required fields

**Example**:
```json
{
  "success": false,
  "error": "Invalid request format",
  "details": {
    "timeRange.startDate": "Invalid date format"
  }
}
```

### Authentication Errors
- `401 Unauthorized` - Missing or invalid token

**Example**:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### Authorization Errors
- `403 Forbidden` - Insufficient permissions

**Example**:
```json
{
  "success": false,
  "error": "Forbidden - Admin role required"
}
```

### Server Errors
- `500 Internal Server Error` - Server-side error

**Example**:
```json
{
  "success": false,
  "error": "Failed to fetch revenue trends"
}
```

---

## Rate Limiting

All analytics endpoints are subject to rate limiting:
- **Per-endpoint limit**: 100 requests per 15 minutes
- **Global limit**: 1000 requests per 15 minutes

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705329045
```

---

## Caching

Analytics data is cached for 15 minutes to optimize performance:
- Cache is automatically invalidated after 15 minutes
- Admins can manually clear cache using `/clear-cache` endpoint
- Cache key includes: data type, user ID, date range, and period

---

## Date Format

All dates should be in ISO 8601 format:
```
YYYY-MM-DD
or
YYYY-MM-DDTHH:mm:ss.sssZ
```

**Example**:
```
"2024-01-15"
"2024-01-15T10:30:45.123Z"
```

---

## Pagination

Some endpoints may include pagination for large datasets:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 150,
    "pages": 3
  }
}
```

---

## Best Practices

1. **Use appropriate time periods**: Use daily data for recent trends, monthly for long-term analysis
2. **Cache results**: Store API responses client-side to reduce API calls
3. **Handle errors gracefully**: Implement retry logic for failed requests
4. **Use specific metrics**: Query only the metrics you need to improve performance
5. **Schedule heavy queries**: Run KPI calculations during off-peak hours

---

## Example Code

### JavaScript/Node.js
```javascript
const token = 'your-access-token';
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Get revenue trends
const response = await fetch('http://localhost:3000/api/v1/analytics/revenue-trends', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    timeRange: {
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    period: 'daily'
  })
});

const data = await response.json();
console.log(data);
```

### Python
```python
import requests
import json

token = 'your-access-token'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

url = 'http://localhost:3000/api/v1/analytics/revenue-trends'
payload = {
    'timeRange': {
        'startDate': '2024-01-01',
        'endDate': '2024-01-31'
    },
    'period': 'daily'
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(json.dumps(data, indent=2))
```

### cURL
```bash
curl -X POST http://localhost:3000/api/v1/analytics/revenue-trends \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "timeRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "period": "daily"
  }'
```

---

## Support

For issues or questions:
1. Check the error response details
2. Review the Examples section
3. Consult the main [README.md](./README.md)
4. Contact the development team
