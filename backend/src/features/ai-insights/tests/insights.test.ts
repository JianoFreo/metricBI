import { describe, it, expect, beforeEach, vi } from "vitest";
import GeminiService from "../services/gemini.service.js";
import DataAggregationService from "../services/data-aggregation.service.js";
import InsightEngineService from "../services/insight-engine.service.js";
import PromptBuilder from "../utils/prompt-builder.js";
import { AIInsightResponseSchema, InsightRequestSchema } from "../schemas/insights.schemas.js";

describe("AI Insights Module", () => {
  describe("GeminiService", () => {
    let geminiService: GeminiService;

    beforeEach(() => {
      geminiService = new GeminiService({
        apiKey: "test-api-key",
      });
    });

    it("should initialize with API key", () => {
      expect(geminiService).toBeDefined();
    });

    it("should validate data size", () => {
      const smallData = "Test data";
      const largeData = "x".repeat(6000000); // 6MB

      expect(geminiService.validateDataSize(smallData)).toBe(true);
      expect(geminiService.validateDataSize(largeData, 5000)).toBe(false);
    });

    it("should throw error without API key", () => {
      expect(() => {
        new GeminiService({ apiKey: "" });
      }).toThrow("GEMINI_API_KEY is required");
    });
  });

  describe("DataAggregationService", () => {
    it("should aggregate spending data", async () => {
      const data = await DataAggregationService.aggregateData({
        tenantId: "tenant-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        includeSpending: true,
      });

      expect(data.spending).toBeDefined();
      expect(data.spending?.totalSpent).toBeGreaterThan(0);
      expect(data.metadata.dataQuality).toBeDefined();
    });

    it("should aggregate inventory data", async () => {
      const data = await DataAggregationService.aggregateData({
        tenantId: "tenant-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        includeInventory: true,
      });

      expect(data.inventory).toBeDefined();
      expect(data.inventory?.totalItems).toBeGreaterThan(0);
      expect(data.inventory?.stockLevels).toBeDefined();
      expect(Array.isArray(data.inventory?.stockLevels)).toBe(true);
    });

    it("should aggregate procurement data", async () => {
      const data = await DataAggregationService.aggregateData({
        tenantId: "tenant-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        includeProcurement: true,
      });

      expect(data.procurement).toBeDefined();
      expect(data.procurement?.totalOrders).toBeGreaterThan(0);
      expect(data.procurement?.supplierMetrics).toBeDefined();
    });

    it("should aggregate financial data", async () => {
      const data = await DataAggregationService.aggregateData({
        tenantId: "tenant-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        includeFinance: true,
      });

      expect(data.finance).toBeDefined();
      expect(data.finance?.expenses).toBeGreaterThan(0);
    });

    it("should aggregate holistic data", async () => {
      const data = await DataAggregationService.aggregateData({
        tenantId: "tenant-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        includeSpending: true,
        includeInventory: true,
        includeProcurement: true,
        includeFinance: true,
      });

      expect(data.spending).toBeDefined();
      expect(data.inventory).toBeDefined();
      expect(data.procurement).toBeDefined();
      expect(data.finance).toBeDefined();
      expect(data.metadata.dataPointsIncluded).toBeGreaterThan(0);
    });

    it("should validate aggregated data", async () => {
      const data = await DataAggregationService.aggregateData({
        tenantId: "tenant-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        includeSpending: true,
      });

      expect(DataAggregationService.validateData(data)).toBe(true);
    });

    it("should calculate data quality", async () => {
      const data = await DataAggregationService.aggregateData({
        tenantId: "tenant-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        includeSpending: true,
      });

      expect(["excellent", "good", "fair", "poor"]).toContain(
        data.metadata.dataQuality
      );
    });
  });

  describe("PromptBuilder", () => {
    it("should build spending analysis prompt", () => {
      const prompt = PromptBuilder.buildPrompt({
        analysisType: "spending",
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        anomalySensitivity: "medium",
        includeForecasts: false,
        includeTrendAnalysis: true,
      });

      expect(prompt).toContain("spending");
      expect(prompt).toContain("2024-01-01");
      expect(prompt).toContain("JSON");
    });

    it("should build inventory analysis prompt", () => {
      const prompt = PromptBuilder.buildPrompt({
        analysisType: "inventory",
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        anomalySensitivity: "high",
        includeForecasts: true,
        includeTrendAnalysis: true,
      });

      expect(prompt).toContain("inventory");
      expect(prompt).toContain("Forecast");
    });

    it("should build procurement analysis prompt", () => {
      const prompt = PromptBuilder.buildPrompt({
        analysisType: "procurement",
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        anomalySensitivity: "medium",
        includeForecasts: false,
        includeTrendAnalysis: true,
      });

      expect(prompt).toContain("procurement");
      expect(prompt).toContain("supplier");
    });

    it("should build financial analysis prompt", () => {
      const prompt = PromptBuilder.buildPrompt({
        analysisType: "financial",
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        anomalySensitivity: "medium",
        includeForecasts: false,
        includeTrendAnalysis: true,
      });

      expect(prompt).toContain("financial");
      expect(prompt).toContain("Profitability");
    });

    it("should build holistic analysis prompt", () => {
      const prompt = PromptBuilder.buildPrompt({
        analysisType: "holistic",
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        anomalySensitivity: "medium",
        includeForecasts: true,
        includeTrendAnalysis: true,
      });

      expect(prompt).toContain("operational");
      expect(prompt).toContain("Forecast");
    });

    it("should format data context", async () => {
      const data = await DataAggregationService.aggregateData({
        tenantId: "tenant-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        includeSpending: true,
      });

      const formatted = PromptBuilder.formatDataContext(data);

      expect(formatted).toContain("SPENDING DATA");
      expect(formatted).toContain("Total Spent");
      expect(formatted).toContain("DATA COLLECTION PERIOD");
    });

    it("should handle focus areas", () => {
      const prompt = PromptBuilder.buildPrompt({
        analysisType: "spending",
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        focusAreas: ["Operations", "Marketing"],
        anomalySensitivity: "medium",
        includeForecasts: false,
        includeTrendAnalysis: true,
      });

      expect(prompt).toContain("Operations");
      expect(prompt).toContain("Marketing");
    });

    it("should handle different anomaly sensitivities", () => {
      const lowSensitivity = PromptBuilder.buildPrompt({
        analysisType: "spending",
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        anomalySensitivity: "low",
        includeForecasts: false,
        includeTrendAnalysis: true,
      });

      const highSensitivity = PromptBuilder.buildPrompt({
        analysisType: "spending",
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        anomalySensitivity: "high",
        includeForecasts: false,
        includeTrendAnalysis: true,
      });

      expect(lowSensitivity).toContain("LOW");
      expect(highSensitivity).toContain("HIGH");
    });
  });

  describe("Schema Validation", () => {
    it("should validate insight request schema", () => {
      const request = {
        analysisType: "spending" as const,
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
        anomalySensitivity: "medium" as const,
        includeForecasts: false,
        includeTrendAnalysis: true,
      };

      expect(() => InsightRequestSchema.parse(request)).not.toThrow();
    });

    it("should reject invalid analysis type", () => {
      const request = {
        analysisType: "invalid" as any,
        timeRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-01-31"),
        },
      };

      expect(() => InsightRequestSchema.parse(request)).toThrow();
    });

    it("should validate AI response schema", () => {
      const response = {
        success: true,
        timestamp: new Date(),
        analysisType: "spending",
        insights: [
          {
            type: "spending_analysis" as const,
            title: "Test Title",
            summary: "Test summary for analysis",
            details: "Test details for spending analysis",
            confidence: 0.85,
          },
        ],
        summary: {
          keyFindings: ["Finding 1"],
          overallHealthScore: 75,
          areasOfConcern: [],
          opportunitiesForOptimization: [],
        },
        metadata: {
          dataPointsAnalyzed: 100,
          analysisTimeMs: 5000,
          modelVersion: "gemini-1.5-pro",
          dataQuality: "good" as const,
        },
      };

      expect(() => AIInsightResponseSchema.parse(response)).not.toThrow();
    });

    it("should require confidence between 0 and 1", () => {
      const response = {
        success: true,
        timestamp: new Date(),
        analysisType: "spending",
        insights: [
          {
            type: "spending_analysis" as const,
            title: "Test",
            summary: "Summary",
            details: "Details",
            confidence: 1.5, // Invalid - > 1
          },
        ],
        summary: {
          keyFindings: [],
          overallHealthScore: 50,
          areasOfConcern: [],
          opportunitiesForOptimization: [],
        },
        metadata: {
          dataPointsAnalyzed: 0,
          analysisTimeMs: 0,
          modelVersion: "1.0",
          dataQuality: "fair" as const,
        },
      };

      expect(() => AIInsightResponseSchema.parse(response)).toThrow();
    });
  });

  describe("InsightEngineService", () => {
    let insightEngine: InsightEngineService;
    let mockGeminiService: any;

    beforeEach(() => {
      mockGeminiService = {
        generateInsights: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            insights: [
              {
                type: "spending_analysis",
                title: "Test Insight",
                summary: "Test summary",
                details: "Test details",
                confidence: 0.9,
              },
            ],
            summary: {
              keyFindings: ["Key finding"],
              overallHealthScore: 80,
              areasOfConcern: [],
              opportunitiesForOptimization: [],
            },
          }),
          tokensUsed: { input: 100, output: 50 },
        }),
        validateDataSize: vi.fn().mockReturnValue(true),
        streamInsights: vi.fn(),
      };

      insightEngine = new InsightEngineService(mockGeminiService);
    });

    it("should generate insights successfully", async () => {
      const result = await insightEngine.generateInsights({
        tenantId: "tenant-123",
        userId: "user-456",
        request: {
          analysisType: "spending",
          timeRange: {
            startDate: new Date("2024-01-01"),
            endDate: new Date("2024-01-31"),
          },
          anomalySensitivity: "medium",
          includeForecasts: false,
          includeTrendAnalysis: true,
        },
      });

      expect(result.success).toBe(true);
      expect(result.insights).toBeDefined();
      expect(result.metadata.analysisTimeMs).toBeGreaterThan(0);
    });

    it("should include anomalies when detected", async () => {
      mockGeminiService.generateInsights.mockResolvedValueOnce({
        content: JSON.stringify({
          insights: [],
          anomalies: [
            {
              type: "cost_spike",
              description: "Cost spike detected",
              severity: "high",
              affectedEntity: "Operations",
            },
          ],
          summary: {
            keyFindings: [],
            overallHealthScore: 50,
            areasOfConcern: ["Cost anomaly"],
            opportunitiesForOptimization: [],
          },
        }),
        tokensUsed: { input: 100, output: 50 },
      });

      const result = await insightEngine.generateInsights({
        tenantId: "tenant-123",
        userId: "user-456",
        request: {
          analysisType: "spending",
          timeRange: {
            startDate: new Date("2024-01-01"),
            endDate: new Date("2024-01-31"),
          },
          anomalySensitivity: "high",
          includeForecasts: false,
          includeTrendAnalysis: true,
        },
      });

      expect(result.anomalies).toBeDefined();
      expect(result.anomalies?.length).toBeGreaterThan(0);
    });

    it("should generate quick summary", async () => {
      const summary = await insightEngine.generateQuickSummary({
        tenantId: "tenant-123",
        userId: "user-456",
        request: {
          analysisType: "holistic",
          timeRange: {
            startDate: new Date("2024-01-01"),
            endDate: new Date("2024-01-31"),
          },
          anomalySensitivity: "medium",
          includeForecasts: false,
          includeTrendAnalysis: false,
        },
      });

      expect(summary.summary).toBeDefined();
      expect(summary.score).toBeGreaterThanOrEqual(0);
      expect(summary.score).toBeLessThanOrEqual(100);
    });
  });
});
