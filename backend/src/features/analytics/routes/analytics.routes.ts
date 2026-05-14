import { Router, RequestHandler } from 'express';
import { logger } from '@common/utils/logger.js';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { AnalyticsRequestSchema } from '../schemas/analytics.schemas.js';
import { protect } from '@features/auth/middleware/auth.middleware.js';

/**
 * Analytics Routes
 * Defines all analytics API endpoints
 */
const router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Middleware for route logging
const logRoute: RequestHandler = (req, res, next) => {
  logger.info('Analytics API request', {
    method: req.method,
    path: req.path,
    userId: (req as any).user?.id,
  });
  next();
};

// Validation middleware
const validateAnalyticsRequest = (req: any, res: any, next: any) => {
  try {
    AnalyticsRequestSchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Invalid request format',
      details: error.errors,
    });
  }
};

// ============ Revenue Analytics ============

/**
 * POST /api/v1/analytics/revenue-trends
 * Get revenue trends with customizable time period
 */
router.post(
  '/revenue-trends',
  logRoute,
  validateAnalyticsRequest,
  AnalyticsController.getRevenueTrends
);

/**
 * GET /api/v1/analytics/revenue/daily
 * Quick endpoint for today's revenue
 */
router.get('/revenue/daily', logRoute, AnalyticsController.getDailyRevenue);

// ============ Expense Analytics ============

/**
 * POST /api/v1/analytics/expense-tracking
 * Get expense tracking with customizable time period
 */
router.post(
  '/expense-tracking',
  logRoute,
  validateAnalyticsRequest,
  AnalyticsController.getExpenseTracking
);

/**
 * GET /api/v1/analytics/expenses/daily
 * Quick endpoint for today's expenses
 */
router.get('/expenses/daily', logRoute, AnalyticsController.getDailyExpenses);

// ============ Inventory Analytics ============

/**
 * POST /api/v1/analytics/inventory-performance
 * Get inventory performance metrics
 */
router.post(
  '/inventory-performance',
  logRoute,
  validateAnalyticsRequest,
  AnalyticsController.getInventoryPerformance
);

// ============ Procurement Analytics ============

/**
 * POST /api/v1/analytics/procurement-efficiency
 * Get procurement efficiency metrics
 */
router.post(
  '/procurement-efficiency',
  logRoute,
  validateAnalyticsRequest,
  AnalyticsController.getProcurementEfficiency
);

// ============ KPI Analytics ============

/**
 * POST /api/v1/analytics/kpis
 * Calculate and retrieve KPIs
 */
router.post('/kpis', logRoute, validateAnalyticsRequest, AnalyticsController.calculateKPIs);

// ============ Dashboard & Summary ============

/**
 * GET /api/v1/analytics/dashboard
 * Get complete dashboard summary
 */
router.get('/dashboard', logRoute, AnalyticsController.getDashboardSummary);

/**
 * GET /api/v1/analytics/profit-margin
 * Quick profit margin calculation
 * Query params: startDate, endDate (ISO strings)
 */
router.get('/profit-margin', logRoute, AnalyticsController.getProfitMargin);

// ============ Comparison & Admin ============

/**
 * POST /api/v1/analytics/comparison
 * Compare metrics between two time periods
 */
router.post('/comparison', logRoute, AnalyticsController.comparePeriods);

/**
 * POST /api/v1/analytics/clear-cache
 * Clear analytics cache (admin only)
 */
router.post('/clear-cache', logRoute, AnalyticsController.clearCache);

/**
 * GET /api/v1/analytics/health
 * Health check for analytics service
 */
router.get('/health', logRoute, AnalyticsController.healthCheck);

logger.info('Registered analytics routes', {
  endpoints: 11,
});

export default router;
