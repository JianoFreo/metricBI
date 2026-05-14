import { z } from 'zod';

/**
 * Chat Message Schema
 * Represents a single message in a conversation
 */
export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant']).describe('Message sender role'),
  content: z.string().min(1).max(5000).describe('Message content'),
  timestamp: z.date().describe('When message was sent'),
  metadata: z.object({
    tokenCount: z.number().optional(),
    interpretedIntent: z.string().optional(),
  }).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Structured Insight
 * Analysis result with reasoning
 */
export const InsightSchema = z.object({
  type: z.enum(['performance', 'anomaly', 'trend', 'recommendation', 'comparison']),
  summary: z.string().min(5).max(500),
  confidence: z.number().min(0).max(1),
  supportingData: z.array(z.any()).optional(),
});

export type Insight = z.infer<typeof InsightSchema>;

/**
 * Reasoning breakdown for response
 */
export const ReasoningSchema = z.object({
  dataUsed: z.array(z.string()).describe('Data sources used in analysis'),
  methodology: z.string().describe('How the analysis was performed'),
  assumptions: z.array(z.string()).optional().describe('Key assumptions made'),
  confidence: z.number().min(0).max(1).describe('Confidence level (0-1)'),
});

export type Reasoning = z.infer<typeof ReasoningSchema>;

/**
 * Actionable Recommendation
 */
export const RecommendationSchema = z.object({
  action: z.string().describe('Specific action to take'),
  priority: z.enum(['low', 'medium', 'high']).describe('Action priority'),
  expectedImpact: z.string().describe('Expected business impact'),
  timeframe: z.string().optional().describe('When to implement'),
  risks: z.array(z.string()).optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

/**
 * Structured Chat Response
 * Main response format from AI assistant
 */
export const ChatResponseSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  insight: InsightSchema.describe('Main analysis/insight'),
  reasoning: ReasoningSchema.describe('Why this conclusion was reached'),
  recommendations: z.array(RecommendationSchema).optional().describe('Actionable recommendations'),
  followUpQuestions: z.array(z.string()).optional().describe('Suggested follow-up questions'),
  context: z.object({
    dataDateRange: z.object({
      start: z.date(),
      end: z.date(),
    }).optional(),
    metricsUsed: z.array(z.string()).optional(),
  }).optional(),
  timestamp: z.date(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

/**
 * Chat Session for Memory Management
 */
export const ChatSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  tenantId: z.string(),
  title: z.string().optional(),
  messages: z.array(ChatMessageSchema).default([]),
  context: z.object({
    companyMetrics: z.any().optional(),
    recentAnalysis: z.any().optional(),
    focusAreas: z.array(z.string()).optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date().describe('Session expiration time'),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;

/**
 * Chat Request DTO
 */
export const ChatRequestSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(5000),
  context: z.object({
    focusAreas: z.array(z.string()).optional(),
    timeRange: z.object({
      start: z.date(),
      end: z.date(),
    }).optional(),
    includeForecasts: z.boolean().default(false),
  }).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * Context Data for AI Assistant
 * Aggregated company data used for chat context
 */
export const ChatContextDataSchema = z.object({
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
  metrics: z.object({
    revenue: z.number().optional(),
    expenses: z.number().optional(),
    profitMargin: z.number().optional(),
    growth: z.number().optional(),
    customMetrics: z.record(z.any()).optional(),
  }),
  topPerformers: z.array(z.object({
    name: z.string(),
    value: z.number(),
    trend: z.enum(['up', 'down', 'stable']),
  })).optional(),
  anomalies: z.array(z.object({
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    description: z.string(),
  })).optional(),
  departmentData: z.record(z.any()).optional(),
});

export type ChatContextData = z.infer<typeof ChatContextDataSchema>;

/**
 * System Prompt Context
 * Used internally for Gemini API
 */
export const SystemPromptContextSchema = z.object({
  companyName: z.string(),
  role: z.string().default('Senior Business Analyst'),
  expertise: z.array(z.string()).default(['financial analysis', 'business strategy', 'performance optimization']),
  analysisStyle: z.typeof('detailed' | 'concise' | 'balanced').default('balanced'),
  dataContext: ChatContextDataSchema,
  previousInsights: z.array(z.object({
    topic: z.string(),
    insight: z.string(),
  })).optional(),
});

export type SystemPromptContext = z.infer<typeof SystemPromptContextSchema>;

/**
 * Session Create Request
 */
export const CreateSessionRequestSchema = z.object({
  title: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

/**
 * Session Response DTO
 */
export const SessionResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  createdAt: z.date(),
  messageCount: z.number(),
  context: z.object({
    focusAreas: z.array(z.string()).optional(),
  }).optional(),
});

export type SessionResponse = z.infer<typeof SessionResponseSchema>;
