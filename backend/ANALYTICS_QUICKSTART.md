# Analytics API - Quick Start Guide

## Overview

The Analytics API provides comprehensive business intelligence endpoints for MetricBI. This guide will get you up and running in minutes.

## Prerequisites

- Node.js 16+ and npm
- Valid authentication token (from auth endpoint)
- Backend server running on `http://localhost:3000`

## Getting Started

### 1. Authenticate

First, obtain an authentication token:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": { "id": "123", "email": "your@email.com" }
  }
}
```

Copy the `accessToken` value.

### 2. Make Your First Analytics Call

Use the token to access analytics endpoints:

```bash
TOKEN="your-access-token-here"

# Get today's revenue
curl -X GET http://localhost:3000/api/v1/analytics/revenue/daily \
  -H "Authorization: Bearer $TOKEN"
```

Response:
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

## Common Tasks

### Task 1: Get Revenue for a Specific Month

```bash
TOKEN="your-access-token-here"

curl -X POST http://localhost:3000/api/v1/analytics/revenue-trends \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timeRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "period": "daily"
  }'
```

### Task 2: Check Expenses for Today

```bash
TOKEN="your-access-token-here"

curl -X GET http://localhost:3000/api/v1/analytics/expenses/daily \
  -H "Authorization: Bearer $TOKEN"
```

### Task 3: Get Complete Dashboard

```bash
TOKEN="your-access-token-here"

curl -X GET http://localhost:3000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

This returns all metrics for the last 30 days!

### Task 4: Calculate Profit Margin

```bash
TOKEN="your-access-token-here"

curl -X GET "http://localhost:3000/api/v1/analytics/profit-margin?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Task 5: Compare Two Periods

```bash
TOKEN="your-access-token-here"

curl -X POST http://localhost:3000/api/v1/analytics/comparison \
  -H "Authorization: Bearer $TOKEN" \
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

## Using with JavaScript/Node.js

### Setup

Install required package:
```bash
npm install axios
```

