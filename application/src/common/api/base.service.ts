/**
 * Base Service Class
 * Provides common functionality for all services
 */
import ApiClient from './client';
import logger from '@common/utils/logger';

export abstract class BaseService {
  protected client = ApiClient.getInstance();
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Make GET request
   */
  protected async get<T>(url: string, params?: any): Promise<T> {
    try {
      logger.info(`[${this.serviceName}] GET ${url}`, params);
      const { data } = await this.client.get<T>(url, { params });
      return data;
    } catch (error: any) {
      logger.error(`[${this.serviceName}] GET ${url} failed`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Make POST request
   */
  protected async post<T>(url: string, payload: any): Promise<T> {
    try {
      logger.info(`[${this.serviceName}] POST ${url}`, payload);
      const { data } = await this.client.post<T>(url, payload);
      return data;
    } catch (error: any) {
      logger.error(`[${this.serviceName}] POST ${url} failed`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Make PUT request
   */
  protected async put<T>(url: string, payload: any): Promise<T> {
    try {
      logger.info(`[${this.serviceName}] PUT ${url}`, payload);
      const { data } = await this.client.put<T>(url, payload);
      return data;
    } catch (error: any) {
      logger.error(`[${this.serviceName}] PUT ${url} failed`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Make DELETE request
   */
  protected async delete<T>(url: string): Promise<T> {
    try {
      logger.info(`[${this.serviceName}] DELETE ${url}`);
      const { data } = await this.client.delete<T>(url);
      return data;
    } catch (error: any) {
      logger.error(`[${this.serviceName}] DELETE ${url} failed`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Make PATCH request
   */
  protected async patch<T>(url: string, payload: any): Promise<T> {
    try {
      logger.info(`[${this.serviceName}] PATCH ${url}`, payload);
      const { data } = await this.client.patch<T>(url, payload);
      return data;
    } catch (error: any) {
      logger.error(`[${this.serviceName}] PATCH ${url} failed`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  protected handleError(error: any): Error {
    const message =
      error.response?.data?.error || 
      error.message || 
      'An error occurred';
    return new Error(message);
  }
}

/**
 * Auth Service
 */
export class AuthService extends BaseService {
  constructor() {
    super('AuthService');
  }

  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  async register(data: any) {
    return this.post('/auth/register', data);
  }

  async logout() {
    return this.post('/auth/logout', {});
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }
}

/**
 * Dashboard Service
 */
export class DashboardService extends BaseService {
  constructor() {
    super('DashboardService');
  }

  async getDashboard(query?: any) {
    return this.get('/dashboard', query);
  }

  async getDashboardSummary(query?: any) {
    return this.get('/dashboard/summary', query);
  }

  async getAssets(query?: any) {
    return this.get('/dashboard/assets', query);
  }

  async getInventory(query?: any) {
    return this.get('/dashboard/inventory', query);
  }

  async getProcurement(query?: any) {
    return this.get('/dashboard/procurement', query);
  }

  async getFinancial(query?: any) {
    return this.get('/dashboard/financial', query);
  }

  async getInsights(query?: any) {
    return this.get('/dashboard/insights', query);
  }
}

/**
 * Assets Service
 */
export class AssetsService extends BaseService {
  constructor() {
    super('AssetsService');
  }

  async getAssets(params?: any) {
    return this.get('/assets', params);
  }

  async getAsset(id: string) {
    return this.get(`/assets/${id}`);
  }

  async createAsset(payload: any) {
    return this.post('/assets', payload);
  }

  async updateAsset(id: string, payload: any) {
    return this.put(`/assets/${id}`, payload);
  }

  async deleteAsset(id: string) {
    return this.delete(`/assets/${id}`);
  }
}

/**
 * Inventory Service
 */
export class InventoryService extends BaseService {
  constructor() {
    super('InventoryService');
  }

  async getInventory(params?: any) {
    return this.get('/inventory', params);
  }

  async getItem(id: string) {
    return this.get(`/inventory/${id}`);
  }

  async updateInventory(id: string, quantity: number) {
    return this.patch(`/inventory/${id}`, { quantity });
  }
}

/**
 * Procurement Service
 */
export class ProcurementService extends BaseService {
  constructor() {
    super('ProcurementService');
  }

  async getOrders(params?: any) {
    return this.get('/procurement/orders', params);
  }

  async getOrder(id: string) {
    return this.get(`/procurement/orders/${id}`);
  }

  async createOrder(payload: any) {
    return this.post('/procurement/orders', payload);
  }

  async updateOrder(id: string, payload: any) {
    return this.put(`/procurement/orders/${id}`, payload);
  }
}

/**
 * Chat Service
 */
export class ChatService extends BaseService {
  constructor() {
    super('ChatService');
  }

  async getSessions() {
    return this.get('/chat/sessions');
  }

  async getSession(id: string) {
    return this.get(`/chat/sessions/${id}`);
  }

  async createSession(title: string) {
    return this.post('/chat/sessions', { title });
  }

  async sendMessage(sessionId: string, message: string) {
    return this.post(`/chat/sessions/${sessionId}/messages`, { content: message });
  }
}

/**
 * Reports Service
 */
export class ReportsService extends BaseService {
  constructor() {
    super('ReportsService');
  }

  async getReports(params?: any) {
    return this.get('/reports', params);
  }

  async getReport(id: string) {
    return this.get(`/reports/${id}`);
  }

  async generateReport(payload: any) {
    return this.post('/reports', payload);
  }

  async downloadReport(id: string, format: string) {
    return this.get(`/reports/${id}/download`, { format });
  }
}

/**
 * Service Factory
 * Provides singleton instances of all services
 */
export class ServiceFactory {
  private static authService: AuthService;
  private static dashboardService: DashboardService;
  private static assetsService: AssetsService;
  private static inventoryService: InventoryService;
  private static procurementService: ProcurementService;
  private static chatService: ChatService;
  private static reportsService: ReportsService;

  static getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = new AuthService();
    }
    return this.authService;
  }

  static getDashboardService(): DashboardService {
    if (!this.dashboardService) {
      this.dashboardService = new DashboardService();
    }
    return this.dashboardService;
  }

  static getAssetsService(): AssetsService {
    if (!this.assetsService) {
      this.assetsService = new AssetsService();
    }
    return this.assetsService;
  }

  static getInventoryService(): InventoryService {
    if (!this.inventoryService) {
      this.inventoryService = new InventoryService();
    }
    return this.inventoryService;
  }

  static getProcurementService(): ProcurementService {
    if (!this.procurementService) {
      this.procurementService = new ProcurementService();
    }
    return this.procurementService;
  }

  static getChatService(): ChatService {
    if (!this.chatService) {
      this.chatService = new ChatService();
    }
    return this.chatService;
  }

  static getReportsService(): ReportsService {
    if (!this.reportsService) {
      this.reportsService = new ReportsService();
    }
    return this.reportsService;
  }
}

// Export singleton instances
export const authService = ServiceFactory.getAuthService();
export const dashboardService = ServiceFactory.getDashboardService();
export const assetsService = ServiceFactory.getAssetsService();
export const inventoryService = ServiceFactory.getInventoryService();
export const procurementService = ServiceFactory.getProcurementService();
export const chatService = ServiceFactory.getChatService();
export const reportsService = ServiceFactory.getReportsService();
