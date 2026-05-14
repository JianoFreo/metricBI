# AI Chat Assistant - Integration Guide

## Quick Start

### Step 1: Install Gemini SDK

```bash
cd backend
npm install @google/generative-ai
```

### Step 2: Set Environment Variables

Create or update `.env` file in backend root:

```bash
# Required
GEMINI_API_KEY=your-gemini-api-key-here

# Optional (defaults shown)
GEMINI_MODEL=gemini-1.5-pro
NODE_ENV=production
```

### Step 3: Register Module

In `src/app.ts` or your main server file:

```typescript
import { registerAIChatModule } from '@features/ai-chat/index.js';

// Initialize routes
const mainRouter = Router();

// ... other route registrations ...

// Register AI Chat Module
registerAIChatModule(mainRouter);

app.use('/api/v1', mainRouter);
```

### Step 4: Verify Installation

```bash
# Run health check
curl -X GET http://localhost:3000/api/v1/chat/health \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return:
# {"success": true, "status": "Gemini service is operational"}
```

---

## Detailed Setup

### Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create new API key (or use existing)
4. Copy key to `.env`:

```bash
GEMINI_API_KEY=AIzaSyD...your-key-here...
```

**Never commit `.env` to Git!** Add to `.gitignore`:

```
.env
.env.local
.env*.local
```

### Configure Session TTL

In `session-memory.service.ts`:

```typescript
private static readonly SESSION_TTL = 30 * 60 * 1000; // 30 minutes

// To change to 60 minutes:
private static readonly SESSION_TTL = 60 * 60 * 1000; // 60 minutes
```

### Configure Max Tokens

In `chat-assistant.service.ts`:

```typescript
// Adjust context size (default: 30,000 tokens)
const MAX_TOKENS = 30000;

// For more detailed analysis, increase to:
const MAX_TOKENS = 50000;

// For faster responses, decrease to:
const MAX_TOKENS = 15000;
```

---

## Frontend Integration

### React Hook Example

