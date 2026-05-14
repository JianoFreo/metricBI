# AI Insights Engine - Integration Guide

## Quick Start Integration

### Step 1: Install Gemini SDK

```bash
cd backend
npm install @google/generative-ai

# Optionally build
npm run build
```

### Step 2: Add Environment Variables

In your `.env` file:

```env
# Gemini API Configuration
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-1.5-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=4000

# Analysis Configuration (optional)
ANALYSIS_MAX_DATA_SIZE_KB=5000
ANALYSIS_TIMEOUT_MS=30000

# Feature Flags (optional)
ENABLE_AI_INSIGHTS=true
```

### Step 3: Get Gemini API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable Gemini API
4. Create an API key
5. Copy the key and add to `.env`

### Step 4: Register Module in Main App

In your main application file (`app.ts` or `server.ts`):

```typescript
import { registerAIInsightsModule } from '@features/ai-insights/index.js';

const app = express();

// ... other middleware setup ...

// Register AI Insights Module
registerAIInsightsModule(app);

// Start server
app.listen(3000);
```

### Step 5: Verify Installation

```bash
# Check health endpoint
curl http://localhost:3000/api/v1/insights/health

# Expected Response:
{
  "success": true,
  "status": "healthy",
  "service": "Gemini AI"
}
```

## Test the Integration

### Test 1: Quick Summary

```bash
curl -X GET 'http://localhost:3000/api/v1/insights/summary?startDate=2024-01-01&endDate=2024-01-31' \
  -H "Authorization: Bearer your-jwt-token"
```

### Test 2: Spending Analysis

```bash
curl -X POST http://localhost:3000/api/v1/insights/spending-analysis \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

### Test 3: Stream Analysis

```bash
# Terminal 1: Start streaming
curl -X POST http://localhost:3000/api/v1/insights/analyze/stream \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "holistic",
    "timeRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "includeForecasts": true
  }' \
  --no-buffer
```

## Frontend Integration

### React Example

```typescript
// useInsights.ts
import { useState, useCallback } from 'react';

interface InsightRequest {
  analysisType: 'spending' | 'inventory' | 'procurement' | 'financial' | 'holistic';
  timeRange: {
    startDate: string;
    endDate: string;
  };
  includeForecasts?: boolean;
  anomalySensitivity?: 'low' | 'medium' | 'high';
}

