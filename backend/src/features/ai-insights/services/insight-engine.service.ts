import logger from "@common/logger";
import GeminiService from "./gemini.service.js";
import DataAggregationService from "./data-aggregation.service.js";
import {
  AIInsightResponse,
  AIInsightResponseSchema,
  InsightRequest,
} from "../schemas/insights.schemas.js";
import PromptBuilder from "../utils/prompt-builder.js";

interface AnalysisOptions {
  tenantId: string;
  request: InsightRequest;
  userId: string;
}

/**
 * Insight Engine Service
 * Orchestrates the entire AI insights generation process:
 * 1. Aggregate data from backend
 * 2. Build analysis prompts
 * 3. Send to Gemini AI
 * 4. Parse and validate responses
 */
export class InsightEngineService {
  private geminiService: GeminiService;

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }

  /**
   * Generate AI insights from company data
   * Main entry point - handles the complete analysis workflow
   */
  async generateInsights(options: AnalysisOptions): Promise<AIInsightResponse> {
    const analysisStartTime = Date.now();

    logger.info("[InsightEngine] Starting insight generation", {
      tenantId: options.tenantId,
      analysisType: options.request.analysisType,
      userId: options.userId,
    });

    try {
      // Step 1: Aggregate data from backend
      const dataAggregation = await this.aggregateBusinessData(options);
      logger.info("[InsightEngine] Data aggregated successfully", {
        tenantId: options.tenantId,
        dataQuality: dataAggregation.metadata.dataQuality,
      });

      // Step 2: Validate data quality
      if (!DataAggregationService.validateData(dataAggregation)) {
        throw new Error("Data validation failed");
      }

      // Step 3: Build analysis prompt
      const prompt = PromptBuilder.buildPrompt({
        analysisType: options.request.analysisType,
        timeRange: options.request.timeRange,
        focusAreas: options.request.focusAreas,
        anomalySensitivity: options.request.anomalySensitivity,
        includeForecasts: options.request.includeForecasts,
        includeTrendAnalysis: options.request.includeTrendAnalysis,
      });

      // Step 4: Format data context
      const dataContext = PromptBuilder.formatDataContext(dataAggregation);

      // Step 5: Validate data size before sending to AI
      if (!this.geminiService.validateDataSize(dataContext)) {
        throw new Error(
          "Data size exceeds API limits - consider reducing time range"
        );
      }

      // Step 6: Get AI insights from Gemini
      const geminiResponse = await this.geminiService.generateInsights(
        prompt,
        dataContext
      );

      logger.info("[InsightEngine] Gemini analysis completed", {
        tokensUsed: geminiResponse.tokensUsed,
        responseLength: geminiResponse.content.length,
      });

      // Step 7: Parse and validate AI response
      const aiResponse = this.parseAIResponse(geminiResponse.content);

      // Step 8: Build final response
      const analysisTimeMs = Date.now() - analysisStartTime;

      const finalResponse: AIInsightResponse = {
        success: true,
        timestamp: new Date(),
        analysisType: options.request.analysisType,
        insights: aiResponse.insights || [],
        anomalies: aiResponse.anomalies,
        forecasts: aiResponse.forecasts,
        recommendations: aiResponse.recommendations,
        summary: aiResponse.summary || {
          keyFindings: [],
          overallHealthScore: 50,
          areasOfConcern: [],
          opportunitiesForOptimization: [],
        },
        metadata: {
          dataPointsAnalyzed: dataAggregation.metadata.dataPointsIncluded,
          analysisTimeMs,
          modelVersion: "gemini-1.5-pro",
          dataQuality: dataAggregation.metadata.dataQuality,
        },
      };

      // Step 9: Validate final response matches schema
      const validatedResponse = AIInsightResponseSchema.parse(finalResponse);

      logger.info("[InsightEngine] Insight generation completed successfully", {
        tenantId: options.tenantId,
        analysisTimeMs,
        insightCount: validatedResponse.insights.length,
        anomalyCount: validatedResponse.anomalies?.length || 0,
      });

      return validatedResponse;
    } catch (error) {
      logger.error("[InsightEngine] Error generating insights", {
        error: error instanceof Error ? error.message : String(error),
        tenantId: options.tenantId,
      });
      throw error;
    }
  }

  /**
   * Generate streaming insights (for real-time UI updates)
   */
  async *streamInsights(
    options: AnalysisOptions
  ): AsyncGenerator<string, void, unknown> {
    logger.info("[InsightEngine] Starting insight stream", {
      tenantId: options.tenantId,
      analysisType: options.request.analysisType,
    });

    try {
      // Aggregate data
      const dataAggregation = await this.aggregateBusinessData(options);

      // Build prompt and data context
      const prompt = PromptBuilder.buildPrompt({
        analysisType: options.request.analysisType,
        timeRange: options.request.timeRange,
        focusAreas: options.request.focusAreas,
        anomalySensitivity: options.request.anomalySensitivity,
        includeForecasts: options.request.includeForecasts,
        includeTrendAnalysis: options.request.includeTrendAnalysis,
      });

      const dataContext = PromptBuilder.formatDataContext(dataAggregation);

      // Stream insights from Gemini
      for await (const chunk of this.geminiService.streamInsights(
        prompt,
        dataContext
      )) {
        yield chunk;
      }

      logger.info("[InsightEngine] Insight stream completed", {
        tenantId: options.tenantId,
      });
    } catch (error) {
      logger.error("[InsightEngine] Error streaming insights", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Aggregate business data from all modules
   * This is where we collect data from procurement, inventory, finance, etc.
   * AI never directly accesses these - only sees the aggregated result
   */
  private async aggregateBusinessData(options: AnalysisOptions) {
    const startDate = new Date(options.request.timeRange.startDate);
    const endDate = new Date(options.request.timeRange.endDate);

    // Determine what data to include based on analysis type
    let includeSpending = false;
    let includeInventory = false;
    let includeProcurement = false;
    let includeFinance = false;

    switch (options.request.analysisType) {
      case "spending":
        includeSpending = true;
        includeProcurement = true;
        break;
      case "inventory":
        includeInventory = true;
        break;
      case "procurement":
        includeProcurement = true;
        break;
      case "financial":
        includeFinance = true;
        includeSpending = true;
        break;
      case "holistic":
        includeSpending = true;
        includeInventory = true;
        includeProcurement = true;
        includeFinance = true;
        break;
    }

    return DataAggregationService.aggregateData({
      tenantId: options.tenantId,
      startDate,
      endDate,
      includeSpending,
      includeInventory,
      includeProcurement,
      includeFinance,
    });
  }

  /**
   * Parse AI response JSON
   * Handles both well-formed and partial responses
   */
  private parseAIResponse(rawContent: string): Partial<AIInsightResponse> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (error) {
      logger.warn("[InsightEngine] Failed to parse AI response as JSON", {
        error: error instanceof Error ? error.message : String(error),
      });

      // Return structured response from raw text
      return {
        insights: [
          {
            type: "spending_analysis",
            title: "Analysis Summary",
            summary: rawContent.substring(0, 200),
            details: rawContent,
            confidence: 0.8,
          },
        ],
      };
    }
  }

  /**
   * Generate quick summary (faster, lower cost)
   * Good for dashboard widgets
   */
  async generateQuickSummary(
    options: AnalysisOptions
  ): Promise<{ summary: string; score: number }> {
    const dataAggregation = await this.aggregateBusinessData(options);

    const quickPrompt = `
Analyze this business data and provide a 2-3 sentence executive summary and a health score (0-100).

IMPORTANT: Return ONLY a JSON object like:
{
  "summary": "Your summary here",
  "score": 75
}

Data:
${PromptBuilder.formatDataContext(dataAggregation)}
`;

    const response = await this.geminiService.generateInsights(
      quickPrompt,
      ""
    );

    try {
      const parsed = JSON.parse(response.content);
      return {
        summary: parsed.summary || "Unable to generate summary",
        score: parsed.score || 50,
      };
    } catch {
      return {
        summary: "Analysis in progress",
        score: 50,
      };
    }
  }

  /**
   * Detect anomalies (cost spikes, low stock, etc.)
   */
  async detectAnomalies(options: AnalysisOptions): Promise<any[]> {
    const dataAggregation = await this.aggregateBusinessData(options);

    const anomalyPrompt = `
Analyze this data and identify anomalies, unusual patterns, and risks.

Return a JSON array of anomalies with this structure:
[
  {
    "type": "cost_spike|low_stock|unusual_pattern",
    "description": "What is unusual",
    "severity": "low|medium|high|critical",
    "value": numeric value if applicable,
    "recommendation": "Suggested action"
  }
]

Data:
${PromptBuilder.formatDataContext(dataAggregation)}
`;

    const response = await this.geminiService.generateInsights(
      anomalyPrompt,
      ""
    );

    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      return JSON.parse(jsonMatch[0]);
    } catch {
      return [];
    }
  }

  /**
   * Generate trend forecasts
   */
  async generateForecasts(options: AnalysisOptions): Promise<any[]> {
    const dataAggregation = await this.aggregateBusinessData(options);

    const forecastPrompt = `
Based on this data, generate trend forecasts for the next 3 months.

Return a JSON array of forecasts:
[
  {
    "metric": "spending|inventory|orders",
    "trend": "increasing|decreasing|stable",
    "prediction": "specific prediction",
    "confidence": 0.0-1.0
  }
]

Data:
${PromptBuilder.formatDataContext(dataAggregation)}
`;

    const response = await this.geminiService.generateInsights(
      forecastPrompt,
      ""
    );

    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      return JSON.parse(jsonMatch[0]);
    } catch {
      return [];
    }
  }
}

export default InsightEngineService;
