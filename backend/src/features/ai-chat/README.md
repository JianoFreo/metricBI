# AI Chat Assistant - MetricBI

## Overview

The AI Chat Assistant is a sophisticated conversational interface powered by Google's Gemini API that acts as a **senior business analyst** for your company. It provides intelligent responses about company performance, generates insights, identifies anomalies, and offers actionable recommendations.

## Key Features

- **Senior Business Analyst Role**: Responds like a C-suite advisor with deep business acumen
- **Structured Responses**: Every response includes insight, reasoning, recommendations, and follow-up questions
- **Session Management**: Maintains conversation context across multiple messages
- **Real-time Streaming**: Optional streaming responses for real-time UI updates
- **Data-Driven Analysis**: Leverages aggregated company data (never direct DB access for security)
- **Session Memory**: Tracks conversation history for context awareness
- **Multi-Tenant Support**: Complete tenant isolation for security
- **Role-Based Access**: Integrated with existing RBAC system

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User (Browser)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Chat Request
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js Chat Controller                      │
│  - Session validation                                       │
│  - User authentication check                                │
│  - Tenant isolation                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐  ┌─────────────┐  ┌──────────────┐
    │ Session │  │   Context   │  │    Message   │
    │ Memory  │  │   Builder   │  │ Validation   │
    └─────────┘  └─────────────┘  └──────────────┘
                         │
                    Aggregated Data
                    (Summaries Only)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Chat Assistant Service (Orchestrator)              │
│  - Builds prompts    - Calls Gemini API                     │
│  - Validates size    - Parses responses                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Gemini API (gemini-1.5-pro)            │
│  - Analyzes data     - Generates insights                   │
│  - Detects patterns  - Provides recommendations             │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/features/ai-chat/
├── schemas/
│   └── chat.schemas.ts           # Zod validation schemas (12 schemas)
├── services/
│   ├── chat-assistant.service.ts # Gemini integration & orchestration
│   ├── context-builder.service.ts # Data aggregation layer (security)
│   └── session-memory.service.ts  # Session & conversation history
├── controllers/
│   └── chat.controller.ts         # HTTP request handlers (8 handlers)
├── routes/
│   └── chat.routes.ts             # API endpoint definitions (10 routes)
├── __tests__/
│   └── chat.test.ts               # 40+ comprehensive test cases
├── index.ts                       # Module export & initialization
└── README.md                      # This file
```

## Response Structure

Every response from the assistant follows this structure:

```typescript
{
  id: "uuid",
  sessionId: "uuid",
  insight: {
    type: "performance" | "anomaly" | "trend" | "recommendation" | "comparison",
    summary: "Brief, specific insight",
    confidence: 0.85,  // 0-1 scale
    supportingData: [/* Optional data points */]
  },
  reasoning: {
    dataUsed: ["metric1", "metric2"],
    methodology: "How analysis was performed",
    assumptions: ["Key assumption"],
    confidence: 0.85
  },
  recommendations: [
    {
      action: "Specific action to take",
      priority: "high|medium|low",
      expectedImpact: "Business impact description",
      timeframe: "Implementation timeframe",
      risks: ["Potential risk"]
    }
  ],
  followUpQuestions: ["Suggested question 1", "Suggested question 2"],
  context: {
    dataDateRange: { start: Date, end: Date },
    metricsUsed: ["metric1", "metric2"]
  },
  timestamp: Date
}
```

## API Endpoints

### 1. Session Management

#### Create Session
```
POST /api/v1/chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Q4 Performance Analysis",
  "focusAreas": ["financial", "procurement"]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "title": "Q4 Performance Analysis",
    "createdAt": "2024-01-15T10:30:00Z",
    "messageCount": 0,
    "context": { "focusAreas": [...] }
  }
}
```

#### Get Sessions
```
GET /api/v1/chat/sessions
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    { "id": "uuid", "title": "...", "messageCount": 5, ... },
    { "id": "uuid", "title": "...", "messageCount": 2, ... }
  ]
}
```

#### Get Session Details
```
GET /api/v1/chat/sessions/:sessionId
Authorization: Bearer <token>