export function useInsights(token: string) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  const generateInsights = useCallback(async (request: InsightRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/v1/insights/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) throw new Error('Failed to generate insights');
      const data = await response.json();
      setInsights(data.data);
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const streamInsights = useCallback(async (
    request: InsightRequest,
    onChunk: (chunk: string) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/v1/insights/analyze/stream', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json.content) onChunk(json.content);
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { insights, loading, error, generateInsights, streamInsights };
}

// Component Usage
function InsightPanel() {
  const token = useAuthToken();
  const { insights, loading, generateInsights } = useInsights(token);

  const handleAnalyze = async () => {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    await generateInsights({
      analysisType: 'holistic',
      timeRange: {
        startDate: monthAgo.toISOString(),
        endDate: now.toISOString()
      },
      includeForecasts: true
    });
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Business Data'}
      </button>
      
      {insights && (
        <div>
          <h2>Business Insights</h2>
          <p>Score: {insights.summary.overallHealthScore}</p>
          <p>{insights.summary.keyFindings[0]}</p>
        </div>
      )}
    </div>
  );
}
```

## Data Aggregation Customization

The data aggregation layer is extensible. To add custom data sources:

```typescript
// In data-aggregation.service.ts

static async aggregateData(options: DataAggregationOptions) {
  // ... existing code ...

  // Add custom data
  const customData = await aggregateCustomData(options);

  const aggregatedData: AggregatedData = {
    // ... existing data ...
    spending: {
      ...spending,
      // Add custom fields
      customAnalytics: customData
    }
  };

  return aggregatedData;
}

private static async aggregateCustomData(
  options: DataAggregationOptions
): Promise<any> {
  // Query your custom data sources
  const result = await YourDataSource.query({
    tenantId: options.tenantId,
    startDate: options.startDate,
    endDate: options.endDate
  });

  return result;
}
```

## Prompt Customization

To customize analysis prompts:

```typescript
// In prompt-builder.ts

static buildCustomPrompt(
  data: AggregatedData,
  customInstructions: string
): string {
  return `
${customInstructions}

Data:
${this.formatDataContext(data)}

Return JSON response with analysis findings.
`;
}
```

## Monitoring & Logging

The module includes comprehensive logging:

```bash
# View AI Insights logs
tail -f logs/ai-insights.log

# Filter for specific operations
grep "GeneratingInsights" logs/ai-insights.log
grep "ERROR" logs/ai-insights.log
```

Log levels follow this pattern:
```
[GeminiService] - API interactions
[DataAggregation] - Data collection
[InsightEngine] - Main orchestration
[InsightsController] - Request handling
```

## Performance Tuning

### Optimize Time Ranges
```typescript
// Good: Focused analysis
const request = {
  timeRange: {
    startDate: '2024-01-01',
    endDate: '2024-01-31'  // 1 month
  }
};

// Less optimal: Massive dataset
const request = {
  timeRange: {
    startDate: '2020-01-01',
    endDate: '2024-01-31'  // 4 years
  }
};
```

### Use Quick Endpoints
```typescript
// For dashboards, use quick endpoints:
GET /insights/summary  // <500ms

// Instead of:
POST /insights/analyze  // 3-5s
```

### Enable Caching
```typescript
const cacheKey = `insights:${tenantId}:${type}:${monthKey}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// After analysis
await redis.setex(cacheKey, 3600, JSON.stringify(insights));
```

## Troubleshooting

### Q: "GEMINI_API_KEY not set" error
**A**: Add to `.env` file:
```env
GEMINI_API_KEY=your-actual-key-here
```

### Q: "Unauthorized" errors
**A**: Ensure JWT token is valid and includes required claims (userId, tenantId, role)

### Q: Analysis is slow
**A**: 
- Reduce time range
- Use `/summary` endpoint
- Enable streaming with `/analyze/stream`
- Check data aggregation is optimized

### Q: Empty or incomplete results
**A**:
- Check data quality in source modules
- Verify data is being aggregated
- Check logs for warnings
- Try smaller time range

### Q: Rate limiting errors
**A**:
- Spread requests over time
- Use summary endpoint (higher limit)
- Implement exponential backoff

## Security Considerations

### API Key Safety
- ✅ Never commit `GEMINI_API_KEY` to git
- ✅ Use `.env` file (add to `.gitignore`)
- ✅ Rotate keys periodically
- ✅ Use different keys per environment

### Data Safety
- ✅ All data is pre-aggregated before sending to AI
- ✅ No raw database records exposed
- ✅ Tenant isolation enforced
- ✅ Audit logging enabled

### Network Security
- ✅ Use HTTPS only
- ✅ Validate all inputs
- ✅ Rate limit API calls
- ✅ Monitor for suspicious patterns

## Deployment

### Production Checklist
- [ ] GEMINI_API_KEY set in production environment
- [ ] Tests passing locally
- [ ] SSL/TLS configured
- [ ] Rate limiting configured
- [ ] Monitoring alerts set up
- [ ] Logging aggregation enabled
- [ ] Database indexes verified
- [ ] Performance tested with real data

### Docker Compose Example
```yaml
services:
  backend:
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GEMINI_MODEL=gemini-1.5-pro
      - NODE_ENV=production
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
```

## Next Steps

1. ✅ Integration complete
2. Test endpoints with your data
3. Integrate with frontend
4. Monitor performance
5. Collect user feedback
6. Plan enhancements

---

**Status**: Ready for Production Deployment  
**Support**: See README.md and API_DOCUMENTATION.md
