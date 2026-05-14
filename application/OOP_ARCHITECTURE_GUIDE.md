# MetricBI OOP Architecture Guide

## Overview

This guide demonstrates how to use the comprehensive OOP framework established in MetricBI. The framework consists of base classes for services, components, hooks, stores, and utilities, all designed for code reuse and maintainability.

## Table of Contents

1. [Service Layer](#service-layer)
2. [Component Architecture](#component-architecture)
3. [Store Management](#store-management)
4. [Custom Hooks](#custom-hooks)
5. [Utilities](#utilities)
6. [Best Practices](#best-practices)

---

## Service Layer

### Using BaseService

The `BaseService` abstract class provides common HTTP methods that all services inherit:

```typescript
import { ServiceFactory } from '@/common/api';

// Get a service instance (singleton)
const authService = ServiceFactory.getAuthService();
const dashboardService = ServiceFactory.getDashboardService();
const assetsService = ServiceFactory.getAssetsService();

// Use standard HTTP methods
try {
  const response = await authService.post<AuthResponse>('/auth/login', {
    email: 'user@example.com',
    password: 'password123',
  });
  
  if (response.success) {
    console.log('Login successful:', response.data);
  }
} catch (error) {
  console.error('Login failed:', error);
}
```

### Available Service Methods

- `get<T>(url, config?)` - GET request
- `post<T>(url, data, config?)` - POST request
- `put<T>(url, data, config?)` - PUT request
- `patch<T>(url, data, config?)` - PATCH request
- `delete<T>(url, config?)` - DELETE request

All methods include:
- Automatic error handling
- Request/response logging
- Type-safe generics
- Retry logic on failure

### Creating Custom Services

To create a custom service extending BaseService:

```typescript
import { BaseService, ServiceFactory } from '@/common/api';
import type { CustomData } from '@/common/types';

class CustomService extends BaseService {
  constructor() {
    super('/api/custom');
  }

  async getCustomData(id: string): Promise<CustomData> {
    const response = await this.get<CustomData>(`/${id}`);
    return response.data!;
  }

  async createCustomData(data: Partial<CustomData>): Promise<CustomData> {
    const response = await this.post<CustomData>('/', data);
    return response.data!;
  }
}

// Register in ServiceFactory
const customService = new CustomService();
```

---

## Component Architecture

### Using BaseComponent

All components inherit from `BaseComponent` for consistent behavior:

```typescript
import React, { ReactNode } from 'react';
import { BaseComponent, BaseComponentProps } from '@/common/components';
import { Text, View } from 'react-native';

interface MyComponentProps extends BaseComponentProps {
  title: string;
  children?: ReactNode;
}

export class MyComponent extends BaseComponent<MyComponentProps> {
  render() {
    const { title, children, className, style } = this.props;

    return (
      <View style={[this.baseStyles.container, style]}>
        <Text style={this.baseStyles.title}>{title}</Text>
        {children}
      </View>
    );
  }
}
```

### Using BaseScreen

For full-screen layouts with refresh control:

```typescript
import { BaseScreen, BaseScreenProps } from '@/common/components';
import { AssetsService } from '@/common/api';
import { Asset } from '@/common/types';

export class AssetsScreen extends BaseScreen<AssetScreenProps> {
  private assetsService = ServiceFactory.getAssetsService();

  async onRefresh() {
    await this.assetsService.getAssets();
  }

  renderContent() {
    const assets = this.props.assets || [];

    return (
      <ScrollView refreshControl={<RefreshControl />}>
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </ScrollView>
    );
  }
}
```

### Using BaseListComponent

For consistent list rendering patterns:

```typescript
import { BaseListComponent } from '@/common/components';
import { Asset } from '@/common/types';

interface AssetListProps extends BaseListComponentProps<Asset> {
  onItemPress?: (item: Asset) => void;
}

export class AssetList extends BaseListComponent<Asset, AssetListProps> {
  renderItem(asset: Asset) {
    return (
      <TouchableOpacity onPress={() => this.props.onItemPress?.(asset)}>
        <View>
          <Text>{asset.name}</Text>
          <Text>${asset.value}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderEmpty() {
    return <Text>No assets found</Text>;
  }
}
```

### Using BaseFormComponent

For form management and validation:

```typescript
import { BaseFormComponent } from '@/common/components';

interface LoginFormData {
  email: string;
  password: string;
}

export class LoginForm extends BaseFormComponent<LoginFormData> {
  protected initialValues: LoginFormData = {
    email: '',
    password: '',
  };

  async onSubmit(data: LoginFormData) {
    const authService = ServiceFactory.getAuthService();
    await authService.post('/auth/login', data);
  }

  render() {
    const { values, errors, isSubmitting, handleChange } = this.formState;

    return (
      <View>
        <TextInput
          placeholder="Email"
          value={values.email}
          onChangeText={(text) => handleChange('email', text)}
          editable={!isSubmitting}
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={values.password}
          onChangeText={(text) => handleChange('password', text)}
          editable={!isSubmitting}
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <Button
          onPress={() => this.handleFormSubmit()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </View>
    );
  }
}
```

---

## Store Management

### Using BaseStore

Create type-safe stores with state management:

```typescript
import { BaseStore, type StoreState } from '@/common/store';

interface DashboardStoreState extends StoreState {
  dashboard: Dashboard | null;
  metrics: DashboardMetrics | null;
}

class DashboardStore extends BaseStore<DashboardStoreState> {
  constructor() {
    super({
      dashboard: null,
      metrics: null,
      isLoading: false,
      error: null,
    });
  }

  async fetchDashboard() {
    this.setLoading(true);
    try {
      const service = ServiceFactory.getDashboardService();
      const dashboard = await service.get<Dashboard>('/dashboard');
      
      this.setState({
        dashboard: dashboard.data,
        isLoading: false,
      });
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to fetch dashboard');
    }
  }

  reset() {
    this.setState({
      dashboard: null,
      metrics: null,
      isLoading: false,
      error: null,
    });
  }
}

export const dashboardStore = new DashboardStore();
```

### Using EntityStore

For CRUD operations on collections:

```typescript
import { EntityStore } from '@/common/store';
import type { Asset } from '@/common/types';

class AssetStore extends EntityStore<Asset> {
  constructor() {
    super({
      items: [],
      isLoading: false,
      error: null,
    });
  }

  async loadAssets() {
    this.setLoading(true);
    try {
      const service = ServiceFactory.getAssetsService();
      const response = await service.get<Asset[]>('/assets');
      
      response.data?.forEach(asset => this.addItem(asset));
      this.setLoading(false);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to load assets');
    }
  }

  reset() {
    this.clearItems();
    this.clearError();
  }
}

export const assetStore = new AssetStore();

// Usage
assetStore.subscribe((state) => {
  console.log('Store updated:', state);
});

await assetStore.loadAssets();
const assets = assetStore.getItems();
assetStore.updateItem('asset-1', { status: 'maintenance' });
```

---

## Custom Hooks

### useAsyncOperation

Handle async operations with automatic retry:

```typescript
import { useAsyncOperation } from '@/common/hooks';

export function MyComponent() {
  const { data, loading, error, execute, retry } = useAsyncOperation(
    async () => {
      const service = ServiceFactory.getDashboardService();
      return await service.get<Dashboard>('/dashboard');
    },
    {
      autoRetry: true,
      retryCount: 3,
      onSuccess: (data) => console.log('Success:', data),
      onError: (error) => console.error('Error:', error),
    }
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <ActivityIndicator />;
  if (error) return <Button onPress={() => retry()} title="Retry" />;
  return <Text>{data?.financialSummary.revenue}</Text>;
}
```

### useFormState

Manage form state with validation:

```typescript
import { useFormState } from '@/common/hooks';

export function LoginForm() {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useFormState(
    { email: '', password: '' },
    async (data) => {
      const service = ServiceFactory.getAuthService();
      await service.post('/auth/login', data);
    },
    {
      onSuccess: () => console.log('Login successful'),
      onError: (error) => console.error('Login failed:', error),
    }
  );

  return (
    <View>
      <TextInput
        value={values.email}
        onChange={(e) => handleChange(e)}
        placeholder="Email"
      />
      <TextInput
        value={values.password}
        onChange={(e) => handleChange(e)}
        placeholder="Password"
        secureTextEntry
      />
      <Button
        onPress={handleSubmit}
        disabled={isSubmitting}
        title={isSubmitting ? 'Logging in...' : 'Login'}
      />
    </View>
  );
}
```

### useFetchData

Fetch data with caching:

```typescript
import { useFetchData } from '@/common/hooks';

export function AssetsScreen() {
  const { data, loading, error, refetch } = useFetchData(
    async () => {
      const service = ServiceFactory.getAssetsService();
      const response = await service.get<Asset[]>('/assets');
      return response.data || [];
    },
    [/* dependencies */],
    5 * 60 * 1000 // 5 minute cache
  );

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error loading assets</Text>;

  return (
    <FlatList
      data={data || []}
      renderItem={({ item }) => <AssetItem asset={item} />}
      refreshing={false}
      onRefresh={refetch}
    />
  );
}
```

### useSearch

Search functionality with debouncing:

```typescript
import { useSearch } from '@/common/hooks';

export function SearchAssets({ assets }: { assets: Asset[] }) {
  const { query, setQuery, results } = useSearch(assets, ['name', 'category']);

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search assets..."
      />
      <AssetList items={results} />
    </View>
  );
}
```

### usePagination

Handle pagination easily:

```typescript
import { usePagination } from '@/common/hooks';

export function AssetsPaginatedList({ items }: { items: Asset[] }) {
  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination(items, 10);

  return (
    <View>
      <AssetList items={currentItems} />
      <View>
        <Button
          onPress={prevPage}
          disabled={currentPage === 1}
          title="Previous"
        />
        <Text>{currentPage} / {totalPages}</Text>
        <Button
          onPress={nextPage}
          disabled={currentPage === totalPages}
          title="Next"
        />
      </View>
    </View>
  );
}
```

---

## Utilities

### ValidationUtils

```typescript
import { ValidationUtils } from '@/common/utils';

ValidationUtils.isEmail('user@example.com'); // true
ValidationUtils.isStrongPassword('SecurePass123!'); // true
ValidationUtils.isPhoneNumber('1234567890'); // true
ValidationUtils.isEmpty([]); // true
ValidationUtils.isValidURL('https://example.com'); // true
```

### FormatUtils

```typescript
import { FormatUtils } from '@/common/utils';

FormatUtils.formatCurrency(1234.56); // "$1,234.56"
FormatUtils.formatDate('2024-01-15', 'MM/DD/YYYY'); // "01/15/2024"
FormatUtils.formatRelativeTime(Date.now() - 3600000); // "1h ago"
FormatUtils.truncateString('Long text...', 10); // "Long te..."
FormatUtils.capitalizeFirstLetter('hello'); // "Hello"
```

### ArrayUtils

```typescript
import { ArrayUtils } from '@/common/utils';

ArrayUtils.chunk([1, 2, 3, 4], 2); // [[1, 2], [3, 4]]
ArrayUtils.unique([1, 2, 2, 3]); // [1, 2, 3]
ArrayUtils.flatten([[1, 2], [3, 4]]); // [1, 2, 3, 4]
ArrayUtils.groupBy(assets, (a) => a.category);
ArrayUtils.sortBy(assets, (a) => a.value, false); // descending
```

### ObjectUtils

```typescript
import { ObjectUtils } from '@/common/utils';

const user = { id: '1', name: 'John', email: 'john@example.com' };
ObjectUtils.pick(user, ['name', 'email']); // { name, email }
ObjectUtils.omit(user, ['email']); // { id, name }
ObjectUtils.merge(user, { name: 'Jane' }); // updated user
ObjectUtils.deepMerge(obj1, obj2);
```

### ErrorUtils

```typescript
import { ErrorUtils } from '@/common/utils';

try {
  // some operation
} catch (error) {
  const message = ErrorUtils.extractErrorMessage(error);
  console.log(message);
}
```

### AsyncUtils

```typescript
import { AsyncUtils } from '@/common/utils';

// Retry failed operations
const result = await AsyncUtils.retry(
  () => apiCall(),
  3, // attempts
  1000 // delay
);

// Timeout protection
const data = await AsyncUtils.timeout(fetchData(), 5000);

// Run promises in sequence
const results = await AsyncUtils.sequential([
  () => service.fetch1(),
  () => service.fetch2(),
  () => service.fetch3(),
]);
```

---

## Best Practices

### 1. Always Use ServiceFactory

```typescript
// ✅ Good - Use singleton instances
const authService = ServiceFactory.getAuthService();

// ❌ Avoid - Creating new instances
const authService = new AuthService();
```

### 2. Extend Base Classes

```typescript
// ✅ Good - Extend BaseScreen for full-screen components
class DashboardScreen extends BaseScreen {
  renderContent() { /* ... */ }
}

// ✅ Good - Extend EntityStore for collections
class AssetStore extends EntityStore<Asset> {}

// ❌ Avoid - Using functional components when base classes apply
const DashboardScreen = (props) => { /* ... */ };
```

### 3. Use Type-Safe Generics

```typescript
// ✅ Good - Specify types explicitly
const response = await service.get<Dashboard>('/dashboard');

// ⚠️ Okay - Type inference (less safe)
const response = await service.get('/dashboard');
```

### 4. Centralize Error Handling

```typescript
// ✅ Good - Use base class error handling
class MyService extends BaseService {
  async doSomething() {
    // Error handling is automatic
  }
}

// ❌ Avoid - Manual try-catch everywhere
async function doSomething() {
  try {
    // ...
  } catch (error) {
    // Handle
  }
}
```

### 5. Use Store Subscribers

```typescript
// ✅ Good - Subscribe to state changes
const unsubscribe = store.subscribe((state) => {
  console.log('State updated:', state);
});

// Cleanup
unsubscribe();
```

### 6. Leverage Hook Composition

```typescript
// ✅ Good - Compose multiple hooks
export function MyScreen() {
  const { data: assets } = useFetchData(fetchAssets);
  const { results, query, setQuery } = useSearch(assets, ['name']);
  const { currentItems } = usePagination(results, 10);

  return (
    <View>
      <TextInput value={query} onChangeText={setQuery} />
      <AssetList items={currentItems} />
    </View>
  );
}
```

### 7. Use Utility Classes for Common Operations

```typescript
// ✅ Good - Use utility classes
const formatted = FormatUtils.formatCurrency(amount);
const valid = ValidationUtils.isEmail(email);
const chunks = ArrayUtils.chunk(items, 10);

// ❌ Avoid - Inline implementations
const formatted = `$${amount.toFixed(2)}`;
const valid = /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Screens using BaseScreen, BaseListComponent, etc.)        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   State Management Layer                      │
│  (Stores using BaseStore, EntityStore, AsyncOperationStore) │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  (Services extending BaseService via ServiceFactory)        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Client Layer                           │
│            (Axios with interceptors & error handling)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend API                                │
│            (Express.js with MongoDB)                        │
└─────────────────────────────────────────────────────────────┘

Cross-cutting concerns:
- Utilities (ValidationUtils, FormatUtils, etc.)
- Custom Hooks (useAsyncOperation, useFormState, etc.)
- Types (BaseEntity, BaseTypes, etc.)
```

---

## Conclusion

The OOP architecture in MetricBI provides:

✅ **Code Reusability** - Base classes eliminate duplication
✅ **Type Safety** - Full TypeScript support with generics
✅ **Error Handling** - Centralized in base classes
✅ **Maintainability** - Clear inheritance hierarchy
✅ **Scalability** - Easy to extend and customize
✅ **Developer Experience** - Consistent patterns across codebase

By following these patterns and best practices, you'll maintain a clean, scalable, and maintainable codebase.