Response: 200 OK
{ "success": true, "data": { /* session details */ } }
```

### 2. Message Handling

#### Send Message (Non-streaming)
```
POST /api/v1/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-uuid",
  "message": "What is our current financial status?",
  "context": {
    "focusAreas": ["financial"],
    "timeRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "response-uuid",
    "sessionId": "session-uuid",
    "insight": { ... },
    "reasoning": { ... },
    "recommendations": [ ... ],
    "followUpQuestions": [ ... ],
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```

#### Send Message (Streaming)
```
POST /api/v1/chat/messages/stream
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-uuid",
  "message": "Analyze our procurement spending"
}

Response: 200 OK (Server-Sent Events)
data: {"content": "Analyzing","timestamp": "..."}
data: {"content": " your procurement data","timestamp": "..."}
...
data: {"complete": true}
```

#### Get Conversation History
```
GET /api/v1/chat/history/:sessionId?limit=50
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "msg-uuid",
      "role": "user",
      "content": "What is our revenue trend?",
      "timestamp": "..."
    },
    {
      "id": "msg-uuid",
      "role": "assistant",
      "content": "{...json response...}",
      "timestamp": "..."
    }
  ]
}
```

### 3. Analytics & Maintenance

#### Get Session Statistics
```
GET /api/v1/chat/stats/:sessionId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalMessages": 12,
    "userMessages": 6,
    "assistantMessages": 6,
    "totalTokens": 3450,
    "userTokens": 1200,
    "assistantTokens": 2250,
    "averageMessageLength": 145,
    "sessionDuration": 1234567
  }
}
```

#### Health Check
```
GET /api/v1/chat/health
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "status": "Gemini service is operational",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

## Session Memory

Sessions persist for **30 minutes** of inactivity. Features:

- **Automatic Expiry**: Sessions automatically expire and clean up
- **Message History**: Maintains full conversation history
- **Context Preservation**: Keeps focus areas and analysis context
- **Statistics**: Tracks token usage and message counts

## Security Model

### Data Protection

1. **No Direct DB Access**: AI never directly accesses the database
2. **Data Aggregation Layer**: Backend pre-processes all data into summaries
3. **Tenant Isolation**: Each request validates tenant ownership
4. **Message Sanitization**: All messages validated before processing

### Authentication & Authorization

- **JWT Required**: All endpoints require valid JWT token
- **Tenant Context**: Automatic tenant extraction from token
- **Session Ownership**: Users can only access their own sessions
- **Admin Only**: Session clearing requires admin role

## Integration with Main App

```typescript
// In src/app.ts or main server file
import { registerAIChatModule } from '@features/ai-chat/index.js';

// After other route registrations
const mainRouter = Router();
registerAIChatModule(mainRouter);

app.use('/api/v1', mainRouter);
```

## Environment Configuration

```bash
# Required
GEMINI_API_KEY=your-actual-api-key

# Optional
GEMINI_MODEL=gemini-1.5-pro  # Default
NODE_ENV=production

# Session settings (in code)
SESSION_TTL=1800000  # 30 minutes (configurable via service)
```

## Usage Examples

### React Component Example

```typescript
import { useChat } from '@hooks/useChat';

export function ChatAssistant() {
  const { session, messages, sendMessage, isLoading } = useChat();

  useEffect(() => {
    createSession({ title: 'Analysis Session' });
  }, []);

  const handleSubmit = async (message: string) => {
    await sendMessage({
      sessionId: session!.id,
      message,
      context: { focusAreas: ['financial'] }
    });
  };

  return (
    <div className="chat-container">
      {messages.map(msg => (
        <div key={msg.id} className={`message ${msg.role}`}>
          {msg.role === 'assistant' ? (
            <StructuredResponse response={JSON.parse(msg.content)} />
          ) : (
            <p>{msg.content}</p>
          )}
        </div>
      ))}
      <ChatInput onSubmit={handleSubmit} disabled={isLoading} />
    </div>
  );
}
```

