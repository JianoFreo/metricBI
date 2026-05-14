import { Router } from 'express';
import { protect } from '@common/middlewares/auth.middleware.js';
import { DashboardController } from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * Dashboard Routes
 * Base path: /api/v1/dashboard
 * All routes are protected (require authentication)
 */

// Health check (no auth required)
router.get('/health', DashboardController.healthCheck);

// Main dashboard endpoint - complete data
router.get('/', protect, DashboardController.getDashboard);

// Lightweight summary
router.get('/summary', protect, DashboardController.getDashboardSummary);

// Individual data sections
router.get('/assets', protect, DashboardController.getAssetsSummary);
router.get('/inventory', protect, DashboardController.getInventoryStatus);
router.get('/procurement', protect, DashboardController.getProcurementOverview);
router.get('/financial', protect, DashboardController.getFinancialSummary);
router.get('/insights', protect, DashboardController.getInsights);

// Admin operations
router.post('/cache-clear', protect, DashboardController.clearCache);

export default router;
