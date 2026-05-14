/**
 * Base Types and Interfaces
 * Centralized type definitions for the entire application
 */

/**
 * API Response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * API Error
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}

/**
 * Base Entity
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User interface
 */
export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: "admin" | "user" | "viewer";
  isActive: boolean;
}

/**
 * Auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  companyId: string;
  email: string;
  password: string;
}

/**
 * Register credentials
 */
export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  role?: 'viewer' | 'analyst' | 'manager' | 'admin' | 'super_admin';
}

/**
 * Asset interface
 */
export interface Asset extends BaseEntity {
  name: string;
  category: string;
  value: number;
  quantity: number;
  location: string;
  status: "active" | "inactive" | "maintenance";
  description?: string;
  tags?: string[];
}

/**
 * Inventory item
 */
export interface InventoryItem extends BaseEntity {
  sku: string;
  name: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  category: string;
  location: string;
  lastRestocked?: string;
  supplier?: string;
}

/**
 * Order interface
 */
export interface Order extends BaseEntity {
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  supplier?: string;
  dueDate?: string;
  notes?: string;
}

/**
 * Order item
 */
export interface OrderItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Chat message
 */
export interface ChatMessage extends BaseEntity {
  conversationId: string;
  userId: string;
  content: string;
  type: "user" | "assistant" | "system";
  metadata?: Record<string, any>;
}

/**
 * Chat conversation
 */
export interface ChatConversation extends BaseEntity {
  userId: string;
  title: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  isActive: boolean;
}

/**
 * Dashboard metrics
 */
export interface DashboardMetrics {
  totalAssets: number;
  totalAssetValue: number;
  lowStockItems: number;
  pendingOrders: number;
  lastUpdated: string;
}

/**
 * Report interface
 */
export interface Report extends BaseEntity {
  title: string;
  type: "sales" | "inventory" | "assets" | "financial";
  description?: string;
  generatedBy: string;
  data: Record<string, any>;
  filters?: Record<string, any>;
}

/**
 * Alert / Notification
 */
export interface Alert extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  actionUrl?: string;
}

/**
 * Filter options
 */
export interface FilterOptions {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, any>;
}

/**
 * Component state
 */
export interface ComponentState {
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
}

/**
 * Form validation error
 */
export interface FormError {
  field: string;
  message: string;
}

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  data?: any;
}

/**
 * Table state
 */
export interface TableState {
  sortBy?: string;
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
  filters?: Record<string, any>;
}

/**
 * Search state
 */
export interface SearchState {
  query: string;
  results: any[];
  isSearching: boolean;
  totalResults: number;
}

/**
 * File upload - Platform-compatible type
 */
export interface FileUpload {
  // File can be either browser File, React Native asset, or Blob
  file: any; // any to support both File and RN asset types
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  text: string;
  border: string;
}

/**
 * Logger interface
 */
export interface Logger {
  log(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: any): void;
  debug(message: string, data?: any): void;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * API request config
 */
export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  cache?: boolean;
  cacheTTL?: number;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  total: number;
  succeeded: number;
  failed: number;
  errors?: Array<{ id: string; error: string }>;
}
