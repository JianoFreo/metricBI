# MetricBI Mobile App - Expo React Native

A production-ready Expo React Native application for business intelligence and asset management.

## Overview

This is the mobile client for MetricBI, providing real-time access to business metrics, asset management, inventory tracking, procurement oversight, and AI-powered insights.

### Key Features
✅ Real-time Dashboard with aggregated metrics  
✅ Asset Inventory Management  
✅ Inventory Stock Level Tracking  
✅ Procurement Order Management  
✅ AI Business Analyst Chat  
✅ Report Generation & Download  
✅ Secure Authentication  
✅ Offline Support Roadmap  

### Architecture

This app follows a feature-based modular architecture with:
- **Expo Router** for file-based navigation
- **Zustand** for lightweight state management
- **Axios** for API consumption
- **TypeScript** for type safety
- **Responsive Design** for all screen sizes

**👉 For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)**

## App Structure

```
application/
├── app/                    # Expo Router screens (file-based routing)
├── src/
│   ├── features/          # Feature modules (auth, dashboard, assets, etc.)
│   ├── common/            # Shared utilities
│   │   ├── api/           # API client & services
│   │   ├── store/         # Zustand stores
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React Context
│   │   └── types/         # TypeScript types
│   └── config/            # App configuration
└── package.json
```

## Screens

### 🔐 Authentication
- **Login** - Email/password authentication
- **Register** - New user registration

### 📊 Main App (Tab Navigation)
- **Dashboard** - Overview of all metrics with AI insights
- **Assets** - Asset inventory with filtering
- **Inventory** - Stock level management
- **Procurement** - Purchase order tracking
- **AI Chat** - Business analysis chatbot
- **Reports** - Generate and download reports
- **Profile** - User settings and account

## Quick Start

### 1. Installation
```bash
cd application
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Start Development
```bash
npm start

# Select platform:
# i → iOS Simulator
# a → Android Emulator
# w → Web Browser
# j → Expo Go (mobile)
```

### 4. Build for Production
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build
```

## App Boundary

**✅ This app handles:**
- UI rendering and user interactions
- API communication with backend
- Local state management
- Credential storage
- Navigation between screens

**❌ This app does NOT handle:**
- Business logic (owned by backend)
- MongoDB/database operations
- Redis caching
- Authentication rules (JWT validation on backend)
- Tenant isolation logic

All business rules, auth, and data validation are enforced by `backend/`.

## Key Components

### State Management (Zustand)
```typescript
// Auth
const { user, token, login, logout } = useAuthStore();

// Dashboard
const { dashboard, fetchDashboard } = useDashboardStore();

// Features
const { assets, fetchAssets } = useAssetsStore();
const { items, updateItem } = useInventoryStore();
const { orders, createOrder } = useProcurementStore();
```

### Custom Hooks
```typescript
// Data fetching
const { data, isLoading, error, refetch } = useFetch(url);

// Form management
const { values, errors, handleChange, handleSubmit } = useForm(initialValues);

// Search with debounce
const { query, results, isSearching } = useSearch(searchFn);

// Pagination
const { page, goToNextPage } = usePagination();
```

### UI Components
- `Button` - With loading state and variants
- `Input` - With label and error display
- `Card` - Styled container
- `Loading` - Activity indicator
- `ErrorMessage` - Error display with dismiss
- `Badge` - Status indicators
- `ListItem` - List row layout
- `StatCard` - Metric display
- `SectionHeader` - Section titles

## API Integration

All API calls use centralized Axios client with:
- Automatic token injection
- Request/response interceptors
- Token refresh on expiry
- Secure credential storage

```typescript
// API call example
const response = await dashboardApi.getDashboard({ period: 'month' });

// Available services
dashboardApi.getDashboard()
assetsApi.getAssets()
inventoryApi.getInventory()
procurementApi.getOrders()
chatApi.sendMessage()
reportsApi.generateReport()
authApi.login()
```

## Navigation Flow

```
App Start
   ↓
Restore Token from Secure Storage
   ↓
Token Valid? 
   ├─ YES → App Stack (Dashboard + Tab Navigation)
   └─ NO  → Auth Stack (Login/Register)
   
Navigation happens automatically based on auth state.
```

## Development Workflow

1. **Create Feature**: Design screens and API endpoints
2. **Define Types**: TypeScript interfaces in `common/types/`
3. **Build API Services**: Add endpoints in `common/api/services.ts`
4. **Create Store**: Zustand store in `common/store/`
5. **Build Components**: Reusable UI in `common/components/`
6. **Create Screens**: Feature screens in `app/` directory
7. **Test**: Manual testing on device/emulator
8. **Deploy**: EAS Build for platforms

## Code Standards

### Naming Conventions
- Files: `kebab-case` (`auth-store.ts`, `dashboard-screen.tsx`)
- Components: `PascalCase` (`LoginScreen`, `DashboardCard`)
- Functions: `camelCase` (`handleLogin`, `fetchData`)
- Constants: `UPPER_SNAKE_CASE` (`API_BASE_URL`)
- Types: `PascalCase` (`User`, `Dashboard`)

### File Organization
```typescript
// Always use absolute imports
import { Button } from '@common/components';
import { useAuthStore } from '@common/store';
import { Dashboard } from '@common/types';

// Not relative imports
// import Button from '../../../common/components/Button';
```

## Error Handling

```typescript
try {
  await login(email, password);
} catch (error: any) {
  const message = error.response?.data?.error || 'Login failed';
  <ErrorMessage message={message} />
}
```

## Performance Optimization

- ✅ Memoized components with `useMemo`
- ✅ Optimized re-renders
- ✅ Lazy loading screens
- ✅ Image optimization
- ✅ Cache management
- ✅ Parallel API requests

## Security Features

- 🔒 Encrypted credential storage (Keychain/Keystore)
- 🔐 Secure token transmission
- 🛡️ HTTPS only
- 🔄 Automatic token refresh
- 🚪 Automatic logout on auth failure

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests (Detox)
```bash
npm run test:e2e
```

## Troubleshooting

### Cannot connect to backend
```bash
# Check API URL in .env.local
EXPO_PUBLIC_API_URL=http://your-backend:5000/api/v1

# For iOS simulator
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1

# For Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api/v1
```

### Token issues
- Clear app data: Settings → Apps → MetricBI → Storage → Clear All Data
- Reinstall app on device
- Check backend JWT configuration

### Build failures
```bash
# Clear cache
npm run reset-project

# Rebuild
npm install
npm start
```

## Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| expo-router | File-based routing | ~6.0 |
| zustand | State management | ^4.4 |
| axios | HTTP client | ^1.7 |
| expo-secure-store | Credential storage | ^14.0 |
| typescript | Type safety | ~5.9 |

For full list, see [package.json](./package.json)

## Related Documentation

- [Backend API Docs](../backend/README.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open iOS Simulator
npm run ios

# Open Android Emulator
npm run android

# Web version
npm run web

# Lint code
npm run lint

# Reset to fresh project
npm run reset-project

# Build for production
eas build --platform ios
eas build --platform android
```

## License

© 2026 MetricBI. All rights reserved.

---

**Last Updated**: May 2026  
**Status**: Production Ready ✅

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
