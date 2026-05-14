# AI Chat Assistant - API Documentation

## Base URL

```
https://api.metricbi.com/api/v1/chat
```

All requests require:
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json`
- `X-Tenant-ID: <TENANT_ID>` (optional, extracted from JWT)

## Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "data": { /* Response payload */ },
  "error": "Error message (if success = false)",
  "code": "ERROR_CODE"
}
```

---

## Endpoints

### Session Management

#### 1. Create Session
Creates a new chat session with optional context.

```
POST /sessions
```

**Request Body**

```json
{
  "title": "Q4 Financial Analysis",
  "focusAreas": ["financial", "performance"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Display name for session |
| `focusAreas` | string[] | No | Areas to focus analysis on |

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Q4 Financial Analysis",
    "createdAt": "2024-01-15T10:30:00Z",
    "messageCount": 0,
    "context": {
      "focusAreas": ["financial", "performance"]
    }
  }
}
```

**cURL Example**

```bash
curl -X POST https://api.metricbi.com/api/v1/chat/sessions \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q4 Financial Analysis",
    "focusAreas": ["financial"]
  }'
```

---

#### 2. Get Sessions
List all sessions for the authenticated user.

```
GET /sessions
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Items per page |

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Q4 Financial Analysis",
      "createdAt": "2024-01-15T10:30:00Z",
      "messageCount": 8,
      "context": { "focusAreas": ["financial"] }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Procurement Review",
      "createdAt": "2024-01-14T14:15:00Z",
      "messageCount": 3,
      "context": { "focusAreas": ["procurement"] }
    }
  ]
}
```

**cURL Example**

```bash
curl -X GET https://api.metricbi.com/api/v1/chat/sessions \
  -H "Authorization: Bearer eyJhbGc..."
```

---

#### 3. Get Session Details
Retrieve specific session information.

```
GET /sessions/:sessionId
```

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `sessionId` | uuid | Session ID to retrieve |

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Q4 Financial Analysis",
    "createdAt": "2024-01-15T10:30:00Z",
    "messageCount": 8,
    "context": { "focusAreas": ["financial"] }
  }
}
```

---

#### 4. Delete Session
Delete a session and its message history.

```
DELETE /sessions/:sessionId
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Session deleted"
}
```

---

### Message Handling

#### 5. Send Message (Synchronous)
Send a message and get immediate structured response.

```
POST /messages
```

**Request Body**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "What is our revenue trend compared to last quarter?",
  "context": {
    "focusAreas": ["financial"],
    "timeRange": {
      "start": "2024-10-01T00:00:00Z",
      "end": "2024-12-31T23:59:59Z"
    },
    "includeForecasts": true
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | uuid | Yes | Target session ID |
| `message` | string | Yes | User's question/message (1-5000 chars) |
| `context` | object | No | Analysis context |
| `context.focusAreas` | string[] | No | Limit analysis to specific areas |
| `context.timeRange` | object | No | Date range for analysis |
| `context.includeForecasts` | boolean | No | Include trend forecasts |

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "insight": {
      "type": "trend",
      "summary": "Revenue increased 12.5% Q3 to Q4, driven primarily by product line A growth of 18%",
      "confidence": 0.92,
      "supportingData": [
        {
          "metric": "Q3 Revenue",
          "value": "$1.1M",
          "trend": "baseline"
        },
        {
          "metric": "Q4 Revenue",
          "value": "$1.24M",
          "trend": "up"
        }
      ]
    },
    "reasoning": {
      "dataUsed": ["quarterly_revenue", "product_line_performance", "historical_trends"],
      "methodology": "Year-over-year and quarter-over-quarter comparison with anomaly detection",
      "assumptions": [
        "Data quality is consistent across all periods",
        "No major accounting changes between periods"
      ],
      "confidence": 0.92
    },
    "recommendations": [
      {
        "action": "Invest additional marketing budget in Product Line A",
        "priority": "high",
        "expectedImpact": "Potential 5-8% additional revenue growth",
        "timeframe": "Q1 2024",
        "risks": ["Market saturation", "Increased competition"]
      },
      {
        "action": "Review Product Line B performance",
        "priority": "medium",
        "expectedImpact": "Identify growth opportunities or discontinue underperforming products",
        "timeframe": "Within 30 days"
      }
    ],
    "followUpQuestions": [
      "What factors contributed to the 18% growth in Product A?",
      "How do our margins compare between product lines?",
      "Should we adjust pricing strategy for Q1?"
    ],
    "context": {
      "dataDateRange": {
        "start": "2024-10-01T00:00:00Z",
        "end": "2024-12-31T23:59:59Z"
      },
      "metricsUsed": ["revenue", "expenses", "profitMargin", "growth", "customMetrics"]
    },
    "timestamp": "2024-01-15T10:35:45Z"
  }
}
```

