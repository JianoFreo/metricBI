# MetricBI OOP Implementation Checklist

## Overview

This checklist guides you through refactoring the MetricBI frontend to fully utilize the OOP architecture. Follow the checkpoints in order for best results.

---

## Phase 1: Foundation ✅ COMPLETE

### Core Infrastructure
- [x] Create BaseService abstract class with HTTP methods
- [x] Create 7 service classes (Auth, Dashboard, Assets, Inventory, Procurement, Chat, Reports)
- [x] Create ServiceFactory singleton pattern
- [x] Create BaseComponent class hierarchy (BaseComponent, BaseState, BaseScreen, List, Form)
- [x] Create BaseStore with state management
- [x] Create BaseHooks utility functions
- [x] Create base types definitions (30+ interfaces)
- [x] Create utility classes (Validation, Format, Array, Object, String, Error, Async, Storage, Env)
- [x] Update all index files with exports
- [x] Create OOP_ARCHITECTURE_GUIDE.md documentation

**Status**: 6 foundation files created (2,650+ lines)

---

## Phase 2: Service Layer Refactoring 🔄 IN-PROGRESS

### Current State
- `src/common/api/services.ts` - Function-based services
- Uses direct axios calls without error handling layer

### Refactoring Steps

#### Step 1: Analyze Current Services
- [ ] Review `src/common/api/services.ts` structure
- [ ] Identify all API endpoints used
- [ ] Document service method signatures
- [ ] List all error handling patterns

#### Step 2: Create OOP Service Implementation
- [ ] Update AuthService to handle all auth endpoints
- [ ] Update DashboardService with all dashboard queries
- [ ] Update AssetsService with CRUD operations
- [ ] Update InventoryService operations
- [ ] Update ProcurementService operations
- [ ] Update ChatService for AI interactions
- [ ] Update ReportsService for report generation

**Procedure for each service:**
```typescript
// Before (function-based)
export const authApi = {
  login: (email, password) => client.post('/auth/login', { ... }),
  logout: () => client.post('/auth/logout'),
};

// After (class-based)
class AuthService extends BaseService {
  async login(email: string, password: string) {
    return this.post<AuthResponse>('/login', { email, password });
  }

  async logout() {
    return this.post<void>('/logout');
  }
}
```

#### Step 3: Update Service Exports
- [ ] Replace function exports with ServiceFactory calls
- [ ] Update `src/common/api/index.ts` exports
- [ ] Test ServiceFactory singleton pattern
- [ ] Verify all services are accessible

#### Step 4: Test Services
- [ ] Test AuthService login/logout flow
- [ ] Test DashboardService data fetching
- [ ] Test error handling in all services
- [ ] Verify logging works correctly
- [ ] Test retry logic on failures

**Progress**: ___ / 7 services completed

---

## Phase 3: Store Layer Refactoring 🔄 IN-PROGRESS

### Current State
- `src/common/store/index.ts` - Zustand stores (4 stores)
- Mix of direct API calls and state management

### Refactoring Steps

#### Step 1: Create OOP Stores
- [ ] Create DashboardStore extending AsyncOperationStore
- [ ] Create AssetStore extending EntityStore
- [ ] Create InventoryStore extending EntityStore
- [ ] Create ProcurementStore extending EntityStore

**Pattern:**
```typescript
class DashboardStore extends AsyncOperationStore {
  protected cacheExpiry = 5 * 60 * 1000;

  async fetch() {
    this.setLoading(true);
    try {
      const service = ServiceFactory.getDashboardService();
      const data = await service.get<Dashboard>('/dashboard');
      this.setData(data.data);
    } catch (error) {
      this.setError(error.message);
    }
  }
}
```

#### Step 2: Hybrid Zustand + OOP Approach
- [ ] Keep Zustand for React integration
- [ ] Use OOP stores internally for logic
- [ ] Expose OOP store methods through Zustand

**Example:**
```typescript
const oop_store = new DashboardStore();

export const useDashboardStore = create(() => ({
  dashboard: null,
  isLoading: false,
  error: null,

  fetchDashboard: async (query) => {
    await oop_store.fetch(query);
    return oop_store.getState();
  },
}));
```

