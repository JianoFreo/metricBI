/**
 * Hooks Module Exports
 * Includes both custom hooks and base hook utilities
 */

import { useState, useEffect, useCallback } from 'react';
import ApiClient from '../api/client';

// Export base hook utilities
export {
  useAsyncOperation,
  useFormState,
  useFetchData,
  useSearch,
  usePagination,
  useDebounce,
  usePreviousValue,
  useLocalStorage,
  useIsMounted,
  usePreviousProps,
} from './base.hooks';
export type { BaseHookOptions } from './base.hooks';

/**
 * Custom hook for fetching data with loading and error states
 */
export const useFetch = <T,>(
  url: string,
  options?: {
    immediate?: boolean;
    dependencies?: any[];
    params?: Record<string, any>;
  }
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = ApiClient.getInstance();
      const response = await client.get<any>(url, {
        params: options?.params,
      });
      setData(response.data?.data || response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [url, options?.params]);

  useEffect(() => {
    if (options?.immediate !== false) {
      fetchData();
    }
  }, options?.dependencies || [url]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Custom hook for POST/PUT/DELETE API calls
 */
export const useApi = <T,>(
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (url: string, data?: any): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const client = ApiClient.getInstance();
        let response;

        if (method === 'POST') {
          response = await client.post<T>(url, data);
        } else if (method === 'PUT') {
          response = await client.put<T>(url, data);
        } else if (method === 'PATCH') {
          response = await client.patch<T>(url, data);
        } else if (method === 'DELETE') {
          response = await client.delete<T>(url);
        }

        return response?.data?.data || null;
      } catch (err: any) {
        const message = err.response?.data?.error || err.message || 'API call failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [method]
  );

  return { execute, isLoading, error };
};

/**
 * Custom hook for debounced search
 */
export const useSearch = <T,>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 500
) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const data = await searchFn(query);
          setResults(data);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, searchFn, delay]);

  return { query, setQuery, results, isSearching };
};

/**
 * Custom hook for pagination
 */
export const usePagination = (initialPage: number = 1, pageSize: number = 20) => {
  const [page, setPage] = useState(initialPage);

  const goToNextPage = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPage((p) => (p > 1 ? p - 1 : p));
  }, []);

  const goToPage = useCallback((pageNum: number) => {
    setPage(pageNum);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    page,
    pageSize,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    reset,
    offset: (page - 1) * pageSize,
  };
};

/**
 * Custom hook for form state management
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit?: (values: T) => Promise<void>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (key: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      // Clear error for this field
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error: any) {
      setErrors(error.validationErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
};

/**
 * Custom hook for theme/color scheme
 */
export const useTheme = () => {
  const colors = {
    primary: '#4F46E5',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    onSurface: '#1F2937',
    border: '#E5E7EB',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#D1D5DB',
    },
  };

  return { colors };
};