### Backend Service Usage

```typescript
import { ChatAssistantService, ContextBuilderService } from '@features/ai-chat';

// Get context
const context = await ContextBuilderService.buildContext({
  tenantId: 'tenant-123',
  focusAreas: ['financial']
});

// Generate response
const response = await ChatAssistantService.generateResponse({
  sessionId: 'session-uuid',
  userMessage: 'What is our revenue trend?',
  contextData: context,
  companyName: 'Acme Corp'
});

console.log(response.insight.summary);
console.log(response.recommendations);
```

## Performance Optimization

### Caching

- **Context Cache**: 5-minute TTL on aggregated data
- **Session Memory**: In-memory storage with 30-minute expiry
- **Query Optimization**: Parallel data collection from multiple modules

### Token Optimization

- **Context Size Limits**: ~30,000 tokens max
- **Message Limit**: 50 recent messages in window
- **Streaming Option**: Use streaming for real-time updates

### Recommendations

1. **Batch Operations**: Group related analyses into single session
2. **Focus Areas**: Specify focus areas to reduce context size
3. **Time Ranges**: Use narrow date ranges for recent analysis
4. **Clear Old Sessions**: Manually delete completed sessions

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid/missing JWT | Refresh authentication token |
| `403 Forbidden` | User doesn't own session | Create new session or use correct ID |
| `404 Not Found` | Session expired | Create new session |
| `400 Bad Request` | Invalid message format | Check schema validation |
| `503 Service Unavailable` | Gemini API down | Try again after service recovery |

### Error Response Format

```json
{
  "success": false,
  "error": "Session not found",
  "code": "NOT_FOUND",
  "details": "Session expired after 30 minutes of inactivity"
}
```

## Testing

Run comprehensive test suite:

```bash
npm run test -- ai-chat

# Specific test category
npm run test -- ai-chat session-memory
npm run test -- ai-chat context-builder
npm run test -- ai-chat chat-assistant
```

### Test Coverage

- ✅ Schema validation (all 12 schemas)
- ✅ Session CRUD operations
- ✅ Message handling
- ✅ Context building
- ✅ Gemini integration
- ✅ Error scenarios
- ✅ End-to-end workflows
- ✅ Token counting

## Troubleshooting

### Session expires too quickly

**Problem**: Sessions are expiring before conversation is complete

**Solution**: 
- Sessions refresh on each activity
- Check `SESSION_TTL` in `session-memory.service.ts`
- Extend if needed (default: 30 minutes)

### Empty or generic responses

**Problem**: AI responses are not specific to company data

**Solution**:
- Verify Gemini API key is valid
- Check context data is being built correctly
- Review company metrics in context builder
- Check logs for data aggregation errors

### Streaming responses incomplete

**Problem**: SSE stream disconnects early

**Solution**:
- Check browser network tab for connection drops
- Verify Gemini streaming is enabled
- Check max token limit hasn't been hit
- Review server logs for timeout errors

### Memory/performance degradation

**Problem**: Application slows down after many sessions

**Solution**:
- Sessions auto-expire after 30 minutes
- Clear old sessions: `DELETE /api/v1/chat/sessions/:sessionId`
- Monitor active session count
- Consider increasing context cache TTL

## Future Enhancements

- [ ] Persistent session storage (database)
- [ ] Multi-turn follow-up optimization
- [ ] Real-time data streaming
- [ ] Custom analysis templates
- [ ] Advanced graph analysis
- [ ] Natural language SQL generation
- [ ] Export analysis reports
- [ ] Collaborative sessions

## Support

For issues or questions:
1. Check logs: `npm run logs`
2. Run health check: `GET /api/v1/chat/health`
3. Review test results: `npm run test -- ai-chat`
4. Check documentation: See `INTEGRATION_GUIDE.md`