#### Step 3: Update Store Usage in Components
- [ ] Update store imports in screens
- [ ] Test store subscriptions
- [ ] Verify state updates propagate
- [ ] Check cache behavior

**Progress**: ___ / 4 stores created

---

## Phase 4: Screen Refactoring 🔄 IN-PROGRESS

### Current State
- 9 screens in `src/app/(tabs)/` and `src/app/(auth)/`
- Using function-based components with manual state management

### Screens to Refactor

#### Dashboard Screen
```
File: src/app/(dashboard)/index.tsx
Status: [ ] Not started
Type: Should extend BaseScreen
Dependencies: DashboardService, DashboardStore
```

**Implementation:**
```typescript
export class DashboardScreen extends BaseScreen {
  private dashboardService = ServiceFactory.getDashboardService();

  async onRefresh() {
    const response = await this.dashboardService.getDashboard();
    // Update state
  }

  renderContent() {
    // Dashboard content here
  }
}
```

#### Assets Screen
```
File: src/app/(assets)/index.tsx
Status: [ ] Not started
Type: Should extend BaseListComponent<Asset>
Dependencies: AssetsService, AssetStore
```

#### Inventory Screen
```
File: src/app/(inventory)/index.tsx
Status: [ ] Not started
Type: Should extend BaseListComponent<InventoryItem>
Dependencies: InventoryService, InventoryStore
```

#### Procurement Screen
```
File: src/app/(procurement)/index.tsx
Status: [ ] Not started
Type: Should extend BaseListComponent<Order>
Dependencies: ProcurementService, ProcurementStore
```

#### Chat Screen
```
File: src/app/(chat)/index.tsx
Status: [ ] Not started
Type: Should extend BaseScreen
Dependencies: ChatService
Note: Interactive, may need custom implementation
```

#### Reports Screen
```
File: src/app/(reports)/index.tsx
Status: [ ] Not started
Type: Should extend BaseListComponent<Report>
Dependencies: ReportsService
```

#### Profile Screen
```
File: src/app/(profile)/index.tsx
Status: [ ] Not started
Type: Should extend BaseScreen
Dependencies: AuthService, UserStore
```

#### Login Screen
```
File: src/app/(auth)/login.tsx
Status: [ ] Not started
Type: Should extend BaseFormComponent
Dependencies: AuthService, AuthStore
Form Fields: email, password
Validation: Email format, min password length
```

#### Register Screen
```
File: src/app/(auth)/register.tsx
Status: [ ] Not started
Type: Should extend BaseFormComponent
Dependencies: AuthService
Form Fields: email, password, confirmPassword, firstName, lastName
Validation: Email, password strength, match confirmPassword
```

#### Refactoring Template

```typescript
import { BaseScreen, BaseScreenProps } from '@/common/components';
import { ServiceFactory } from '@/common/api';
import type { Dashboard } from '@/common/types';

interface DashboardScreenProps extends BaseScreenProps {}

export class DashboardScreen extends BaseScreen<DashboardScreenProps> {
  private dashboardService = ServiceFactory.getDashboardService();

  async onRefresh() {
    try {
      this.setLoading(true);
      const response = await this.dashboardService.get<Dashboard>('/dashboard');
      // Update state with response.data
      this.setLoading(false);
    } catch (error) {
      this.setError(error.message || 'Failed to load dashboard');
    }
  }

  renderContent() {
    return (
      <ScrollView>
        {/* Dashboard content */}
      </ScrollView>
    );
  }
}
```

**Progress**: ___ / 9 screens refactored

---

## Phase 5: Component Library Updates ⏳ OPTIONAL

### Current Components
- Button.tsx
- Card.tsx
- Input.tsx
- Other utility components

### Refactoring Options

#### Option A: Extend BaseComponent (Recommended)
Each component can optionally extend BaseComponent:

```typescript
export class CardComponent extends BaseComponent<CardProps> {
  render() {
    return (
      <View style={[this.baseStyles.container, this.props.style]}>
        {this.props.children}
      </View>
    );
  }
}
```

#### Option B: Keep Functional Components (OK)
If components work well as functions, keep them. Not all components need to be OOP.

**Status**: Depends on preference; both approaches are valid

---

## Phase 6: Hooks Usage 🔄 IN-PROGRESS

### Custom Hooks to Implement

#### Data Fetching Screens
- [ ] Replace useFetch with useAsyncOperation in data screens
- [ ] Implement useSearch in list screens with search
- [ ] Implement usePagination in paginated lists
- [ ] Use useFetchData for caching requirements

#### Form Screens
- [ ] Replace useForm with useFormState in login/register
- [ ] Use useFormState in procurement order forms
- [ ] Add form validation with base hooks

#### General Hooks
- [ ] Use useDebounce for search input
- [ ] Use useLocalStorage for user preferences
- [ ] Use useIsMounted for async cleanup
- [ ] Use usePreviousValue when needed

**Example Usage:**
```typescript
export function SearchAssetsScreen() {
  const { data: allAssets } = useAsyncOperation(
    () => ServiceFactory.getAssetsService().get('/assets')
  );

  const { results, query, setQuery } = useSearch(
    allAssets || [],
    ['name', 'category']
  );

  const { currentItems } = usePagination(results, 10);

  return (
    <View>
      <TextInput value={query} onChangeText={setQuery} />
      <AssetList items={currentItems} />
    </View>
  );
}
```

**Progress**: ___ / 15+ hooks integrated

---

## Phase 7: Type Safety 🔄 IN-PROGRESS

### Type Definition Tasks
- [ ] Replace inline types with base types (User, Asset, Order, etc.)
- [ ] Use ApiResponse<T> for all API responses
- [ ] Add proper error types with ApiError
- [ ] Use FormError for form validations
- [ ] Create component-specific prop types extending BaseComponentProps

### Verification
- [ ] Run TypeScript compiler with strict mode
- [ ] Resolve all type errors
- [ ] Add missing type annotations
- [ ] Test type inference works correctly

**Progress**: ___ % completed

---

## Phase 8: Documentation & Examples

### Documentation Tasks
- [x] Create OOP_ARCHITECTURE_GUIDE.md
- [x] Create IMPLEMENTATION_CHECKLIST.md
- [ ] Add component documentation with examples
- [ ] Add service usage examples
- [ ] Create store design patterns documentation
- [ ] Add hook usage guide with examples
- [ ] Create troubleshooting guide

### Code Examples
- [ ] Example: Creating a new screen (BaseScreen)
- [ ] Example: Creating a new list screen (BaseListComponent)
- [ ] Example: Creating a new form (BaseFormComponent)
- [ ] Example: Creating a new service (extends BaseService)
- [ ] Example: Creating a new store (extends EntityStore)

**Progress**: ___ / 10 documentation items

---

## Phase 9: Testing & Validation

### Unit Tests
- [ ] Test BaseService HTTP methods
- [ ] Test ServiceFactory singleton pattern
- [ ] Test service error handling
- [ ] Test BaseStore state management
- [ ] Test EntityStore CRUD operations
- [ ] Test custom hooks behavior
- [ ] Test utility classes
- [ ] Test store subscribers

### Integration Tests
- [ ] Test screens with services
- [ ] Test store with screens
- [ ] Test hook combinations
- [ ] Test form submission flow
- [ ] Test data fetching and caching
- [ ] Test error recovery flows

### Manual Testing
- [ ] Test login/register flow
- [ ] Test navigation between screens
- [ ] Test data loading and display
- [ ] Test form submissions
- [ ] Test search and filtering
- [ ] Test pagination
- [ ] Test offline behavior
- [ ] Test error states

**Progress**: ___ / 23 tests completed

---

## Phase 10: Performance Optimization

### Caching Strategy
- [ ] Implement cache in services for GET requests
- [ ] Set appropriate TTL for different data types
- [ ] Test cache hit rates

