# MetricBI Mobile App - Developer Onboarding Checklist

## 🎯 Pre-Development Setup

### Environment Setup
- [ ] Node.js v18+ installed
- [ ] npm or yarn package manager
- [ ] Expo CLI installed: `npm install -g expo-cli`
- [ ] iOS Simulator (Mac) or Android Emulator installed
- [ ] `.env.local` file created with API URL

### Project Setup
- [ ] Clone repository
- [ ] Navigate to `application/` directory
- [ ] Run `npm install`
- [ ] Verify build: `npm run lint`
- [ ] Start dev server: `npm start`

---

## 📚 Understanding the Architecture

### Core Concepts (Read in order)
1. [ ] Read [README.md](./README.md) - Overview & quick start
2. [ ] Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture
3. [ ] Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick lookup
4. [ ] Review file structure in project

### Key Files to Study
- [ ] `app/_layout.tsx` - Root navigation
- [ ] `src/common/api/client.ts` - API client setup
- [ ] `src/common/api/services.ts` - API endpoints
- [ ] `src/common/store/auth.store.ts` - Example store
- [ ] `src/common/types/index.ts` - Type definitions
- [ ] `src/common/hooks/index.ts` - Custom hooks

### Routing & Navigation
- [ ] Understand Expo Router file-based routing
- [ ] Know difference between auth stack and app stack
- [ ] Understand bottom tab navigation structure
- [ ] Review dynamic routing patterns

---

## 🛠️ Development Setup

### Editor Configuration
- [ ] VS Code installed
- [ ] Extensions:
  - [ ] ES7+ React/Redux/React-Native snippets
  - [ ] TypeScript Vue Plugin
  - [ ] Prettier - Code formatter
  - [ ] ESLint

### TypeScript Understanding
- [ ] Know TypeScript basics
- [ ] Understand interfaces vs types
- [ ] Know how to define component props
- [ ] Understand utility types

### React/React Native Basics
- [ ] Know React hooks (useState, useEffect, useContext)
- [ ] Understand functional components
- [ ] Know React.memo for optimization
- [ ] Understand component lifecycle

---

## 🎨 UI Components Reference

### When Building a Screen

#### 1. Import Components
```typescript
import { Button, Card, Input, Loading, ErrorMessage, Badge } from '@common/components';
```

#### 2. Use These for Common Patterns

- **Loading Data**: `<Loading size="large" />`
- **Show Errors**: `<ErrorMessage message={error} />`
- **Display Stats**: `<StatCard label="Revenue" value="$1M" />`
- **Form Input**: `<Input label="Email" value={email} onChangeText={setEmail} />`
- **Action Button**: `<Button title="Save" onPress={handleSave} />`
- **Section Title**: `<SectionHeader title="Sales" />`
- **Status Badge**: `<Badge label="Active" variant="success" />`
- **List Item**: `<ListItem title="Product" subtitle="Details" />`

#### 3. Follow Pattern
- [ ] Define component props interface
- [ ] Use `useState` for local state
- [ ] Use store for global state
- [ ] Handle loading states
- [ ] Always show errors
- [ ] Add proper TypeScript types

---

## 🔐 State Management Guide

### When to Use What

| Need | Solution | Example |
|------|----------|---------|
| Global auth state | `useAuthStore()` | `const { user, login } = useAuthStore()` |
| Dashboard data | `useDashboardStore()` | `const { dashboard, fetchDashboard } = useDashboardStore()` |
| Form data | `useForm()` hook | `const { values, handleChange } = useForm({})` |
| API call | `useApi()` hook | `const { execute, isLoading } = useApi('POST')` |
| Fetch data | `useFetch()` hook | `const { data, error } = useFetch(url)` |
| Search | `useSearch()` hook | `const { results } = useSearch(searchFn)` |
| Pagination | `usePagination()` hook | `const { page, goToNextPage } = usePagination()` |

### Never Do
- ❌ Create new stores for every feature (use hooks instead)
- ❌ Store API data in Redux/Context (use Zustand stores)
- ❌ Multiple useState for related data (use useForm)
- ❌ Fetch data in render (use useEffect)

---

## 📡 API Integration Checklist

### When Adding New API Endpoint

1. [ ] Add endpoint to `src/common/api/services.ts`
   ```typescript
   export const myApi = {
     getMyData: async () => {
       const client = ApiClient.getInstance();
       const { data } = await client.get('/my-endpoint');
       return data;
     }
   }
   ```

2. [ ] Add TypeScript type in `src/common/types/index.ts`
   ```typescript
   export interface MyData {
     id: string;
     name: string;
   }
   ```

3. [ ] Create/update Zustand store if needed
   ```typescript
   const useMyStore = create<MyStoreType>(...)
   ```

4. [ ] Use in component
   ```typescript
   const { data, isLoading, error } = useFetch('/my-endpoint');
   ```

---

## 🧪 Testing Checklist

### Before Submitting Code

- [ ] No TypeScript errors: `npm run lint`
- [ ] Run on iOS Simulator: `npm run ios`
- [ ] Run on Android Emulator: `npm run android`
- [ ] Test on real device if possible
- [ ] All screens render without errors
- [ ] Navigation working properly
- [ ] API calls working
- [ ] Error states handled
- [ ] Loading states showing
- [ ] No console warnings

### Common Issues

| Issue | Solution |
|-------|----------|
| Cannot connect to API | Check `EXPO_PUBLIC_API_URL` in `.env.local` |
| Module not found | Check import path and file name (kebab-case) |
| TypeScript error | Check type definition in `types/index.ts` |
| Navigation not working | Check Expo Router file structure |
| Store not updating | Check store state setter is called |
| Styling looks off | Check platform-specific styles |

