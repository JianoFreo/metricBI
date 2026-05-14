import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { logger } from '@common/utils/logger.js';
import {
  ChatResponse,
  ChatResponseSchema,
  SystemPromptContext,
  ChatContextData,
  RecommendationSchema,
  InsightSchema,
  ReasoningSchema,
} from '../schemas/chat.schemas.js';
import { SessionMemoryService } from './session-memory.service.js';

/**
 * Chat Assistant Service
 * Manages AI-powered conversation with structured responses
 * Uses Gemini API for business analysis
 */
export class ChatAssistantService {
  private static geminiClient: GoogleGenerativeAI;
  private static model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

  /**
   * Initialize Gemini service
   */
  static initializeGeminiService(apiKey: string): void {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    try {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
      logger.info('Initialized Gemini for chat assistant');
    } catch (error) {
      logger.error('Failed to initialize Gemini', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate structured response to user query
   */
  static async generateResponse(options: {
    sessionId: string;
    userMessage: string;
    contextData: ChatContextData;
    companyName: string;
    systemContext?: SystemPromptContext;
  }): Promise<ChatResponse> {
    try {
      if (!this.geminiClient) {
        throw new Error('Gemini service not initialized');
      }

      // Build conversation history from session
      const sessionContext = SessionMemoryService.buildSessionContext(options.sessionId);
      const conversationHistory = sessionContext?.recentMessages || [];

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt({
        companyName: options.companyName,
        contextData: options.contextData,
        conversationHistory,
      });

      // Build full prompt with instruction
      const fullPrompt = this.buildFullPrompt({
        systemPrompt,
        userMessage: options.userMessage,
        contextData: options.contextData,
      });

      logger.info('Generating chat response', {
        sessionId: options.sessionId,
        messageLength: options.userMessage.length,
      });

      // Call Gemini API
      const model = this.geminiClient.getGenerativeModel({ model: this.model });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      if (!result.response.text()) {
        throw new Error('Empty response from Gemini');
      }

      // Parse response
      const parsedResponse = this.parseStructuredResponse(result.response.text());

      // Build final response
      const chatResponse: ChatResponse = {
        id: uuidv4(),
        sessionId: options.sessionId,
        insight: parsedResponse.insight,
        reasoning: parsedResponse.reasoning,
        recommendations: parsedResponse.recommendations,
        followUpQuestions: parsedResponse.followUpQuestions,
        context: {
          dataDateRange: options.contextData.period,
          metricsUsed: Object.keys(options.contextData.metrics),
        },
        timestamp: new Date(),
      };

      // Validate response against schema
      const validatedResponse = ChatResponseSchema.parse(chatResponse);

      logger.info('Generated structured response', {
        sessionId: options.sessionId,
        recommendationCount: validatedResponse.recommendations?.length || 0,
      });

      return validatedResponse;
    } catch (error) {
      logger.error('Failed to generate response', {
        sessionId: options.sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Stream response to user (for real-time updates)
   */
  static async *streamResponse(options: {
    sessionId: string;
    userMessage: string;
    contextData: ChatContextData;
    companyName: string;
  }) {
    try {
      if (!this.geminiClient) {
        throw new Error('Gemini service not initialized');
      }

      const sessionContext = SessionMemoryService.buildSessionContext(options.sessionId);
      const conversationHistory = sessionContext?.recentMessages || [];

      const systemPrompt = this.buildSystemPrompt({
        companyName: options.companyName,
        contextData: options.contextData,
        conversationHistory,
      });

      const fullPrompt = this.buildFullPrompt({
        systemPrompt,
        userMessage: options.userMessage,
        contextData: options.contextData,
      });

      logger.info('Streaming chat response', { sessionId: options.sessionId });

      const model = this.geminiClient.getGenerativeModel({ model: this.model });
      const stream = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      for await (const chunk of stream.stream) {
        if (chunk.candidates && chunk.candidates[0]?.content?.parts[0]?.text) {
          yield {
            chunk: chunk.candidates[0].content.parts[0].text,
            timestamp: new Date(),
          };
        }
      }

      logger.info('Completed streaming response', { sessionId: options.sessionId });
    } catch (error) {
      logger.error('Failed to stream response', {
        sessionId: options.sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Analyze and validate token usage
   */
  static async validateDataSize(data: ChatContextData): Promise<{
    estimatedTokens: number;
    withinLimit: boolean;
  }> {
    try {
      // Estimate tokens (rough estimate: ~4 chars per token)
      const dataString = JSON.stringify(data);
      const estimatedTokens = Math.ceil(dataString.length / 4);

      const MAX_TOKENS = 30000; // Leave buffer for response
      const withinLimit = estimatedTokens < MAX_TOKENS;

      logger.info('Validated data size', {
        estimatedTokens,
        withinLimit,
        dataSize: dataString.length,
      });

      return { estimatedTokens, withinLimit };
    } catch (error) {
      logger.error('Failed to validate data size', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Health check for Gemini service
   */
  static async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      if (!this.geminiClient) {
        return {
          healthy: false,
          message: 'Gemini client not initialized',
        };
      }

      // Try a simple request
      const model = this.geminiClient.getGenerativeModel({ model: this.model });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      });

      if (result.response.text()) {
        logger.info('Gemini health check passed');
        return {
          healthy: true,
          message: 'Gemini service is operational',
        };
      }

      return {
        healthy: false,
        message: 'Empty response from Gemini',
      };
    } catch (error) {
      logger.error('Gemini health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build system prompt with company context
   */
  private static buildSystemPrompt(options: {
    companyName: string;
    contextData: ChatContextData;
    conversationHistory: any[];
  }): string {
    const { companyName, contextData } = options;

    return `You are a Senior Business Analyst for ${companyName}.

Your role is to:
1. Analyze business data and provide actionable insights
2. Identify trends, anomalies, and opportunities
3. Give structured, professional recommendations
4. Back up claims with data from the provided context

Current Context:
- Company: ${companyName}
- Period: ${contextData.period.start.toLocaleDateString()} to ${contextData.period.end.toLocaleDateString()}
- Revenue: $${contextData.metrics.revenue?.toLocaleString() || 'N/A'}
- Profit Margin: ${contextData.metrics.profitMargin?.toFixed(2) || 'N/A'}%
- Growth Rate: ${contextData.metrics.growth?.toFixed(2) || 'N/A'}%

Key Metrics:
${this.formatContextMetrics(contextData)}

Anomalies Detected:
${this.formatAnomalies(contextData.anomalies || [])}

Guidelines:
- Always provide specific, data-backed insights
- Structure your response with clear insight, reasoning, and recommendations
- Use business terminology and professional tone
- Reference specific metrics when making claims
- Suggest actionable next steps
- Think like a C-suite advisor`;
  }

  /**
   * Build full prompt with user message
   */
  private static buildFullPrompt(options: {
    systemPrompt: string;
    userMessage: string;
    contextData: ChatContextData;
  }): string {
    const { systemPrompt, userMessage, contextData } = options;

    return `${systemPrompt}

User's Question: ${userMessage}

IMPORTANT INSTRUCTIONS:
Your response MUST be valid JSON with this exact structure:
{
  "insight": {
    "type": "performance|anomaly|trend|recommendation|comparison",
    "summary": "Brief, specific insight",
    "confidence": 0.85,
    "supportingData": [{"metric": "name", "value": "data", "unit": "%"}]
  },
  "reasoning": {
    "dataUsed": ["metric1", "metric2"],
    "methodology": "How you analyzed the data",
    "assumptions": ["assumption1", "assumption2"],
    "confidence": 0.85
  },
  "recommendations": [
    {
      "action": "Specific action to take",
      "priority": "high|medium|low",
      "expectedImpact": "Business impact description",
      "timeframe": "Implementation timeframe",
      "risks": ["potential risk"]
    }
  ],
  "followUpQuestions": [
    "Question 1?",
    "Question 2?"
  ]
}

Respond with ONLY the JSON, no additional text.`;
  }

  /**
   * Format context metrics for prompt
   */
  private static formatContextMetrics(contextData: ChatContextData): string {
    const metrics = [];

    if (contextData.metrics.revenue)
      metrics.push(`• Revenue: $${contextData.metrics.revenue.toLocaleString()}`);
    if (contextData.metrics.expenses)
      metrics.push(`• Expenses: $${contextData.metrics.expenses.toLocaleString()}`);
    if (contextData.metrics.profitMargin)
      metrics.push(`• Profit Margin: ${contextData.metrics.profitMargin.toFixed(2)}%`);
    if (contextData.metrics.growth) metrics.push(`• Growth: ${contextData.metrics.growth.toFixed(2)}%`);

    // Custom metrics
    if (contextData.metrics.customMetrics) {
      Object.entries(contextData.metrics.customMetrics).forEach(([key, value]) => {
        metrics.push(`• ${key}: ${value}`);
      });
    }

    return metrics.join('\n');
  }

  /**
   * Format anomalies for prompt
   */
  private static formatAnomalies(anomalies: any[]): string {
    if (anomalies.length === 0) return '• No significant anomalies detected';

    return anomalies.map((a) => `• [${a.severity.toUpperCase()}] ${a.type}: ${a.description}`).join('\n');
  }

  /**
   * Parse structured response from Gemini
   */
  private static parseStructuredResponse(responseText: string): {
    insight: any;
    reasoning: any;
    recommendations: any[];
    followUpQuestions: string[];
  } {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('No JSON found in response, building fallback');
        return this.buildFallbackResponse();
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate and build response
      return {
        insight: parsed.insight || { type: 'analysis', summary: 'Analysis complete', confidence: 0.8 },
        reasoning: parsed.reasoning || {
          dataUsed: [],
          methodology: 'Standard analysis',
          confidence: 0.8,
        },
        recommendations: (parsed.recommendations || []).slice(0, 5), // Limit to 5
        followUpQuestions: (parsed.followUpQuestions || []).slice(0, 3), // Limit to 3
      };
    } catch (error) {
      logger.warn('Failed to parse structured response', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return this.buildFallbackResponse();
    }
  }

  /**
   * Build fallback response when parsing fails
   */
  private static buildFallbackResponse() {
    return {
      insight: {
        type: 'analysis' as const,
        summary: 'Analysis completed. Please review the reasoning and recommendations.',
        confidence: 0.6,
      },
      reasoning: {
        dataUsed: ['company_data'],
        methodology: 'Automated business analysis',
        confidence: 0.6,
      },
      recommendations: [
        {
          action: 'Review the analysis results',
          priority: 'medium' as const,
          expectedImpact: 'Better business insights',
        },
      ],
      followUpQuestions: ['Would you like more details?', 'Can I analyze another aspect?'],
    };
  }
}
