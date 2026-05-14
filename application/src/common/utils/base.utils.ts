/**
 * Base Utility Functions
 * Centralized utility functions and helpers
 */

import type { ApiError, FormError } from "./base.types";

/**
 * Validation utilities
 */
export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  }

  static isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  }

  static isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" && Object.keys(value).length === 0)
    );
  }

  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidJSON(json: string): boolean {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Formatting utilities
 */
export class FormatUtils {
  static formatCurrency(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  }

  static formatNumber(num: number, decimals: number = 2): string {
    return num.toFixed(decimals);
  }

  static formatDate(
    date: string | Date,
    format: string = "MM/DD/YYYY"
  ): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    switch (format) {
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      default:
        return d.toISOString();
    }
  }

  static formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  static formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString("en-US");
  }

  static formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = now.getTime() - targetDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.formatDate(date);
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  static truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + "...";
  }

  static capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
}

/**
 * Array utilities
 */
export class ArrayUtils {
  static chunk<T>(array: T[], size: number): T[][] {
    if (size <= 0) {
      throw new Error('Chunk size must be greater than 0');
    }
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static unique<T>(array: T[], key?: (item: T) => any): T[] {
    if (!key) {
      return [...new Set(array)];
    }
    const seen = new Set();
    return array.filter((item) => {
      const k = key(item);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  static flatten<T>(array: any[]): T[] {
    return array.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
    }, []);
  }

  static groupBy<T>(array: T[], key: (item: T) => any): Map<any, T[]> {
    const grouped = new Map();
    array.forEach((item) => {
      const k = key(item);
      if (!grouped.has(k)) {
        grouped.set(k, []);
      }
      grouped.get(k).push(item);
    });
    return grouped;
  }

  static sortBy<T>(array: T[], key: (item: T) => any, ascending = true): T[] {
    return [...array].sort((a, b) => {
      const aVal = key(a);
      const bVal = key(b);
      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    });
  }

  static findIndex<T>(
    array: T[],
    predicate: (item: T) => boolean
  ): number {
    return array.findIndex(predicate);
  }

  static moveItem<T>(array: T[], from: number, to: number): T[] {
    const result = [...array];
    const item = result.splice(from, 1)[0];
    result.splice(to, 0, item);
    return result;
  }
}

/**
 * Object utilities
 */
export class ObjectUtils {
  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result: any = {};
    keys.forEach((key) => {
      result[key] = obj[key];
    });
    return result;
  }

  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    const keySet = new Set(keys);
    const result: any = {};
    Object.keys(obj).forEach((key) => {
      if (!keySet.has(key as K)) {
        result[key] = obj[key as keyof T];
      }
    });
    return result;
  }

  static merge<T extends Record<string, any>>(
    target: T,
    source: Partial<T>
  ): T {
    return { ...target, ...source };
  }

  static deepMerge<T extends Record<string, any>>(
    target: T,
    source: Partial<T>
  ): T {
    const result = { ...target };
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key as keyof T];
      const targetValue = result[key as keyof T];

      if (
        typeof sourceValue === "object" &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === "object" &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key as keyof T] = this.deepMerge(
          targetValue as any,
          sourceValue as any
        ) as any;
      } else {
        result[key as keyof T] = sourceValue as any;
      }
    });
    return result;
  }

  static isEmpty(obj: Record<string, any>): boolean {
    return Object.keys(obj).length === 0;
  }

  static keys<T extends Record<string, any>>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  static values<T extends Record<string, any>>(obj: T): T[keyof T][] {
    return Object.values(obj);
  }

  static entries<T extends Record<string, any>>(
    obj: T
  ): Array<[keyof T, T[keyof T]]> {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
  }
}

/**
 * String utilities
 */
export class StringUtils {
  static reverse(str: string): string {
    return str.split("").reverse().join("");
  }

  static repeat(str: string, count: number): string {
    return str.repeat(count);
  }

  static padStart(str: string, length: number, char = " "): string {
    return str.padStart(length, char);
  }

  static padEnd(str: string, length: number, char = " "): string {
    return str.padEnd(length, char);
  }

  static startsWith(str: string, prefix: string): boolean {
    return str.startsWith(prefix);
  }

  static endsWith(str: string, suffix: string): boolean {
    return str.endsWith(suffix);
  }

  static includes(str: string, search: string): boolean {
    return str.includes(search);
  }

  static split(str: string, separator: string | RegExp): string[] {
    return str.split(separator);
  }

  static replace(
    str: string,
    search: string | RegExp,
    replacement: string
  ): string {
    return str.replace(search, replacement);
  }

  static replaceAll(str: string, search: string, replacement: string): string {
    return str.replaceAll(search, replacement);
  }

  static toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, "");
  }

  static toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  static toSnakeCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  }

  static toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, "");
  }
}

/**
 * Error utilities
 */
export class ErrorUtils {
  static isApiError(error: any): error is ApiError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    );
  }

  static isFormError(error: any): error is FormError {
    return (
      typeof error === "object" &&
      error !== null &&
      "field" in error &&
      "message" in error
    );
  }

  static extractErrorMessage(error: any): string {
    if (typeof error === "string") return error;
    if (this.isApiError(error)) return error.message;
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred";
  }

  static parseErrorResponse(response: any): string {
    if (response.data?.message) return response.data.message;
    if (response.data?.error) return response.data.error;
    if (response.message) return response.message;
    return "An error occurred";
  }
}

/**
 * Async utilities
 */
export class AsyncUtils {
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Operation timeout")), ms)
      ),
    ]);
  }

  static retry<T>(
    fn: () => Promise<T>,
    attempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    return fn().catch((error) => {
      if (attempts <= 1) throw error;
      return this.delay(delay).then(() => this.retry(fn, attempts - 1, delay));
    });
  }

  static parallel<T>(promises: Promise<T>[]): Promise<T[]> {
    return Promise.all(promises);
  }

  static sequential<T>(fns: Array<() => Promise<T>>): Promise<T[]> {
    return fns.reduce(
      (prev, fn) => prev.then((results) => fn().then((r) => [...results, r])),
      Promise.resolve([] as T[])
    );
  }
}

/**
 * Storage utilities
 */
export class StorageUtils {
  static setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing "${key}":`, error);
    }
  }

  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (error) {
      console.error(`Error retrieving "${key}":`, error);
      return defaultValue ?? null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }

  static hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  static keys(): string[] {
    return Object.keys(localStorage);
  }
}

/**
 * Environment utilities
 */
export class EnvUtils {
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  static isTest(): boolean {
    return process.env.NODE_ENV === "test";
  }

  static getEnv(key: string, defaultValue?: string): string {
    return process.env[`REACT_APP_${key}`] || defaultValue || "";
  }
}