### Basic Example

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1';
const TOKEN = 'your-access-token-here';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Get revenue trends
async function getRevenueTrends() {
  try {
    const response = await client.post('/analytics/revenue-trends', {
      timeRange: {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      },
      period: 'daily'
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
}

getRevenueTrends();
```

### Using a Class Wrapper

```javascript
class AnalyticsClient {
  constructor(token) {
    this.client = axios.create({
      baseURL: 'http://localhost:3000/api/v1',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getRevenueTrends(startDate, endDate, period = 'daily') {
    return this.client.post('/analytics/revenue-trends', {
      timeRange: { startDate, endDate },
      period
    });
  }

  async getExpenses(startDate, endDate, period = 'daily') {
    return this.client.post('/analytics/expense-tracking', {
      timeRange: { startDate, endDate },
      period
    });
  }

  async getDashboard() {
    return this.client.get('/analytics/dashboard');
  }

  async getProfitMargin(startDate, endDate) {
    return this.client.get('/analytics/profit-margin', {
      params: { startDate, endDate }
    });
  }

  async comparePeriods(period1, period2, metric) {
    return this.client.post('/analytics/comparison', {
      period1, period2, metric
    });
  }

  async getKPIs(startDate, endDate) {
    return this.client.post('/analytics/kpis', {
      timeRange: { startDate, endDate }
    });
  }
}

// Usage
const analytics = new AnalyticsClient('your-token');

// Get this month's revenue
const revenue = await analytics.getRevenueTrends(
  '2024-01-01',
  '2024-01-31',
  'daily'
);
console.log(revenue.data);

// Get dashboard
const dashboard = await analytics.getDashboard();
console.log(dashboard.data);
```

## Using with Python

```python
import requests
from datetime import datetime, timedelta

class AnalyticsClient:
    def __init__(self, token):
        self.token = token
        self.base_url = 'http://localhost:3000/api/v1'
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_revenue_trends(self, start_date, end_date, period='daily'):
        url = f'{self.base_url}/analytics/revenue-trends'
        payload = {
            'timeRange': {
                'startDate': start_date,
                'endDate': end_date
            },
            'period': period
        }
        response = requests.post(url, json=payload, headers=self.headers)
        return response.json()
    
    def get_dashboard(self):
        url = f'{self.base_url}/analytics/dashboard'
        response = requests.get(url, headers=self.headers)
        return response.json()
    
    def get_profit_margin(self, start_date, end_date):
        url = f'{self.base_url}/analytics/profit-margin'
        params = {'startDate': start_date, 'endDate': end_date}
        response = requests.get(url, params=params, headers=self.headers)
        return response.json()

# Usage
client = AnalyticsClient('your-token')

# Get revenue
data = client.get_revenue_trends('2024-01-01', '2024-01-31')
print(data)

# Get dashboard
dashboard = client.get_dashboard()
print(dashboard)
```

## Understanding the Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 450000,
      "averageDaily": 14516.13,
      "currency": "USD"
    },
    "data": [
      { "date": "2024-01-01", "amount": 12000 },
      { "date": "2024-01-02", "amount": 15000 }
    ]
  }
}
```

### Access the Data
```javascript
const response = await analytics.getRevenueTrends(...);
const total = response.data.summary.totalRevenue;  // 450000
const dailyData = response.data.data;              // Array of daily records
const average = response.data.summary.averageDaily; // 14516.13
```

## Error Handling

### Example Error Response
```json
{
  "success": false,
  "error": "Invalid request format",
  "details": {
    "errors": [
      {
        "path": ["timeRange", "startDate"],
        "message": "Expected date string in format YYYY-MM-DD"
      }
    ]
  }
}
```

### Handle Errors in JavaScript
```javascript
try {
  const response = await analytics.getRevenueTrends(
    '2024-01-01',
    '2024-01-31'
  );
  console.log('Success:', response.data);
} catch (error) {
  const status = error.response?.status;
  const message = error.response?.data?.error;
  
  if (status === 401) {
    console.error('Token expired - please re-authenticate');
  } else if (status === 400) {
    console.error('Invalid request:', message);
  } else {
    console.error('Server error:', message);
  }
}
```

## Common Patterns

### Get Last 30 Days of Revenue
```javascript
const end = new Date();
const start = new Date(end);
start.setDate(start.getDate() - 30);

const revenue = await analytics.getRevenueTrends(
  start.toISOString().split('T')[0],
  end.toISOString().split('T')[0],
  'daily'
);
```

### Get Month-to-Date Comparison
```javascript
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const thisMonthStart = new Date(currentYear, currentMonth, 1);
const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0);
const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
const prevMonthEnd = new Date(currentYear, currentMonth, 0);

const comparison = await analytics.comparePeriods(
  {
    startDate: thisMonthStart.toISOString().split('T')[0],
    endDate: thisMonthEnd.toISOString().split('T')[0]
  },
  {
    startDate: prevMonthStart.toISOString().split('T')[0],
    endDate: prevMonthEnd.toISOString().split('T')[0]
  },
  'revenue'
);
```

### Get All Key Metrics at Once
```javascript
const dashboard = await analytics.getDashboard();

// Extract key metrics
const revenue = dashboard.data.revenue.total;
const expenses = dashboard.data.expenses.total;
const profit = revenue - expenses;
const margin = (profit / revenue * 100).toFixed(2);
const profitMargin = dashboard.data.kpis.profitMargin;

console.log(`Revenue: $${revenue}`);
console.log(`Expenses: $${expenses}`);
console.log(`Profit: $${profit}`);
console.log(`Margin: ${margin}%`);
```

## Time Period Values

Use these values for the `period` parameter:
- `"daily"` - Daily breakdown
- `"weekly"` - Weekly breakdown
- `"monthly"` - Monthly breakdown
- `"quarterly"` - Quarterly breakdown
- `"yearly"` - Yearly breakdown

## Date Format

All dates must be in `YYYY-MM-DD` format (can also use ISO 8601):
- ✅ Valid: `"2024-01-15"`, `"2024-01-15T10:30:00Z"`
- ❌ Invalid: `"01/15/2024"`, `"Jan 15, 2024"`

## Endpoint Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/revenue/daily` | GET | Today's revenue |
| `/revenue-trends` | POST | Revenue trends |
| `/expenses/daily` | GET | Today's expenses |
| `/expense-tracking` | POST | Expense tracking |
| `/inventory-performance` | POST | Inventory metrics |
| `/procurement-efficiency` | POST | Procurement metrics |
| `/kpis` | POST | Calculate KPIs |
| `/dashboard` | GET | Complete dashboard |
| `/profit-margin` | GET | Profit margin |
| `/comparison` | POST | Compare periods |
| `/health` | GET | Health check |
| `/clear-cache` | POST | Clear cache (admin) |

## Troubleshooting

### Issue: 401 Unauthorized
- **Cause**: Invalid or expired token
- **Solution**: Get a new token from `/api/v1/auth/login`

### Issue: 400 Bad Request
- **Cause**: Invalid request format
- **Solution**: Check date format (use YYYY-MM-DD), verify required fields

### Issue: Empty Data
- **Cause**: No data for the selected period
- **Solution**: Try different date ranges or check if data exists

### Issue: Slow Response
- **Cause**: Large date range or heavy database load
- **Solution**: Use smaller date ranges, request fewer metrics, or try later

## Next Steps

1. Read the full [API documentation](./API.md)
2. Check the [feature README](./README.md)
3. Review [implementation details](../ANALYTICS_IMPLEMENTATION_SUMMARY.md)
4. Start building with the Analytics API!

## Support

For issues:
1. Check the Troubleshooting section above
2. Review the API documentation
3. Check server logs: `docker logs metricbi-backend`
4. Contact the development team

---

**Happy Analyzing! 📊**
