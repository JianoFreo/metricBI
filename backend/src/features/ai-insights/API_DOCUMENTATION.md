# AI Insights Engine - API Documentation

## Overview

The AI Insights Engine leverages Google's Gemini API to generate intelligent business insights from your company data. It analyzes spending patterns, inventory levels, procurement efficiency, and financial metrics to provide actionable recommendations and anomaly detection.

**Key Principle**: The AI engine never directly accesses your database. All data is pre-aggregated, processed, and validated by the backend before being sent to the AI model.

## Base URL

```
/api/v1/insights
```

## Authentication

All endpoints require authentication via Bearer token:

```
Authorization: Bearer {jwt_token}
```

## Endpoints

### Generate Comprehensive Insights

#### POST /api/v1/insights/analyze

Generate detailed analysis across specified business areas.

**Required Role**: `analyst`, `manager`, `admin`

**Request Body**:

```json
{
  "analysisType": "spending|inventory|procurement|financial|holistic",
  "timeRange": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  },
  "focusAreas": ["Operations", "Marketing"],
  "includeForecasts": true,
  "includeTrendAnalysis": true,
  "anomalySensitivity": "low|medium|high",
  "customPrompt": "Optional custom analysis prompt"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-31T10:30:00Z",
    "analysisType": "spending",
    "insights": [
      {
        "type": "spending_analysis",
        "title": "Q1 Spending Patterns Identified",
        "summary": "Spending increased 15% in January with significant concentrations in equipment purchases.",
        "details": "Detailed analysis showing category breakdowns, supplier comparisons, and trends...",
        "confidence": 0.92,
        "metrics": {
          "totalSpending": 125000,
          "categoryConcentration": 0.35,
          "suppliersUsed": 12
        }
      }
    ],
    "anomalies": [
      {
        "id": "anom-001",
        "type": "cost_spike",
        "description": "Equipment spending spiked 40% compared to December",
        "severity": "high",
        "affectedEntity": "Equipment Category",
        "expectedValue": 25000,
        "actualValue": 35000,
        "deviation": 40,
        "detectedAt": "2024-01-31T10:30:00Z",
        "recommendation": "Review equipment purchases - verify if intentional or bulk purchase anomaly"
      }
    ],
    "forecasts": [
      {
        "metric": "monthly_spending",
        "forecastType": "trend",
        "currentValue": 125000,
        "predictions": [
          {
            "period": "Feb 2024",
            "predictedValue": 128000,
            "confidence": 0.85,
            "range": {
              "min": 115000,
              "max": 141000
            }
          }
        ],
        "trend": "increasing",
        "changePercentage": 2.4,
        "key_drivers": ["Equipment purchases", "Q1 budget cycle"],
        "recommendations": ["Monitor equipment spending", "Consolidate suppliers"]
      }
    ],
    "recommendations": [
      {
        "id": "rec-001",
        "category": "cost_optimization",
        "title": "Consolidate Equipment Suppliers",
        "description": "Currently using 8 equipment suppliers. Consolidating to top 3 could yield 15-20% savings.",
        "priority": "high",
        "estimatedImpact": {
          "type": "cost_reduction",
          "amount": 5250,
          "currency": "USD"
        },
        "implementationEffort": "medium",
        "timeToImplement": "2-4 weeks",
        "supportingData": ["Supplier concentration analysis", "Volume discount comparison"]
      }
    ],
    "summary": {
      "keyFindings": [
        "Spending increased 15% YoY driven by equipment purchases",
        "High supplier concentration risk with top 3 suppliers representing 65% of volume",
        "Strong growth trend expected to continue"
      ],
      "overallHealthScore": 78,
      "areasOfConcern": [
        "Equipment spending volatility",
        "Supplier concentration"
      ],
      "opportunitiesForOptimization": [
        "Supplier consolidation for volume discounts",
        "Predictive purchasing to smooth spending"
      ]
    },
    "metadata": {
      "dataPointsAnalyzed": 847,
      "analysisTimeMs": 3250,
      "modelVersion": "gemini-1.5-pro",
      "dataQuality": "excellent"
    }
  }
}
```

**Error Responses**:

- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `500 Server Error` - AI service error

---

### Stream Analysis (Real-time)

#### POST /api/v1/insights/analyze/stream

Stream insights as they're generated for real-time UI updates.

**Required Role**: `analyst`, `manager`, `admin`