```typescript
// hooks/useChat.ts
import { useState, useCallback } from 'react';
import { useAuth } from '@hooks/useAuth';
import { 
  ChatSession, 
  ChatResponse, 
  ChatMessage 
} from '@features/ai-chat';

export function useChat() {
  const { token } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = '/api/v1/chat';

  const createSession = useCallback(
    async (title?: string, focusAreas?: string[]) => {
      try {
        const res = await fetch(`${baseUrl}/sessions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, focusAreas }),
        });

        if (!res.ok) throw new Error('Failed to create session');
        const data = await res.json();
        setSession(data.data);
        return data.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [token]
  );

  const sendMessage = useCallback(
    async (
      message: string,
      options?: { streaming?: boolean; focusAreas?: string[] }
    ) => {
      if (!session) {
        setError('No session created');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (options?.streaming) {
          // Streaming response
          const eventSource = new EventSource(
            `${baseUrl}/messages/stream?sessionId=${session.id}&message=${encodeURIComponent(message)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            } as any
          );

          let fullResponse = '';

          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.complete) {
              eventSource.close();
              setIsLoading(false);

              // Parse response
              const response = JSON.parse(fullResponse);
              addMessage({
                role: 'assistant',
                content: fullResponse,
              });
            } else {
              fullResponse += data.content;
            }
          };

          eventSource.onerror = () => {
            eventSource.close();
            setIsLoading(false);
            setError('Stream connection failed');
          };

          // Add user message immediately
          const userMsg = await addMessage({
            role: 'user',
            content: message,
          });
        } else {
          // Non-streaming response
          const res = await fetch(`${baseUrl}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: session.id,
              message,
              context: { focusAreas: options?.focusAreas },
            }),
          });

          if (!res.ok) throw new Error('Failed to send message');
          const data = await res.json();

          // Add messages to state
          addMessage({ role: 'user', content: message });
          addMessage({
            role: 'assistant',
            content: JSON.stringify(data.data),
          });

          setIsLoading(false);
          return data.data as ChatResponse;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    },
    [session, token]
  );

  const addMessage = useCallback(
    (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...msg,
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    },
    []
  );

  const clearSession = useCallback(async () => {
    if (!session) return;

    try {
      await fetch(`${baseUrl}/sessions/${session.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setSession(null);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [session, token]);

  return {
    session,
    messages,
    isLoading,
    error,
    createSession,
    sendMessage,
    clearSession,
  };
}
```

### Component Example

```typescript
// components/ChatAssistant.tsx
import { useEffect, useRef } from 'react';
import { useChat } from '@hooks/useChat';
import { ChatResponse } from '@features/ai-chat';
import styles from './ChatAssistant.module.css';

export function ChatAssistant() {
  const {
    session,
    messages,
    isLoading,
    error,
    createSession,
    sendMessage,
    clearSession,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Create session on mount
    createSession('Financial Analysis', ['financial']);
  }, [createSession]);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputRef.current?.value?.trim();
    if (!message) return;

    inputRef.current.value = '';
    await sendMessage(message, { streaming: true });
  };

  if (!session) {
    return <div>Creating session...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>AI Chat Assistant</h2>
        <span className={styles.sessionInfo}>
          {messages.length} messages • {session.title}
        </span>
      </div>

      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${styles[msg.role]}`}
          >
            {msg.role === 'user' ? (
              <p>{msg.content}</p>
            ) : (
              <StructuredResponse response={JSON.parse(msg.content)} />
            )}
          </div>
        ))}
        {isLoading && <div className={styles.loading}>Analyzing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask about your business..."
          disabled={isLoading}
          className={styles.input}
        />
        <button type="submit" disabled={isLoading} className={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
}

function StructuredResponse({ response }: { response: ChatResponse }) {
  return (
    <div className={styles.response}>
      <div className={styles.insight}>
        <h4>📊 Insight</h4>
        <p>{response.insight.summary}</p>
        <span className={styles.confidence}>
          Confidence: {(response.insight.confidence * 100).toFixed(0)}%
        </span>
      </div>

      <div className={styles.reasoning}>
        <h4>💡 Reasoning</h4>
        <p>{response.reasoning.methodology}</p>
        {response.reasoning.assumptions && (
          <div>
            <strong>Assumptions:</strong>
            <ul>
              {response.reasoning.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {response.recommendations && response.recommendations.length > 0 && (
        <div className={styles.recommendations}>
          <h4>🎯 Recommendations</h4>
          {response.recommendations.map((rec, i) => (
            <div key={i} className={styles.recommendation}>
              <div className={styles.recHeader}>
                <strong>{rec.action}</strong>
                <span className={`${styles.priority} ${styles[rec.priority]}`}>
                  {rec.priority}
                </span>
              </div>
              <p>{rec.expectedImpact}</p>
              {rec.timeframe && <p className={styles.timeframe}>⏱️ {rec.timeframe}</p>}
            </div>
          ))}
        </div>
      )}

      {response.followUpQuestions && (
        <div className={styles.followUp}>
          <h4>❓ Follow-up Questions</h4>
          <ul>
            {response.followUpQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Styling Example

```css
/* ChatAssistant.module.css */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.sessionInfo {
  font-size: 0.875rem;
  color: #666;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  max-width: 80%;
  padding: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message.user {
  align-self: flex-end;
  background: #007bff;
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background: white;
}

.insight {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.confidence {
  font-size: 0.875rem;
  color: #666;
  display: block;
  margin-top: 0.5rem;
}

.recommendations {
  margin-top: 1rem;
}

.recommendation {
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: #f9f9f9;
  border-left: 3px solid #007bff;
}

.priority {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.priority.high {
  background: #red;
  color: white;
}

.priority.medium {
  background: #ffc107;
}

.priority.low {
  background: #28a745;
  color: white;
}

.form {
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.button:hover:not(:disabled) {
  background: #0056b3;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  color: #666;
  font-style: italic;
}
```

---

## Testing

### Run Test Suite

```bash
npm run test -- ai-chat

# Watch mode
npm run test -- ai-chat --watch

# Specific test file
npm run test -- chat.test.ts

# Coverage
npm run test -- ai-chat --coverage
```

### Manual Testing

#### 1. Create Session
```bash
curl -X POST http://localhost:3000/api/v1/chat/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Session",
    "focusAreas": ["financial"]
  }' | jq .
```

#### 2. Send Message
```bash
curl -X POST http://localhost:3000/api/v1/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "message": "What is our revenue?",
    "context": {
      "focusAreas": ["financial"]
    }
  }' | jq .
```

#### 3. Check Health
```bash
curl http://localhost:3000/api/v1/chat/health \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

---

## Database Integration (Optional)

For persistent session storage, update `SessionMemoryService`:

```typescript
// In session-memory.service.ts
import { SessionModel } from '@models/Session';

static async createSession(options) {
  // ... existing memory storage ...
  
  // Also persist to database
  const dbSession = await SessionModel.create({
    userId: options.userId,
    tenantId: options.tenantId,
    title: options.title,
    // ... other fields
  });
  
  return dbSession;
}

static async getSession(sessionId) {
  // Check memory first
  const memory = this.sessions.get(sessionId);
  if (memory) return memory;
  
  // Fall back to database
  return await SessionModel.findById(sessionId);
}
```

---

## Performance Tuning

### Query Optimization

In `context-builder.service.ts`, optimize data aggregation:

```typescript
// Use projections to limit fields
const procurementData = await Procurement
  .find({ tenantId })
  .select('spending category vendor -_id')
  .lean()
  .limit(100);
```

### Caching Strategy

```typescript
// Increase cache TTL for stable data
private static readonly CACHE_TTL = 15 * 60 * 1000; // 15 mins

// Implement Redis for distributed caching
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

static async buildContext(options) {
  const cacheKey = `chat:context:${options.tenantId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  // Build context...
  await redis.setex(cacheKey, 900, JSON.stringify(contextData));
  
  return contextData;
}
```

### Token Optimization

```typescript
// Reduce unnecessary metrics in context
const criticalMetrics = {
  revenue: true,
  expenses: true,
  profitMargin: true,
  // Skip less important metrics
};
```

---

## Monitoring & Logging

### Enable Detailed Logging

```bash
# Development mode with debug logs
DEBUG=* npm run dev

# Production logging
NODE_ENV=production npm start > logs/app.log 2>&1
```

### Key Metrics to Monitor

1. **Session Creation Rate**: `sessions_created_total`
2. **Message Processing Time**: `message_processing_seconds`
3. **Gemini API Latency**: `gemini_api_latency_seconds`
4. **Token Usage**: `tokens_used_total`
5. **Error Rate**: `errors_total`

### Example Prometheus Metrics

```typescript
import prom from 'prom-client';

const sessionCounter = new prom.Counter({
  name: 'chat_sessions_created_total',
  help: 'Total sessions created',
  labelNames: ['tenant'],
});

const messageHistogram = new prom.Histogram({
  name: 'chat_message_processing_seconds',
  help: 'Message processing time',
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Usage
messageHistogram.observe(processingTime);
sessionCounter.labels(tenantId).inc();
```

---

## Troubleshooting

### Issue: "Gemini API key not set"

**Solution**: Verify `.env` file contains:
```bash
GEMINI_API_KEY=your-actual-key
```

Restart server after updating `.env`.

### Issue: Sessions expire too quickly

**Solution**: Check `SESSION_TTL` in `session-memory.service.ts`:
```typescript
// Default 30 minutes - increase if needed
private static readonly SESSION_TTL = 60 * 60 * 1000; // 60 minutes
```

### Issue: Token limit exceeded

**Solution**: Reduce context size in `context-builder.service.ts`:
```typescript
// Fetch only recent data
.limit(50) // Reduce from 100

// Or adjust in send-message
context: {
  timeRange: {
    start: thirtyDaysAgo,
    end: today
  }
}
```

### Issue: Slow responses

**Solution**:
1. Check Gemini API health
2. Monitor network latency
3. Reduce context data size
4. Clear context cache: `ContextBuilderService.clearContextCache()`
5. Check database query performance

---

## Production Deployment

### Docker Example

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    environment:
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      NODE_ENV: production
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
```

### Environment Variables

```bash
# .env.production
GEMINI_API_KEY=prod-key-here
GEMINI_MODEL=gemini-1.5-pro
NODE_ENV=production
SESSION_TTL=1800000
MAX_TOKENS=30000
LOG_LEVEL=info
```

---

## Support & Resources

- **Documentation**: See README.md and API_DOCUMENTATION.md
- **Tests**: Run `npm run test -- ai-chat`
- **Health Check**: `GET /api/v1/chat/health`
- **Logs**: Check `logs/app.log` or server console