---

## 📋 Screen Development Checklist

When creating a new screen, ensure:

- [ ] **File Organization**
  - [ ] Screen file in correct feature folder
  - [ ] Proper naming convention (kebab-case)
  - [ ] Added to routing in `app/_layout.tsx`

- [ ] **TypeScript**
  - [ ] All variables have types
  - [ ] Component props interface defined
  - [ ] No `any` types unless unavoidable

- [ ] **UI/UX**
  - [ ] Consistent styling with theme
  - [ ] Proper spacing and padding
  - [ ] Responsive to different screen sizes
  - [ ] Touch targets 48px minimum

- [ ] **Functionality**
  - [ ] Data fetches on mount
  - [ ] Loading state shown
  - [ ] Errors displayed to user
  - [ ] Refresh functionality works
  - [ ] All buttons functional

- [ ] **Accessibility**
  - [ ] Text readable (contrast)
  - [ ] Touch targets large enough
  - [ ] Error messages clear
  - [ ] No color-only information

- [ ] **Performance**
  - [ ] No unnecessary re-renders
  - [ ] Memoized expensive components
  - [ ] Images optimized
  - [ ] No memory leaks

- [ ] **Navigation**
  - [ ] Back button works
  - [ ] Can navigate to this screen
  - [ ] Can navigate from this screen
  - [ ] Deep linking possible

---

## 🎯 Common Patterns

### Pattern 1: Display Loading, Error, Data

```typescript
if (isLoading) return <Loading />;
if (error) return <ErrorMessage message={error} />;
if (!data) return <Empty />;

return <View>{/* render data */}</View>;
```

### Pattern 2: Form Submission

```typescript
const { values, errors, isSubmitting, handleChange, handleSubmit } = 
  useForm(initialValues, async (values) => {
    await apiCall(values);
  });

<Input 
  value={values.email}
  onChangeText={(v) => handleChange('email', v)}
  error={errors.email}
/>
```

### Pattern 3: List with Pagination

```typescript
const { page, goToNextPage } = usePagination();
const { data, isLoading } = useFetch(`/items?page=${page}`);

<FlatList data={data} renderItem={renderItem} />
<Button title="Load More" onPress={goToNextPage} />
```

### Pattern 4: API Call on Screen Enter

```typescript
useEffect(() => {
  fetchData();
}, [fetchData]); // Dependencies

return <RefreshList onRefresh={fetchData}>{/* ... */}</RefreshList>;
```

---

## 📚 Learning Resources

### Essential Reading
- [ ] [Expo Documentation](https://docs.expo.dev/)
- [ ] [Expo Router Guide](https://docs.expo.dev/router/)
- [ ] [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [ ] [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Video Tutorials
- [ ] Expo Router basics
- [ ] React Native styling
- [ ] TypeScript for React
- [ ] State management patterns

### Example Code
- [ ] Study existing screens
- [ ] Review component implementations
- [ ] Check store patterns
- [ ] Review hook implementations

---

## 🚀 First Task Checklist

### Your First Screen Feature

1. [ ] **Plan**
   - [ ] Define screen requirements
   - [ ] Sketch UI layout
   - [ ] Plan state management
   - [ ] List API endpoints needed

2. [ ] **Define Types**
   - [ ] Add interfaces to `types/index.ts`
   - [ ] Create request/response types

3. [ ] **Create API Service**
   - [ ] Add endpoints to `api/services.ts`
   - [ ] Test with backend

4. [ ] **Create Store (if needed)**
   - [ ] Add store in `store/index.ts`
   - [ ] Implement state and actions

5. [ ] **Build Components**
   - [ ] Create any custom components
   - [ ] Style with app theme

6. [ ] **Create Screen**
   - [ ] Create screen file
   - [ ] Add to routing
   - [ ] Connect to store/API

7. [ ] **Test**
   - [ ] Test all functionality
   - [ ] Check error handling
   - [ ] Verify UI on devices

8. [ ] **Review**
   - [ ] Code review
   - [ ] Performance check
   - [ ] Accessibility check

---

## 💡 Pro Tips

- **Use Absolute Imports**: `import { Button } from '@common/components'` (not relative paths)
- **Component Props**: Always define props interface at top of component
- **Error Handling**: Always show errors to user, never silently fail
- **Loading States**: Show loading when fetching, never leave user wondering
- **TypeScript**: Be strict with types, use interfaces not any
- **Reuse**: Before creating new component, check if one exists
- **Performance**: Use React.memo for expensive renders
- **Debugging**: Use React Native Debugger for inspection
- **Testing**: Test on real device, not just simulator
- **Documentation**: Comment complex logic

---

## 📞 Quick Help

### I need to...

- **...fetch data**: Use `useFetch()` or `dashboardApi.get*()`
- **...submit a form**: Use `useForm()` + `useApi()`
- **...manage auth**: Use `useAuthStore()` and `useAuth()`
- **...navigate**: Use Expo Router file structure
- **...display data**: Use appropriate UI components
- **...handle errors**: Show `<ErrorMessage>` component
- **...show loading**: Use `<Loading>` component
- **...store credentials**: Use `ApiClient.storeCredentials()`

---

## ✅ Ready to Start?

When you've completed all checkboxes above, you're ready to:

1. [ ] Create your first feature
2. [ ] Add new screens
3. [ ] Implement functionality
4. [ ] Get code reviewed
5. [ ] Deploy to app stores

---

**Good luck! 🚀**

Remember: If something is unclear, check:
1. `ARCHITECTURE.md` for detailed info
2. Existing screen files for examples
3. Component source code for implementation
4. `package.json` for dependencies

**Last Updated**: May 2026
