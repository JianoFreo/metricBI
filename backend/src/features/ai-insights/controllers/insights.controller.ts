import { Request, Response, NextFunction } from "express";
import InsightEngineService from "../services/insight-engine.service.js";
import GeminiService from "../services/gemini.service.js";
import { InsightRequestSchema } from "../schemas/insights.schemas.js";
import logger from "@common/logger";

// Initialize services
const geminiService = new GeminiService({
  apiKey: process.env.GEMINI_API_KEY || "",
});
const insightEngine = new InsightEngineService(geminiService);

/**
 * AI Insights Controller
 * Handles all insight-related requests
 */

/**
 * POST /api/v1/insights/analyze
 * Generate comprehensive AI insights from business data
 */
export async function analyze(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const tenantId = (req as any).user?.tenantId;

    if (!tenantId || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Validate request body
    const request = InsightRequestSchema.parse(req.body);

    logger.info("[InsightsController] Generating insights", {
      analysisType: request.analysisType,
      tenantId,
    });

    // Generate insights
    const insights = await insightEngine.generateInsights({
      tenantId,
      request,
      userId,
    });

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error("[InsightsController] Error in analyze", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
}

/**
 * POST /api/v1/insights/analyze/stream
 * Stream AI insights in real-time
 */
export async function analyzeStream(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const request = InsightRequestSchema.parse(req.body);

    logger.info("[InsightsController] Starting insight stream", {
      analysisType: request.analysisType,
      tenantId,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const generator = insightEngine.streamInsights({
      tenantId,
      request,
      userId,
    });

    for await (const chunk of generator) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ completed: true })}\n\n`);
    res.end();
  } catch (error) {
    logger.error("[InsightsController] Error in analyzeStream", {
      error: error instanceof Error ? error.message : String(error),
    });

    if (!res.headersSent) {
      res.status(500).json({ error: "Stream error" });
    } else {
      res.end();
    }
  }
}

/**
 * GET /api/v1/insights/summary
 * Get quick dashboard summary
 */
export async function getQuickSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const analysisType = (req.query.type as string) || "holistic";

    logger.info("[InsightsController] Getting quick summary", {
      analysisType,
      tenantId,
    });

    const summary = await insightEngine.generateQuickSummary({
      tenantId,
      userId,
      request: {
        analysisType: analysisType as any,
        timeRange: { startDate, endDate },
        anomalySensitivity: "medium",
        includeForecasts: false,
        includeTrendAnalysis: false,
      },
    });

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error("[InsightsController] Error in getQuickSummary", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
}

/**
 * POST /api/v1/insights/anomalies
 * Detect anomalies in business data
 */
export async function detectAnomalies(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { startDate, endDate, sensitivity } = req.body;

    logger.info("[InsightsController] Detecting anomalies", {
      tenantId,
      sensitivity,
    });

    const anomalies = await insightEngine.detectAnomalies({
      tenantId,
      userId,
      request: {
        analysisType: "holistic",
        timeRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
        anomalySensitivity: sensitivity || "medium",
        includeForecasts: false,
        includeTrendAnalysis: false,
      },
    });

    res.status(200).json({
      success: true,
      data: anomalies,
    });
  } catch (error) {
    logger.error("[InsightsController] Error in detectAnomalies", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
}

/**
 * POST /api/v1/insights/forecasts
 * Generate business forecasts
 */
export async function generateForecasts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { startDate, endDate, metric } = req.body;

    logger.info("[InsightsController] Generating forecasts", {
      tenantId,
      metric,
    });

    const forecasts = await insightEngine.generateForecasts({
      tenantId,
      userId,
      request: {
        analysisType: "holistic",
        timeRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
        anomalySensitivity: "medium",
        includeForecasts: true,
        includeTrendAnalysis: true,
      },
    });

    res.status(200).json({
      success: true,
      data: forecasts,
    });
  } catch (error) {
    logger.error("[InsightsController] Error in generateForecasts", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
}

/**
 * GET /api/v1/insights/health
 * Check if AI service is healthy
 */
export async function healthCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.info("[InsightsController] Health check");
    const isHealthy = await geminiService.healthCheck();

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? "healthy" : "unhealthy",
      service: "Gemini AI",
    });
  } catch (error) {
    logger.error("[InsightsController] Error in healthCheck", {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(503).json({
      success: false,
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * POST /api/v1/insights/spending-analysis
 * Quick spending analysis endpoint
 */
export async function spendingAnalysis(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { startDate, endDate } = req.body;

    const insights = await insightEngine.generateInsights({
      tenantId,
      userId,
      request: {
        analysisType: "spending",
        timeRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
        anomalySensitivity: "medium",
        includeForecasts: false,
        includeTrendAnalysis: true,
      },
    });

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error("[InsightsController] Error in spendingAnalysis", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
}

/**
 * POST /api/v1/insights/inventory-analysis
 * Quick inventory analysis endpoint
 */
export async function inventoryAnalysis(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { startDate, endDate } = req.body;

    const insights = await insightEngine.generateInsights({
      tenantId,
      userId,
      request: {
        analysisType: "inventory",
        timeRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
        anomalySensitivity: "high",
        includeForecasts: true,
        includeTrendAnalysis: true,
      },
    });

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error("[InsightsController] Error in inventoryAnalysis", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
}

/**
 * POST /api/v1/insights/procurement-analysis
 * Quick procurement analysis endpoint
 */
export async function procurementAnalysis(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { startDate, endDate } = req.body;

    const insights = await insightEngine.generateInsights({
      tenantId,
      userId,
      request: {
        analysisType: "procurement",
        timeRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
        anomalySensitivity: "medium",
        includeForecasts: false,
        includeTrendAnalysis: true,
      },
    });

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error("[InsightsController] Error in procurementAnalysis", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
}

/**
 * POST /api/v1/insights/financial-analysis
 * Quick financial analysis endpoint
 */
export async function financialAnalysis(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    if (!tenantId || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { startDate, endDate } = req.body;

    const insights = await insightEngine.generateInsights({
      tenantId,
      userId,
      request: {
        analysisType: "financial",
        timeRange: { startDate: new Date(startDate), endDate: new Date(endDate) },
        anomalySensitivity: "high",
        includeForecasts: true,
        includeTrendAnalysis: true,
      },
    });

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    logger.error("[InsightsController] Error in financialAnalysis", {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
}

export default {
  analyze,
  analyzeStream,
  getQuickSummary,
  detectAnomalies,
  generateForecasts,
  healthCheck,
  spendingAnalysis,
  inventoryAnalysis,
  procurementAnalysis,
  financialAnalysis,
};