**cURL Example**

```bash
curl -X POST https://api.metricbi.com/api/v1/chat/messages \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "What is our revenue trend?",
    "context": {
      "focusAreas": ["financial"],
      "includeForecasts": true
    }
  }'
```

---

#### 6. Send Message (Streaming)
Send a message and receive streaming response via Server-Sent Events.

```
POST /messages/stream
```

**Request Body** (Same as synchronous)

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Analyze our procurement spending patterns"
}
```

**Response (200 OK - Server-Sent Events)**

```
data: {"content":"Analyzing","timestamp":"2024-01-15T10:35:45Z"}
data: {"content":" your procurement","timestamp":"2024-01-15T10:35:46Z"}
data: {"content":" data...","timestamp":"2024-01-15T10:35:47Z"}
...
data: {"complete":true}
```

**JavaScript Example**

```javascript
const eventSource = new EventSource('/api/v1/chat/messages/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.complete) {
    eventSource.close();
  } else {
    console.log('Chunk:', data.content);
    // Append to textarea or chat display
  }
};

eventSource.onerror = () => {
  eventSource.close();
};
```

---

#### 7. Get Message History
Retrieve conversation history for a session.

```
GET /history/:sessionId
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Max messages to retrieve |
| `offset` | number | 0 | Pagination offset |

**Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "role": "user",
      "content": "What is our revenue trend?",
      "timestamp": "2024-01-15T10:30:00Z",
      "metadata": { "tokenCount": 8 }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "role": "assistant",
      "content": "{\"insight\":{...},\"reasoning\":{...}}",
      "timestamp": "2024-01-15T10:30:45Z",
      "metadata": { "tokenCount": 2450 }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "role": "user",
      "content": "Break down by product line?",
      "timestamp": "2024-01-15T10:32:00Z"
    }
  ]
}
```

---

### Analytics

#### 8. Get Session Statistics
Retrieve statistics for a conversation session.

```
GET /stats/:sessionId
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "totalMessages": 12,
    "userMessages": 6,
    "assistantMessages": 6,
    "totalTokens": 8450,
    "userTokens": 2100,
    "assistantTokens": 6350,
    "averageMessageLength": 215,
    "sessionDuration": 1567000
  }
}
```

| Field | Description |
|-------|-------------|
| `totalMessages` | Total messages in session |
| `userMessages` | Number of user messages |
| `assistantMessages` | Number of assistant responses |
| `totalTokens` | Total API tokens used |
| `userTokens` | Tokens used for user messages |
| `assistantTokens` | Tokens used for AI responses |
| `averageMessageLength` | Average message character length |
| `sessionDuration` | Session duration in milliseconds |

---

### System

#### 9. Health Check
Verify chat service and Gemini API availability.

```
GET /health
```

**Response (200 OK)**

```json
{
  "success": true,
  "status": "Gemini service is operational",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

**Response (503 Service Unavailable)**

```json
{
  "success": false,
  "status": "Gemini API connection failed",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

---

#### 10. Clear User Sessions (Admin)
Clear all active sessions for a specific user (admin only).

```
POST /clear-user-sessions
```

**Request Body**

```json
{
  "targetUserId": "user-uuid"
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "message": "Cleared 5 sessions",
  "data": { "count": 5 }
}
```

---

## Response Types

### Insight Object

```typescript
{
  type: "performance" | "anomaly" | "trend" | "recommendation" | "comparison",
  summary: string,           // 5-500 chars
  confidence: number,        // 0-1 scale
  supportingData?: any[]
}
```

### Reasoning Object

```typescript
{
  dataUsed: string[],        // Metrics/data sources used
  methodology: string,       // How analysis was performed
  assumptions?: string[],    // Key assumptions
  confidence: number         // 0-1 scale
}
```

### Recommendation Object

```typescript
{
  action: string,            // Specific action
  priority: "low" | "medium" | "high",
  expectedImpact: string,    // Business impact
  timeframe?: string,        // Implementation timeframe
  risks?: string[]           // Potential risks
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Invalid/missing JWT token |
| `FORBIDDEN` | 403 | User doesn't own resource or insufficient permissions |
| `NOT_FOUND` | 404 | Session or resource not found |
| `BAD_REQUEST` | 400 | Invalid request format or missing required fields |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `SERVICE_UNAVAILABLE` | 503 | Gemini API or dependency unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per user
- **Priority**: Admin users get 2x rate limit
- **Headers**: Check `X-RateLimit-*` response headers

Response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1705330645
```

---

## Best Practices

### 1. Session Management
```javascript
// Create session once per analysis
const session = await createSession({ 
  focusAreas: ['financial'] 
});

// Reuse session for follow-up questions
await sendMessage(session.id, "Break down by department?");
await sendMessage(session.id, "Compare to last year?");

// Delete when done
await deleteSession(session.id);
```

### 2. Error Handling
```javascript
try {
  const response = await sendMessage(sessionId, message);
  
  if (response.success) {
    displayInsight(response.data.insight);
    showRecommendations(response.data.recommendations);
  } else {
    showError(response.error);
  }
} catch (error) {
  if (error.status === 404) {
    // Session expired, create new one
    createNewSession();
  } else {
    showConnectionError(error);
  }
}
```

### 3. Streaming Responses
```javascript
// Use streaming for better UX with large responses
const eventSource = new EventSource(
  `/api/v1/chat/messages/stream?sessionId=${id}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

let buffer = '';
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  buffer += data.content;
  updateDisplay(buffer);
};
```

### 4. Optimize Token Usage
```javascript
// Specify focus areas
const response = await sendMessage(sessionId, message, {
  focusAreas: ['procurement']  // Narrows analysis
});

// Use specific date ranges
const response = await sendMessage(sessionId, message, {
  timeRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  }
});
```

---

## Examples

### Complete Flow Example

```bash
# 1. Create session
curl -X POST https://api.metricbi.com/api/v1/chat/sessions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Q4 Review", "focusAreas": ["financial"]}' \
  > session.json

SESSION_ID=$(jq -r '.data.id' session.json)

# 2. Send message
curl -X POST https://api.metricbi.com/api/v1/chat/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$SESSION_ID'",
    "message": "What is our Q4 financial performance?",
    "context": {"focusAreas": ["financial"]}
  }' \
  > response.json

# 3. Get history
curl -X GET https://api.metricbi.com/api/v1/chat/history/$SESSION_ID \
  -H "Authorization: Bearer TOKEN"

# 4. Get stats
curl -X GET https://api.metricbi.com/api/v1/chat/stats/$SESSION_ID \
  -H "Authorization: Bearer TOKEN"

# 5. Delete session
curl -X DELETE https://api.metricbi.com/api/v1/chat/sessions/$SESSION_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Support

For API issues:
1. Check health endpoint: `GET /health`
2. Verify authentication token
3. Ensure session hasn't expired (30 min TTL)
4. Check response schema matches documentation
5. Review server logs for detailed errors