### Memoization
- [ ] Memoize service instances (ServiceFactory ✅)
- [ ] Memoize store instances
- [ ] Memoize expensive computations

### Bundle Size
- [ ] Review base classes for redundancy
- [ ] Optimize utility classes
- [ ] Check for unused utilities
- [ ] Monitor final bundle size

**Progress**: Optimizations ready for implementation

---

## Phase 11: Monitoring & Logging

### Logging
- [ ] Verify logger is called in all services
- [ ] Check logging levels (info, warn, error, debug)
- [ ] Monitor for excessive logging
- [ ] Set up log aggregation if needed

### Error Tracking
- [ ] Verify errors are logged with context
- [ ] Set up error boundary components
- [ ] Create error reporting mechanism
- [ ] Monitor error rates and patterns

**Progress**: Logging infrastructure ready

---

## Completion Checklist

### Functional Completeness
- [ ] All 7 services implemented as OOP classes
- [ ] All 4 stores refactored to OOP patterns
- [ ] All 9 screens refactored to extend base classes
- [ ] All forms use BaseFormComponent
- [ ] All lists use BaseListComponent
- [ ] All data screens use appropriate hooks

### Code Quality
- [ ] No TypeScript errors
- [ ] All utilities used consistently
- [ ] Base classes properly inherited
- [ ] Error handling centralized
- [ ] No code duplication

### Testing & Documentation
- [ ] 80%+ test coverage
- [ ] All features tested manually
- [ ] Developer documentation complete
- [ ] API documentation updated
- [ ] Examples provided for common patterns

### Performance
- [ ] Bundle size acceptable
- [ ] Cache strategy implemented
- [ ] No memory leaks
- [ ] Render performance optimized

### Deployment Ready
- [ ] All features working
- [ ] Error handling complete
- [ ] Logging functional
- [ ] Performance tuned
- [ ] Documentation complete

---

## Estimated Timeline

| Phase | Task | Estimated Time |
|-------|------|-----------------|
| 1 | Foundation (COMPLETED) | ✅ Done |
| 2 | Service Refactoring | 2-3 hours |
| 3 | Store Refactoring | 1-2 hours |
| 4 | Screen Refactoring | 4-6 hours |
| 5 | Component Library | 1-2 hours (optional) |
| 6 | Hooks Integration | 2-3 hours |
| 7 | Type Safety | 1-2 hours |
| 8 | Documentation | 2-3 hours |
| 9 | Testing | 4-5 hours |
| 10 | Performance | 1-2 hours |
| 11 | Monitoring | 1 hour |
| **Total** | | **22-30 hours** |

---

## Rollout Strategy

### Option 1: Incremental (Recommended)
1. Start with service layer refactoring
2. Gradually refactor stores
3. Update screens one by one
4. Test and validate each phase
5. Deploy incrementally with feature flags

### Option 2: Complete Refactor
1. Refactor all layers at once
2. Comprehensive testing
3. Single deployment
4. Risk: Higher impact if issues found

---

## Support & Rollback

### If Issues Arise
1. Check OOP_ARCHITECTURE_GUIDE.md for patterns
2. Review IMPLEMENTATION_CHECKLIST.md for steps
3. Test in development environment first
4. Use feature flags to toggle between old/new
5. Maintain git history for easy rollback

### Common Issues & Solutions
- [ ] Type errors → Check base.types.ts
- [ ] Service not found → Check ServiceFactory
- [ ] State not updating → Verify store subscribers
- [ ] Performance issues → Check caching logic
- [ ] API failures → Verify error handling

---

## Sign-off

- [ ] Team agreed on OOP patterns
- [ ] Development environment set up
- [ ] Checklist reviewed with team
- [ ] Timeline confirmed
- [ ] Rollback plan in place

---

## Next Steps

1. **Start Phase 2** - Service layer refactoring
2. Review services.ts and plan refactoring
3. Create class-based services
4. Test each service before moving to next
5. Document any custom logic
6. Update team on progress

**Ready to begin implementation?** ✅

Start with Section "Phase 2: Service Layer Refactoring" and follow the steps in order.
