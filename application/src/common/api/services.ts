import ApiClient from './client';
import {
  LoginCredentials,
  AuthResponse,
  Dashboard,
  DashboardQuery,
  Asset,
  InventoryItem,
  ProcurementOrder,
  ChatSession,
  ChatMessage,
  Report,
  PaginatedResponse,
  ApiResponse,
} from '../types';

/**
 * Auth API Service
 */
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const client = ApiClient.getInstance();
    const { data } = await client.post('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    const client = ApiClient.getInstance();
    await client.post('/auth/logout');
    await ApiClient.clearCredentials();
  },

  register: async (payload: any): Promise<AuthResponse> => {
    const client = ApiClient.getInstance();
    const { data } = await client.post('/auth/register', payload);
    return data;
  },

  getCurrentUser: async () => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/auth/me');
    return data;
  },
};

/**
 * Dashboard API Service
 */
export const dashboardApi = {
  getDashboard: async (query?: DashboardQuery): Promise<ApiResponse<Dashboard>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/dashboard', { params: query });
    return data;
  },

  getDashboardSummary: async (query?: DashboardQuery): Promise<ApiResponse> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/dashboard/summary', { params: query });
    return data;
  },

  getAssets: async (query?: DashboardQuery): Promise<ApiResponse> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/dashboard/assets', { params: query });
    return data;
  },

  getInventory: async (query?: DashboardQuery): Promise<ApiResponse> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/dashboard/inventory', { params: query });
    return data;
  },

  getProcurement: async (query?: DashboardQuery): Promise<ApiResponse> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/dashboard/procurement', { params: query });
    return data;
  },

  getFinancial: async (query?: DashboardQuery): Promise<ApiResponse> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/dashboard/financial', { params: query });
    return data;
  },

  getInsights: async (query?: DashboardQuery): Promise<ApiResponse> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/dashboard/insights', { params: query });
    return data;
  },
};

/**
 * Assets API Service
 */
export const assetsApi = {
  getAssets: async (params?: any): Promise<PaginatedResponse<Asset>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/assets', { params });
    return data;
  },

  getAsset: async (id: string): Promise<ApiResponse<Asset>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get(`/assets/${id}`);
    return data;
  },

  createAsset: async (payload: Partial<Asset>): Promise<ApiResponse<Asset>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.post('/assets', payload);
    return data;
  },

  updateAsset: async (id: string, payload: Partial<Asset>): Promise<ApiResponse<Asset>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.put(`/assets/${id}`, payload);
    return data;
  },

  deleteAsset: async (id: string): Promise<ApiResponse> => {
    const client = ApiClient.getInstance();
    const { data } = await client.delete(`/assets/${id}`);
    return data;
  },
};

/**
 * Inventory API Service
 */
export const inventoryApi = {
  getInventory: async (params?: any): Promise<PaginatedResponse<InventoryItem>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/inventory', { params });
    return data;
  },

  getInventoryItem: async (id: string): Promise<ApiResponse<InventoryItem>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get(`/inventory/${id}`);
    return data;
  },

  updateInventory: async (id: string, quantity: number): Promise<ApiResponse<InventoryItem>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.patch(`/inventory/${id}`, { quantity });
    return data;
  },
};

/**
 * Procurement API Service
 */
export const procurementApi = {
  getOrders: async (params?: any): Promise<PaginatedResponse<ProcurementOrder>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/procurement/orders', { params });
    return data;
  },

  getOrder: async (id: string): Promise<ApiResponse<ProcurementOrder>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get(`/procurement/orders/${id}`);
    return data;
  },

  createOrder: async (payload: Partial<ProcurementOrder>): Promise<ApiResponse<ProcurementOrder>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.post('/procurement/orders', payload);
    return data;
  },

  updateOrder: async (id: string, payload: Partial<ProcurementOrder>): Promise<ApiResponse<ProcurementOrder>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.put(`/procurement/orders/${id}`, payload);
    return data;
  },
};

/**
 * AI Chat API Service
 */
export const chatApi = {
  getSessions: async (): Promise<ApiResponse<ChatSession[]>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/chat/sessions');
    return data;
  },

  getSession: async (id: string): Promise<ApiResponse<ChatSession>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get(`/chat/sessions/${id}`);
    return data;
  },

  createSession: async (title: string): Promise<ApiResponse<ChatSession>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.post('/chat/sessions', { title });
    return data;
  },

  sendMessage: async (sessionId: string, message: string): Promise<ApiResponse<ChatMessage>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.post(`/chat/sessions/${sessionId}/messages`, { content: message });
    return data;
  },
};

/**
 * Reports API Service
 */
export const reportsApi = {
  getReports: async (params?: any): Promise<PaginatedResponse<Report>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get('/reports', { params });
    return data;
  },

  getReport: async (id: string): Promise<ApiResponse<Report>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get(`/reports/${id}`);
    return data;
  },

  generateReport: async (payload: any): Promise<ApiResponse<Report>> => {
    const client = ApiClient.getInstance();
    const { data } = await client.post('/reports', payload);
    return data;
  },

  downloadReport: async (id: string, format: string): Promise<string> => {
    const client = ApiClient.getInstance();
    const { data } = await client.get(`/reports/${id}/download`, { params: { format } });
    return data.data?.url;
  },
};

/**
 * Export all API services
 */
export default {
  auth: authApi,
  dashboard: dashboardApi,
  assets: assetsApi,
  inventory: inventoryApi,
  procurement: procurementApi,
  chat: chatApi,
  reports: reportsApi,
};