**Request Body**: Same as `/analyze`

**Response**: Server-Sent Events (SSE) stream

```
data: {"content": "Analysis chunk 1"}
data: {"content": "Analysis chunk 2"}
data: {"completed": true}
```

---

### Quick Executive Summary

#### GET /api/v1/insights/summary

Get a quick 2-3 line summary and health score. Ideal for dashboards.

**Required Role**: `viewer`, `analyst`, `manager`, `admin`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | date | Yes | Start date (ISO 8601) |
| `endDate` | date | Yes | End date (ISO 8601) |
| `type` | string | No | Analysis type (default: `holistic`) |

**Example**:
```
GET /api/v1/insights/summary?startDate=2024-01-01&endDate=2024-01-31&type=holistic
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "summary": "Business operations are healthy with 15% spending efficiency improvement. Minor inventory risks detected in 2 SKUs.",
    "score": 82
  }
}
```

---

### Detect Anomalies

#### POST /api/v1/insights/anomalies

Identify anomalies, unusual patterns, and potential issues.

**Required Role**: `analyst`, `manager`, `admin`

**Request Body**:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "sensitivity": "low|medium|high"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "anom-001",
      "type": "cost_spike",
      "description": "17% cost increase in supplies category",
      "severity": "medium",
      "affectedEntity": "Supplies",
      "expectedValue": 5000,
      "actualValue": 5850,
      "deviation": 17,
      "recommendation": "Review volume purchases - possible bulk order"
    },
    {
      "id": "anom-002",
      "type": "low_stock_risk",
      "description": "SKU-001 below minimum threshold",
      "severity": "high",
      "affectedEntity": "SKU-001",
      "actualValue": 45,
      "expectedValue": 50,
      "recommendation": "Place reorder immediately"
    }
  ]
}
```

**Sensitivity Levels**:

- `low` - Flag major anomalies only (>15% deviation)
- `medium` - Flag moderate anomalies (5-15% deviation)
- `high` - Flag all anomalies including minor (>2% deviation)

---

### Generate Forecasts

#### POST /api/v1/insights/forecasts

Generate trend predictions for key business metrics.

**Required Role**: `analyst`, `manager`, `admin`

**Request Body**:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "metric": "spending|inventory|orders"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "metric": "monthly_spending",
      "forecastType": "trend",
      "currentValue": 125000,
      "predictions": [
        {
          "period": "Feb 2024",
          "predictedValue": 128500,
          "confidence": 0.87,
          "range": {
            "min": 115600,
            "max": 141400
          }
        },
        {
          "period": "Mar 2024",
          "predictedValue": 131200,
          "confidence": 0.82,
          "range": {
            "min": 117400,
            "max": 145000
          }
        }
      ],
      "trend": "increasing",
      "changePercentage": 2.4,
      "key_drivers": ["Seasonal uptrend", "Budget allocation"],
      "recommendations": ["Budget for increased spending", "Plan supplier capacity"]
    }
  ]
}
```

---

### Spending Analysis

#### POST /api/v1/insights/spending-analysis

Quick endpoint for spending analysis (pre-configured for spending data).

**Request Body**:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

---

### Inventory Analysis

#### POST /api/v1/insights/inventory-analysis

Quick endpoint for inventory analysis.

**Request Body**:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

---

### Procurement Analysis

#### POST /api/v1/insights/procurement-analysis

Quick endpoint for procurement/supplier analysis.

**Request Body**:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

---

### Financial Analysis

#### POST /api/v1/insights/financial-analysis

Quick endpoint for financial analysis.

**Request Body**:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

---

### Health Check

#### GET /api/v1/insights/health

Check if AI service is operational.

**Response (200 OK)**:

```json
{
  "success": true,
  "status": "healthy",
  "service": "Gemini AI"
}
```

**Response (503 Service Unavailable)**:

```json
{
  "success": false,
  "status": "unhealthy",
  "error": "API connection failed"
}
```

---

## Analysis Types

### Spending
Analyzes cost patterns, spending by category/supplier, trends, and opportunities

### Inventory
Analyzes stock levels, risks, turnover rates, and optimization opportunities

### Procurement
Evaluates supplier performance, order efficiency, and cost optimization

### Financial
Analyzes revenue, expenses, margins, cash flow, and budgeting

### Holistic
Comprehensive analysis across all business areas with interconnected insights

---

## Response Schemas

### Insight Object

