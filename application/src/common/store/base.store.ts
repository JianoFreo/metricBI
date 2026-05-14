/**
 * Base Store Class
 * Provides common store functionality and patterns
 */

export interface StoreState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Abstract base class for all stores
 */
export abstract class BaseStore<S extends StoreState = StoreState> {
  protected state: S;
  protected listeners: Set<(state: S) => void> = new Set();

  constructor(initialState: S) {
    this.state = initialState;
  }

  /**
   * Get current state
   */
  getState(): S {
    return { ...this.state };
  }

  /**
   * Set state
   */
  protected setState(updates: Partial<S>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: S) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  protected notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  /**
   * Reset to initial state
   */
  abstract reset(): void;

  /**
   * Clear error
   */
  clearError(): void {
    this.setState({ error: null } as Partial<S>);
  }

  /**
   * Set error
   */
  protected setError(error: string): void {
    this.setState({ error } as Partial<S>);
  }

  /**
   * Set loading
   */
  protected setLoading(isLoading: boolean): void {
    this.setState({ isLoading } as Partial<S>);
  }
}

/**
 * Entity Store - Base class for CRUD operations
 */
export abstract class EntityStore<T extends { id: string }> extends BaseStore<
  StoreState & { items: T[] }
> {
  constructor(initialState: StoreState & { items: T[] }) {
    super(initialState);
  }

  /**
   * Get all items
   */
  getItems(): T[] {
    return [...this.state.items];
  }

  /**
   * Get item by ID
   */
  getItemById(id: string): T | undefined {
    return this.state.items.find((item) => item.id === id);
  }

  /**
   * Add item
   */
  addItem(item: T): void {
    const exists = this.state.items.some((i) => i.id === item.id);
    if (!exists) {
      this.setState({
        items: [...this.state.items, item],
      } as Partial<typeof this.state>);
    }
  }

  /**
   * Update item
   */
  updateItem(id: string, updates: Partial<T>): void {
    const items = this.state.items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.setState({ items } as Partial<typeof this.state>);
  }

  /**
   * Remove item
   */
  removeItem(id: string): void {
    const items = this.state.items.filter((item) => item.id !== id);
    this.setState({ items } as Partial<typeof this.state>);
  }

  /**
   * Clear all items
   */
  clearItems(): void {
    this.setState({ items: [] } as Partial<typeof this.state>);
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.setState({
      items: [],
      isLoading: false,
      error: null,
    } as Partial<typeof this.state>);
  }
}

/**
 * Authentication Store Base
 */
export interface AuthStoreState extends StoreState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

export abstract class AuthStoreBase extends BaseStore<AuthStoreState> {
  constructor(initialState: AuthStoreState) {
    super(initialState);
  }

  /**
   * Get current user
   */
  getUser(): any {
    return this.state.user;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return this.state.token;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Set user and token
   */
  protected setAuthData(user: any, token: string): void {
    this.setState({
      user,
      token,
      isAuthenticated: true,
      error: null,
    } as Partial<AuthStoreState>);
  }

  /**
   * Clear auth data
   */
  protected clearAuthData(): void {
    this.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    } as Partial<AuthStoreState>);
  }

  /**
   * Abstract login method
   */
  abstract login(email: string, password: string): Promise<void>;

  /**
   * Abstract logout method
   */
  abstract logout(): Promise<void>;

  /**
   * Reset store
   */
  reset(): void {
    this.clearAuthData();
  }
}

/**
 * Async Operation Store Base
 */
export interface AsyncOperationState extends StoreState {
  data: any;
  lastFetch: number | null;
}

export abstract class AsyncOperationStore extends BaseStore<AsyncOperationState> {
  protected cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  constructor(initialState: AsyncOperationState) {
    super(initialState);
  }

  /**
   * Get data
   */
  getData(): any {
    return this.state.data;
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(): boolean {
    if (!this.state.lastFetch) return false;
    const now = Date.now();
    return now - this.state.lastFetch < this.cacheExpiry;
  }

  /**
   * Set data with timestamp
   */
  protected setData(data: any): void {
    this.setState({
      data,
      lastFetch: Date.now(),
      error: null,
    } as Partial<AsyncOperationState>);
  }

  /**
   * Clear data
   */
  protected clearData(): void {
    this.setState({
      data: null,
      lastFetch: null,
    } as Partial<AsyncOperationState>);
  }

  /**
   * Abstract fetch method
   */
  abstract fetch(): Promise<void>;

  /**
   * Reset store
   */
  reset(): void {
    this.clearData();
    this.clearError();
  }
}
