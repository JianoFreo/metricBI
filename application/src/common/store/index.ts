import { create } from 'zustand';
import { Dashboard, DashboardQuery, AIInsight } from '../types';
import { dashboardApi } from '../api/services';

interface DashboardStore {
  dashboard: Dashboard | null;
  insights: AIInsight[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  period: DashboardQuery['period'];

  fetchDashboard: (query?: DashboardQuery) => Promise<void>;
  fetchInsights: (query?: DashboardQuery) => Promise<void>;
  setPeriod: (period: DashboardQuery['period']) => void;
  clearError: () => void;
}

/**
 * Dashboard Store (Zustand)
 */
export const useDashboardStore = create<DashboardStore>((set, get) => ({
  dashboard: null,
  insights: [],
  isLoading: false,
  error: null,
  lastFetch: null,
  period: 'month',

  fetchDashboard: async (query?: DashboardQuery) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getDashboard(query || { period: get().period });

      if (response.success && response.data) {
        set({
          dashboard: response.data,
          lastFetch: Date.now(),
          isLoading: false,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch dashboard');
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch dashboard',
        isLoading: false,
      });
    }
  },

  fetchInsights: async (query?: DashboardQuery) => {
    try {
      const response = await dashboardApi.getInsights(query);

      if (response.success && response.data) {
        set({ insights: response.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch insights:', error);
    }
  },

  setPeriod: (period: DashboardQuery['period']) => {
    set({ period });
  },

  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Assets Store (Zustand)
 */
interface AssetsStore {
  assets: any[];
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;

  fetchAssets: (page?: number) => Promise<void>;
  addAsset: (asset: any) => void;
  removeAsset: (id: string) => void;
  clearError: () => void;
}

export const useAssetsStore = create<AssetsStore>((set, get) => ({
  assets: [],
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,

  fetchAssets: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      // API call here
      set({ page, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addAsset: (asset: any) => {
    set((state) => ({ assets: [...state.assets, asset] }));
  },

  removeAsset: (id: string) => {
    set((state) => ({ assets: state.assets.filter((a) => a.id !== id) }));
  },

  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Inventory Store (Zustand)
 */
interface InventoryStore {
  items: any[];
  isLoading: boolean;
  error: string | null;

  fetchInventory: () => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchInventory: async () => {
    set({ isLoading: true, error: null });
    try {
      // API call here
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateItem: async (id: string, quantity: number) => {
    try {
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Procurement Store (Zustand)
 */
interface ProcurementStore {
  orders: any[];
  isLoading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  createOrder: (order: any) => Promise<void>;
  updateOrder: (id: string, data: any) => Promise<void>;
  clearError: () => void;
}

export const useProcurementStore = create<ProcurementStore>((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      // API call here
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createOrder: async (order: any) => {
    try {
      set((state) => ({ orders: [...state.orders, order] }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateOrder: async (id: string, data: any) => {
    try {
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? { ...order, ...data } : order
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
