/**
 * Types Module Exports
 * Includes both domain types and base type definitions
 */

// Export all base types
export {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  BaseEntity,
  User,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  Asset,
  InventoryItem,
  Order,
  OrderItem,
  ChatMessage,
  ChatConversation,
  DashboardMetrics,
  Report,
  Alert,
  FilterOptions,
  ComponentState,
  FormError,
  Toast,
  ModalState,
  TableState,
  SearchState,
  FileUpload,
  ThemeConfig,
  Logger,
  CacheEntry,
  ApiRequestConfig,
  BulkOperationResult,
} from './base.types';

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  tenantId: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

// Dashboard Types
export interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  currency: string;
  period: string;
}

export interface AssetsSummary {
  totalAssets: number;
  assetCount: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  recentAdditions: number;
}

export interface InventoryStatus {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overStockItems: number;
  turnoverRate: number;
  topItems: Array<{ name: string; quantity: number }>;
  byLocation: Record<string, number>;
}

export interface ProcurementOverview {
  totalPendingOrders: number;
  totalOrderValue: number;
  totalSuppliers: number;
  averageLeadTime: number;
  onTimeDeliveryRate: number;
  topSuppliers: Array<{ name: string; orders: number }>;
  recentOrders: number;
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  timestamp: string;
}

export interface Dashboard {
  financialSummary: FinancialSummary;
  assetsSummary: AssetsSummary;
  inventoryStatus: InventoryStatus;
  procurementOverview: ProcurementOverview;
  aiInsights: AIInsight[];
  generatedAt: string;
}

// Asset Types
export interface Asset {
  id: string;
  name: string;
  category: string;
  value: number;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  location: string;
  purchaseDate: string;
  lastMaintenance?: string;
  condition: number; // 0-100
  tags?: string[];
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
  location: string;
  value: number;
  lastUpdate: string;
}

// Procurement Types
export interface ProcurementOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  totalValue: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Report Types
export interface Report {
  id: string;
  title: string;
  type: 'asset' | 'inventory' | 'procurement' | 'financial' | 'custom';
  format: 'pdf' | 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  createdAt: string;
}

// Query Parameters
export interface DashboardQuery {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  includeInsights?: boolean;
  includeDetailed?: boolean;
}

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
