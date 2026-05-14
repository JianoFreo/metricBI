/**
 * Base Hook Classes
 * Provides common hook functionality and patterns
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { ServiceFactory } from "../api/base.service";

/**
 * Base Hook interface for common hook properties
 */
export interface BaseHookOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data?: any) => void;
  autoRetry?: boolean;
  retryCount?: number;
}

/**
 * Hook for async operations with loading/error states
 */
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: BaseHookOptions = {}
) {
  const {
    onError,
    onSuccess,
    autoRetry = false,
    retryCount = 0,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryRef = useRef(0);

  const execute = useCallback(
    async (forceRetry = false) => {
      if (forceRetry) retryRef.current = 0;
      setLoading(true);
      setError(null);

      try {
        const result = await operation();
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);

        if (autoRetry && retryRef.current < retryCount) {
          retryRef.current++;
          setTimeout(() => execute(), 1000 * retryRef.current);
        }
      } finally {
        setLoading(false);
      }
    },
    [operation, onError, onSuccess, autoRetry, retryCount]
  );

  return { data, loading, error, execute, retry: () => execute(true) };
}

/**
 * Hook for form state management
 */
export function useFormState<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void> | void,
  options: BaseHookOptions = {}
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { onError, onSuccess } = options;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      setValues((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    },
    []
  );

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        await onSubmit(values);
        onSuccess?.(values);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, onError, onSuccess]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    reset,
  };
}

/**
 * Hook for data fetching with cache
 */
export function useFetchData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  cacheTime: number = 5 * 60 * 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<{
    data: T | null;
    timestamp: number;
  }>({ data: null, timestamp: 0 });

  const isCacheValid = useCallback(() => {
    const now = Date.now();
    return cacheRef.current.timestamp && now - cacheRef.current.timestamp < cacheTime;
  }, [cacheTime]);

  useEffect(() => {
    if (isCacheValid() && cacheRef.current.data) {
      setData(cacheRef.current.data);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();

        if (isMounted) {
          setData(result);
          cacheRef.current = { data: result, timestamp: Date.now() };
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: async () => {
      cacheRef.current.timestamp = 0;
      // Trigger re-fetch by clearing cache
    },
  };
}

/**
 * Hook for search functionality
 */
export function useSearch<T>(items: T[], searchFields: (keyof T)[] = []) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>(items);

  useEffect(() => {
    if (!query.trim()) {
      setResults(items);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = items.filter((item) =>
      searchFields.some((field) => {
        const value = String(item[field] || "").toLowerCase();
        return value.includes(searchTerm);
      })
    );

    setResults(filtered);
  }, [query, items, searchFields]);

  return {
    query,
    setQuery,
    results,
    isSearching: query.length > 0,
  };
}

/**
 * Hook for pagination
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for previous value
 */
export function usePreviousValue<T>(value: T) {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook for local storage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          newValue instanceof Function ? newValue(value) : newValue;
        setValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error storing value for key "${key}":`, error);
      }
    },
    [key, value]
  );

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error(`Error removing value for key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [value, setStoredValue, removeValue] as const;
}

/**
 * Hook for mounting state
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

/**
 * Hook for previous props
 */
export function usePreviousProps<P extends Record<string, any>>(props: P) {
  const prevPropsRef = useRef<P>();

  useEffect(() => {
    prevPropsRef.current = props;
  }, [props]);

  return prevPropsRef.current;
}
