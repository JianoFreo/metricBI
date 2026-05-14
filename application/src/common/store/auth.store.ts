import { create } from 'zustand';
import { User, AuthState, LoginCredentials, AuthResponse } from '../types';
import { authApi } from '../api/services';
import ApiClient, { STORAGE_KEYS } from '../api/client';
import * as SecureStore from 'expo-secure-store';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  restoreToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

/**
 * Auth Store (Zustand)
 * Manages authentication state and operations
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        const { user, token, tokens } = response.data as any;

        // Store credentials securely
        await ApiClient.storeCredentials(token, user, user.tenantId, tokens?.refreshToken);

        set({ user, token, isLoading: false });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      set({ user: null, token: null, isLoading: false, error: null });
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, token: null, isLoading: false });
    }
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);

      if (response.success && response.data) {
        const { user, token, tokens } = response.data as any;

        // Store credentials securely
        await ApiClient.storeCredentials(token, user, user.tenantId, tokens?.refreshToken);

        set({ user, token, isLoading: false });
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  restoreToken: async () => {
    set({ isLoading: true });
    try {
      const credentials = await ApiClient.getStoredCredentials();

      if (credentials.token && credentials.user) {
        set({
          token: credentials.token,
          user: credentials.user,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Token restore error:', error);
      set({ isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