```typescript
{
  type: "spending_analysis" | "inventory_analysis" | ...,
  title: string,
  summary: string,
  details: string,
  confidence: number (0-1),
  issueSeverity?: "low" | "medium" | "high" | "critical",
  actionItems?: string[],
  metrics?: Record<string, any>,
  timestamp?: Date
}
```

### Anomaly Object

```typescript
{
  id: string,
  type: "cost_spike" | "low_stock_risk" | ...,
  description: string,
  severity: "low" | "medium" | "high" | "critical",
  affectedEntity: string,
  expectedValue?: number,
  actualValue?: number,
  deviation?: number,
  detectedAt?: Date,
  recommendation?: string
}
```

### Forecast Object

```typescript
{
  metric: string,
  forecastType: "trend" | "seasonal" | "linear" | "exponential",
  currentValue: number,
  predictions: [{
    period: string,
    predictedValue: number,
    confidence: 0-1,
    range: { min: number, max: number }
  }],
  trend: "increasing" | "decreasing" | "stable",
  changePercentage: number,
  key_drivers?: string[],
  recommendations?: string[]
}
```

### Recommendation Object

```typescript
{
  id: string,
  category: "cost_optimization" | "inventory_management" | ...,
  title: string,
  description: string,
  priority: "low" | "medium" | "high" | "critical",
  estimatedImpact: {
    type: string,
    amount: number,
    currency?: string
  },
  implementationEffort: "easy" | "medium" | "hard",
  timeToImplement: string,
  supportingData?: string[]
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing/invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `DATA_AGGREGATION_FAILED` | 500 | Failed to collect business data |
| `AI_SERVICE_ERROR` | 503 | Gemini API unavailable |
| `DATA_SIZE_EXCEEDED` | 413 | Too much data for analysis |

---

## Rate Limiting

- Analysis endpoints: 10 requests/minute per user
- Summary endpoint: 50 requests/minute per user
- Health check: Unlimited

---

## Security & Privacy

### Data Handling
- ✅ All data is pre-aggregated and anonymized before sending to AI
- ✅ No raw database records are sent to AI
- ✅ AI has NO direct database access
- ✅ Tenant isolation enforced at all levels
- ✅ Data transmitted over HTTPS/TLS

### API Security
- ✅ Authentication required (JWT)
- ✅ Role-based access control
- ✅ Rate limiting enabled
- ✅ Request validation on all endpoints
- ✅ Audit logging for all operations

---

## Examples

### Example 1: Generate Comprehensive Spending Analysis

```bash
curl -X POST http://localhost:3000/api/v1/insights/analyze \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "spending",
    "timeRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "focusAreas": ["Operations", "IT"],
    "includeForecasts": true,
    "includeTrendAnalysis": true,
    "anomalySensitivity": "high"
  }'
```

### Example 2: Stream Analysis for Dashboard

```javascript
// JavaScript client
const response = await fetch('http://localhost:3000/api/v1/insights/analyze/stream', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    analysisType: 'holistic',
    timeRange: {
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    }
  })
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = new TextDecoder().decode(value);
  console.log(text); // Process streaming content
}
```

### Example 3: Quick Summary for Widget

```bash
curl -X GET 'http://localhost:3000/api/v1/insights/summary?startDate=2024-01-01&endDate=2024-01-31&type=holistic' \
  -H "Authorization: Bearer your-token"
```

### Example 4: Detect Anomalies

```bash
curl -X POST http://localhost:3000/api/v1/insights/anomalies \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sensitivity": "high"
  }'
```

---

## Best Practices

1. **Use Quick Endpoints for Dashboards**: Use `/summary` for widgets instead of full analysis
2. **Set Time Ranges**: Always specify appropriate time ranges for faster analysis
3. **Monitor Health**: Check `/health` endpoint before heavy analysis loads
4. **Stream for Long Analyses**: Use `/analyze/stream` for better UX on longer analyses
5. **Adjust Sensitivity**: Use `anomalySensitivity` based on your needs
6. **Batch Requests**: Don't hammer endpoints - allow time between requests
7. **Cache Results**: Cache analysis results when appropriate
8. **Review Recommendations**: Prioritize high-confidence, high-impact recommendations

---

## Support

For issues or questions:
- Check endpoint examples above
- Review error responses
- Contact: ai-insights@example.com
- Documentation: See README.md

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-31  
**Status**: Production Ready
