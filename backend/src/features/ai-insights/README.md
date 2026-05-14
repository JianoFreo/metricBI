# AI Insights Engine

A production-ready AI insights engine powered by Google Gemini API that analyzes your business data to generate intelligent insights, detect anomalies, and provide actionable recommendations.

## 🚀 Key Features

- **Comprehensive Analysis**: Analyze spending, inventory, procurement, and financial data
- **Intelligent Insights**: AI-powered analysis of patterns, trends, and opportunities
- **Anomaly Detection**: Automatically detect cost spikes, low stock risks, and unusual patterns
- **Trend Forecasting**: Predict future business metrics with confidence intervals
- **Smart Recommendations**: Get actionable recommendations with estimated business impact
- **Real-time Streaming**: Stream analysis results for responsive UX
- **Data Privacy**: AI never directly accesses database - all data pre-aggregated and safe
- **Multi-tenant**: Complete tenant isolation and security
- **Role-based Access**: Fine-grained permission control

## 🏗️ Architecture

```
ai-insights/
├── services/
│   ├── gemini.service.ts          # Gemini API integration
│   ├── data-aggregation.service.ts # Data collection layer
│   └── insight-engine.service.ts   # Main orchestration
├── utils/
│   └── prompt-builder.ts           # Dynamic prompt engineering
├── schemas/
│   └── insights.schemas.ts         # Zod validation schemas
├── controllers/
│   └── insights.controller.ts      # Request handlers
├── routes/
│   └── insights.routes.ts          # API endpoints
├── tests/
│   └── insights.test.ts            # Comprehensive tests
├── API_DOCUMENTATION.md            # Complete API reference
└── README.md                        # This file
```

## 📊 Data Flow

```
User Request
    ↓
[Authentication & Authorization]
    ↓
[Data Aggregation Service]
    ├→ Spending Data (from procurement)
    ├→ Inventory Data (from inventory module)
    ├→ Procurement Data (from procurement module)
    └→ Finance Data (from finance module)
    ↓
[Data Validation & Pre-processing]
    ↓
[Prompt Builder - Creates Analysis Prompt]
    ↓
[Gemini AI Analysis]
    ├→ Generates Insights
    ├→ Detects Anomalies
    ├→ Forecasts Trends
    └→ Recommends Actions
    ↓
[Response Parsing & Validation]
    ↓
Response to User
```

## 🔐 Security Principles

### AI Never Accesses Database ✅
- AI receives only pre-aggregated data summaries
- No row-level data sent to external services
- All database queries filtered and validated

### Data Privacy ✅
- Automatic tenant isolation
- User role-based filtering
- Encrypted data transmission
- Audit logging

### Secure Integration ✅
- JWT authentication required
- Role-based access control
- Rate limiting enabled
- Input validation on all endpoints

## 📖 API Endpoints

### Main Analysis Endpoints

```
POST   /api/v1/insights/analyze                 # Full analysis
POST   /api/v1/insights/analyze/stream         # Real-time streaming
GET    /api/v1/insights/summary                # Quick summary
POST   /api/v1/insights/anomalies              # Detect anomalies
POST   /api/v1/insights/forecasts              # Generate forecasts
```

### Quick Analysis Endpoints

```
POST   /api/v1/insights/spending-analysis      # Spending
POST   /api/v1/insights/inventory-analysis     # Inventory
POST   /api/v1/insights/procurement-analysis   # Procurement
POST   /api/v1/insights/financial-analysis     # Finance
```

### Utility Endpoints

```
GET    /api/v1/insights/health                 # Service health
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## 🔍 Analysis Types

### Spending Analysis
- Cost patterns and trends
- Category distribution
- Supplier performance
- Budget utilization
- Cost optimization opportunities

### Inventory Analysis
- Stock level assessment
- Risk identification (low stock, overstock)
- SKU performance
- Inventory turnover
- Reorder optimization

### Procurement Analysis
- Supplier evaluation
- Order efficiency
- Delivery performance
- Cost structure
- Consolidation opportunities

### Financial Analysis
- Revenue and expenses
- Profit margins
- Cash flow
- Budget compliance
- Financial health

### Holistic Analysis
- Cross-functional insights
- Interconnected analysis
- Strategic opportunities
- Comprehensive recommendations

## 🎯 Insight Types

### Insights
Detailed analysis findings with confidence scores and supporting metrics

### Anomalies
Unusual patterns, potential issues, and risks detected in the data

### Forecasts
Trend predictions with confidence intervals for future planning

### Recommendations
Actionable suggestions with estimated business impact and implementation effort

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Gemini API key from Google Cloud
- Backend modules (procurement, inventory, finance) running

### Installation

```bash
# Install dependencies
npm install @google/generative-ai express zod

# Set environment variables
export GEMINI_API_KEY="your-api-key"
export GEMINI_MODEL="gemini-1.5-pro"
export GEMINI_TEMPERATURE="0.7"
```

### Integration

```typescript
// In your main app
import { registerAIInsightsModule } from '@features/ai-insights/index.js';

const app = express();

// ... other setup ...

