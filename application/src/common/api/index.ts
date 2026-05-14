/**
 * API Module Exports
 * Includes base service classes, API client, and service layer
 */

// Export base service classes
export {
  BaseService,
  AuthService,
  DashboardService,
  AssetsService,
  InventoryService,
  ProcurementService,
  ChatService,
  ReportsService,
  ServiceFactory,
} from './base.service';

// Export API client
export { default as ApiClient } from './client';

// Export services
export { dashboardApi, authApi, assetsApi, inventoryApi, procurementApi, chatApi, reportsApi } from './services';
