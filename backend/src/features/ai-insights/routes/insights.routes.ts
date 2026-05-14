import { Router } from "express";
import { protect, requireRole, verifyTenant } from "@features/auth/middleware/auth.middleware.js";
import { validate, validateQuery } from "@common/middleware/validation.middleware.js";
import { apiLimiter } from "@common/middleware/rateLimiter.middleware.js";
import * as insightsController from "../controllers/insights.controller.js";
import { InsightRequestSchema } from "../schemas/insights.schemas.js";
import { z } from "zod";

const router = Router();

// Apply authentication and tenant verification to all routes
router.use(protect, verifyTenant);

/**
 * POST /api/v1/insights/analyze
 * Generate comprehensive AI insights from business data
 */
router.post(
  "/analyze",
  apiLimiter,
  requireRole("analyst" as any, "manager" as any, "admin" as any),
  validate(InsightRequestSchema),
  insightsController.analyze
);

/**
 * POST /api/v1/insights/analyze/stream
 * Stream AI insights in real-time (for UI updates)
 */
router.post(
  "/analyze/stream",
  apiLimiter,
  requireRole("analyst" as any, "manager" as any, "admin" as any),
  validate(InsightRequestSchema),
  insightsController.analyzeStream
);

/**
 * GET /api/v1/insights/summary
 * Get quick executive summary
 * Query params: startDate, endDate, type
 */
router.get(
  "/summary",
  requireRole("viewer" as any, "analyst" as any, "manager" as any, "admin" as any),
  insightsController.getQuickSummary
);

/**
 * POST /api/v1/insights/anomalies
 * Detect anomalies in business data
 */
router.post(
  "/anomalies",
  apiLimiter,
  requireRole("analyst" as any, "manager" as any, "admin" as any),
  validate(
    z.object({
      startDate: z.string().or(z.date()),
      endDate: z.string().or(z.date()),
      sensitivity: z.enum(["low", "medium", "high"]).optional(),
    })
  ),
  insightsController.detectAnomalies
);

/**
 * POST /api/v1/insights/forecasts
 * Generate business forecasts (trend prediction)
 */
router.post(
  "/forecasts",
  apiLimiter,
  requireRole("analyst" as any, "manager" as any, "admin" as any),
  validate(
    z.object({
      startDate: z.string().or(z.date()),
      endDate: z.string().or(z.date()),
      metric: z.string().optional(),
    })
  ),
  insightsController.generateForecasts
);

/**
 * POST /api/v1/insights/spending-analysis
 * Quick spending analysis
 */
router.post(
  "/spending-analysis",
  apiLimiter,
  requireRole("analyst" as any, "manager" as any, "admin" as any),
  validate(
    z.object({
      startDate: z.string().or(z.date()),
      endDate: z.string().or(z.date()),
    })
  ),
  insightsController.spendingAnalysis
);

/**
 * POST /api/v1/insights/inventory-analysis
 * Quick inventory analysis
 */
router.post(
  "/inventory-analysis",
  apiLimiter,
  requireRole("analyst" as any, "manager" as any, "admin" as any),
  validate(
    z.object({
      startDate: z.string().or(z.date()),
      endDate: z.string().or(z.date()),
    })
  ),
  insightsController.inventoryAnalysis
);

/**
 * POST /api/v1/insights/procurement-analysis
 * Quick procurement analysis
 */
router.post(
  "/procurement-analysis",
  apiLimiter,
  requireRole("analyst" as any, "manager" as any, "admin" as any),
  validate(
    z.object({
      startDate: z.string().or(z.date()),
      endDate: z.string().or(z.date()),
    })
  ),
  insightsController.procurementAnalysis
);

/**
 * POST /api/v1/insights/financial-analysis
 * Quick financial analysis
 */
router.post(
  "/financial-analysis",
  apiLimiter,
  requireRole("analyst" as any, "manager" as any, "admin" as any),
  validate(
    z.object({
      startDate: z.string().or(z.date()),
      endDate: z.string().or(z.date()),
    })
  ),
  insightsController.financialAnalysis
);

/**
 * GET /api/v1/insights/health
 * Check AI service health
 */
router.get("/health", insightsController.healthCheck);

export default router;