registerAIInsightsModule(app);

app.listen(3000);
```

### Usage Example

```typescript
// Generate insights
const response = await fetch('http://localhost:3000/api/v1/insights/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    analysisType: 'spending',
    timeRange: {
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    includeForecasts: true,
    anomalySensitivity: 'high'
  })
});

const insights = await response.json();
console.log(insights.data.summary);
```

## 🧪 Testing

```bash
# Run all tests
npm run test -- ai-insights

# Run with coverage
npm run test -- --coverage ai-insights

# Watch mode
npm run test -- --watch ai-insights
```

Test coverage includes:
- Gemini service integration
- Data aggregation logic
- Prompt builder functionality
- Schema validation
- Insight generation workflow
- Error handling

## 🔧 Configuration

### Environment Variables

```env
# Gemini API Configuration
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-1.5-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=4000

# Optional: Analysis Settings
ANALYSIS_MAX_DATA_SIZE_KB=5000
ANALYSIS_TIMEOUT_MS=30000
```

### Service Configuration

```typescript
const geminiService = new GeminiService({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-pro',
  temperature: 0.7,
  maxOutputTokens: 4000
});
```

## 📊 Response Schema

Every API response follows this structure:

```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-31T10:30:00Z",
    "analysisType": "spending",
    "insights": [...],
    "anomalies": [...],
    "forecasts": [...],
    "recommendations": [...],
    "summary": {
      "keyFindings": [...],
      "overallHealthScore": 78,
      "areasOfConcern": [...],
      "opportunitiesForOptimization": [...]
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

## 🎓 Use Cases

### Executive Dashboard
```typescript
// Quick summary for dashboard widget
const summary = await GET '/insights/summary?type=holistic';
// Returns: { summary: "...", score: 82 }
```

### Risk Monitoring
```typescript
// Detect anomalies continuously
const anomalies = await POST '/insights/anomalies' {
  sensitivity: 'high'  // Flag even minor issues
};
```

### Strategic Planning
```typescript
// Generate forecasts for planning
const forecasts = await POST '/insights/forecasts';
// Helps with budget planning and resource allocation
```

### Operational Optimization
```typescript
// Get recommendations for improvements
const analysis = await POST '/insights/analyze' {
  analysisType: 'procurement'
};
// Includes cost reduction opportunities
```

## 🔍 Troubleshooting

### API Connection Issues
```bash
# Check health endpoint
curl http://localhost:3000/api/v1/insights/health

# Check Gemini API key
echo $GEMINI_API_KEY
```

### Data Aggregation Failures
- Ensure all business modules (procurement, inventory) are running
- Check data quality in source modules
- Verify tenant isolation is working

### Response Parsing Errors
- Check if Gemini model returns valid JSON
- Verify schema mappings in response handler
- Check AI response format against schema

### Performance Issues
- Reduce time range for analysis
- Use `/summary` for quick results
- Enable caching for frequent queries
- Consider streaming for large analyses

## 📈 Performance Optimization

### Data Aggregation
- Indexed queries on tenantId, status fields
- Efficient sorting/filtering at query level
- Batch operations where possible

### API Calls
- Gemini caches requests when possible
- Optimize prompt size without losing context
- Use streaming for better UX

### Caching
```typescript
// Consider caching frequent analyses
const cacheKey = `insights:${tenantId}:${analysisType}:${dateRange}`;
const cached = await cache.get(cacheKey);
if (cached) return cached;
```

## 🚨 Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "Gemini API temporarily unavailable",
    "statusCode": 503
  }
}
```

Common error codes:
- `INVALID_REQUEST` (400) - Bad parameters
- `UNAUTHORIZED` (401) - Missing token
- `FORBIDDEN` (403) - Insufficient permissions
- `AI_SERVICE_ERROR` (503) - Gemini API issue
- `DATA_AGGREGATION_FAILED` (500) - Data collection error

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for:
- Detailed endpoint descriptions
- Request/response examples
- Status codes and error handling
- Rate limiting information
- Authentication details

## 🔮 Future Enhancements

- [ ] Custom analysis templates
- [ ] Comparative analysis (YoY, MoM)
- [ ] Scheduled analysis reports
- [ ] Real-time alert system
- [ ] Multi-model analysis (GPT, Claude)
- [ ] PDF report generation
- [ ] Webhook integrations
- [ ] Advanced caching strategies
- [ ] Performance metrics dashboard
- [ ] A/B testing insights

## 🤝 Contributing

1. Follow existing code patterns
2. Write tests for new features
3. Update API documentation
4. Test with sample data
5. Submit pull request

## 📝 License

MIT

## 📞 Support

- **Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Tests**: [insights.test.ts](./tests/insights.test.ts)
- **Issues**: GitHub Issues
- **Contact**: ai-insights@example.com

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2024-01-31

## Changelog

### 1.0.0 (2024-01-31)
- Initial release
- Gemini API integration
- Data aggregation layer
- Comprehensive analysis endpoints
- Anomaly detection
- Trend forecasting
- Recommendation engine
- Full test coverage
- Complete documentation
