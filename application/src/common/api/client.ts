import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

/**
 * API Configuration
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Storage Keys
 */
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
  TENANT_ID: 'tenant_id',
};

/**
 * API Client Service
 * Singleton instance for all API calls
 */
class ApiClient {
  private static instance: AxiosInstance;
  private static tokenRefreshPromise: Promise<string | null> | null = null;

  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Request interceptor: Add token to headers
      this.instance.interceptors.request.use(
        async (config) => {
          try {
            const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Error retrieving token:', error);
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptor: Handle token refresh
      this.instance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Prevent multiple refresh attempts
            if (!this.tokenRefreshPromise) {
              this.tokenRefreshPromise = this.refreshToken();
            }

            try {
              const newToken = await this.tokenRefreshPromise;
              this.tokenRefreshPromise = null;

              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.instance(originalRequest);
              } else {
                // Refresh failed, redirect to login
                this.handleLogout();
              }
            } catch (refreshError) {
              this.handleLogout();
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        }
      );
    }

    return this.instance;
  }

  /**
   * Refresh authentication token
   */
  private static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        console.error('No refresh token available');
        return null;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });
      const { data } = response;

      if (data.data?.token) {
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, data.data.token);
        if (data.data.refreshToken) {
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
        }
        return data.data.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return null;
  }

  /**
   * Handle logout on auth failure
   */
  private static async handleLogout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TENANT_ID);
      // Trigger logout event (handled by auth store)
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Store credentials securely
   */
  static async storeCredentials(
    token: string,
    user: any,
    tenantId: string,
    refreshToken?: string | null
  ): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
      if (refreshToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
      await SecureStore.setItemAsync(STORAGE_KEYS.TENANT_ID, tenantId);
    } catch (error) {
      console.error('Error storing credentials:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored credentials
   */
  static async getStoredCredentials(): Promise<{
    token: string | null;
    user: any | null;
    tenantId: string | null;
  }> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      const tenantId = await SecureStore.getItemAsync(STORAGE_KEYS.TENANT_ID);

      return {
        token,
        user: userStr ? JSON.parse(userStr) : null,
        tenantId,
      };
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return { token: null, user: null, tenantId: null };
    }
  }

  /**
   * Clear all stored credentials
   */
  static async clearCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TENANT_ID);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  }
}

export default ApiClient;
export { STORAGE_KEYS };
