# MetricBI Mobile App - Expo React Native Architecture

## Overview

MetricBI Mobile is a production-ready Expo React Native application for business intelligence and asset management. The app is built with a feature-based modular architecture, utilizing Expo Router for navigation, Zustand for state management, and Axios for API consumption.

## 📁 Directory Structure

```
application/
├── app/                               # Expo Router entry point
│   ├── _layout.tsx                   # Root navigation wrapper
│   ├── (auth)/                       # Auth feature routes
│   │   ├── login.tsx                 # Login screen
│   │   └── register.tsx              # Registration screen
│   ├── (dashboard)/                  # Dashboard feature routes
│   │   └── index.tsx                 # Main dashboard screen
│   ├── (assets)/                     # Assets feature routes
│   │   └── index.tsx                 # Assets inventory screen
│   ├── (inventory)/                  # Inventory feature routes
│   │   └── index.tsx                 # Inventory management screen
│   ├── (procurement)/                # Procurement feature routes
│   │   └── index.tsx                 # Procurement orders screen
│   ├── (chat)/                       # AI Chat feature routes
│   │   └── index.tsx                 # Chat screen
│   ├── (reports)/                    # Reports feature routes
│   │   └── index.tsx                 # Reports screen
│   └── (profile)/                    # Profile feature routes
│       └── index.tsx                 # User profile screen
├── src/
│   ├── features/                     # Feature-based modules
│   │   ├── auth/                     # Auth feature
│   │   ├── dashboard/                # Dashboard feature
│   │   ├── assets/                   # Assets feature
│   │   ├── inventory/                # Inventory feature
│   │   ├── procurement/              # Procurement feature
│   │   ├── ai-chat/                  # AI Chat feature
│   │   └── reports/                  # Reports feature
│   ├── common/
│   │   ├── api/                      # API layer
│   │   │   ├── client.ts             # Axios client with interceptors
│   │   │   └── services.ts          # API endpoints
│   │   ├── store/                    # Zustand stores
│   │   │   ├── auth.store.ts         # Auth state management
│   │   │   └── index.ts              # Feature stores
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Button.tsx            # Button component
│   │   │   └── index.ts              # Card, Input, Loading, etc.
│   │   ├── context/                  # React Context
│   │   │   └── auth.context.tsx      # Auth provider
│   │   ├── hooks/                    # Custom hooks
│   │   │   └── index.ts              # useFetch, useApi, useForm, etc.
│   │   ├── types/                    # TypeScript types
│   │   │   └── index.ts              # All app types
│   │   └── utils/                    # Utility functions
│   └── config/                       # Configuration files
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── app.json                          # Expo config
└── README.md                         # This file
```

## 🏗️ Architecture Patterns

### 1. Feature-Based Modular Structure

Each feature (Auth, Dashboard, Assets, etc.) is self-contained with:
- **Screens**: UI components for the feature
- **Services**: API calls specific to the feature
- **Stores**: State management for the feature
- **Types**: TypeScript interfaces

### 2. State Management (Zustand)

Zustand provides lightweight, simple state management without boilerplate.

**Auth Store Example:**
```typescript
const { user, token, login, logout } = useAuthStore();
```

**Dashboard Store Example:**
```typescript
const { dashboard, isLoading, fetchDashboard } = useDashboardStore();
```

### 3. Navigation (Expo Router)

Uses Expo Router's file-based routing:
- Auth stack: `(auth)/login` and `(auth)/register`
- App stack: Bottom tab navigation with 7 tabs
- Dynamic routing based on authentication state

### 4. API Client (Axios)

Centralized API client with:
- Automatic token injection in headers
- Request/response interceptors
- Token refresh logic
- Secure credential storage

**Usage:**
```typescript
const response = await dashboardApi.getDashboard({ period: 'month' });
```

### 5. Custom Hooks

Reusable logic patterns:
- `useFetch()` - Data fetching with loading/error states
- `useApi()` - POST/PUT/DELETE operations
- `useForm()` - Form state management with validation
- `usePagination()` - Pagination logic
- `useSearch()` - Debounced search
- `useTheme()` - Color scheme and theme

## 📱 Screens

### Auth Screens
- **Login** (`(auth)/login`) - Email/password authentication
- **Register** (`(auth)/register`) - New user registration

### Main App Screens (Tab Navigation)
- **Dashboard** (`(dashboard)/index`) - Main overview with metrics
- **Assets** (`(assets)/index`) - Asset inventory management
- **Inventory** (`(inventory)/index`) - Stock level management
- **Procurement** (`(procurement)/index`) - Purchase orders
- **AI Chat** (`(chat)/index`) - AI business analyst
- **Reports** (`(reports)/index`) - Generate & download reports
- **Profile** (`(profile)/index`) - User settings and account

## 🔐 Authentication Flow

1. **App Launch**: `AuthProvider` restores token from secure storage
2. **Token Missing**: User redirected to Auth Stack (Login/Register)
3. **Token Valid**: User navigated to App Stack (Bottom Tab Navigation)
4. **Token Expired**: Automatic token refresh or redirect to login
5. **Logout**: Clear all stored credentials

## 🎨 UI Components

### Core Components
- **Button** - Multiple variants (primary, secondary, danger, outline)
- **Input** - Text input with label and error state
- **Card** - Container with shadow styling
- **Loading** - Activity indicator wrapper
- **ErrorMessage** - Error display with dismiss action
- **Badge** - Status badges (success, warning, danger, info)
- **ListItem** - List item with title, subtitle, icon
- **StatCard** - Statistics display card
- **SectionHeader** - Section title with action button
- **RefreshList** - FlatList with refresh control

### Component Props Pattern
```typescript
interface ComponentProps {
  // Required
  title: string;
  onPress: () => void;
  
  // Optional with defaults
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  isLoading?: boolean;
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
}
```

## 📡 API Integration

### Endpoints Structure
All endpoints are prefixed with `/api/v1` (configurable via `EXPO_PUBLIC_API_URL`)

```
POST   /auth/login
POST   /auth/register
POST   /auth/logout
GET    /auth/me

GET    /dashboard
GET    /dashboard/summary
GET    /dashboard/assets
GET    /dashboard/inventory
GET    /dashboard/procurement
GET    /dashboard/financial
GET    /dashboard/insights

GET    /assets
GET    /assets/:id
POST   /assets
PUT    /assets/:id
DELETE /assets/:id

GET    /inventory
GET    /inventory/:id
PATCH  /inventory/:id

GET    /procurement/orders
GET    /procurement/orders/:id
POST   /procurement/orders
PUT    /procurement/orders/:id

GET    /chat/sessions
POST   /chat/sessions
GET    /chat/sessions/:id
POST   /chat/sessions/:id/messages

GET    /reports
POST   /reports
GET    /reports/:id
GET    /reports/:id/download
```

## 🔒 Secure Credential Storage

Uses `expo-secure-store` for secure storage:
- Credentials encrypted at rest
- Token stored securely
- Automatic cleanup on logout
- Compatible with iOS Keychain and Android Keystore

## 🚀 Getting Started

### Installation
```bash
cd application
npm install
```

### Environment Setup
Create `.env.local`:
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Run Development Server
```bash
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Build for Production
```bash
eas build --platform ios
eas build --platform android
```

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo-router` | File-based routing |
| `zustand` | State management |
| `axios` | HTTP client |
| `expo-secure-store` | Secure credential storage |
| `react-native-gesture-handler` | Touch gesture handling |
| `react-native-reanimated` | Smooth animations |
| `@react-navigation/*` | Navigation libraries |

## 🎯 Best Practices

### 1. Component Composition
```typescript
// ❌ Don't: Inline styles
<View style={{ backgroundColor: '#FFFFFF', borderRadius: 8 }} />

// ✅ Do: Use StyleSheet
<View style={styles.card} />
```

### 2. Error Handling
```typescript
// ❌ Don't: Ignore errors
try { await fetchData(); } catch {}

// ✅ Do: Handle and display
catch (error) {
  setError(error.message);
  <ErrorMessage message={error} />
}
```

### 3. Loading States
```typescript
// ❌ Don't: Disable button without feedback
<Button disabled={isLoading} />

// ✅ Do: Show loading indicator
<Button isLoading={isLoading} disabled={isLoading} />
```

### 4. Data Fetching
```typescript
// ❌ Don't: Fetch in every render
const data = useFetch(url);

// ✅ Do: Use useEffect with dependencies
useEffect(() => {
  fetchDashboard();
}, [period]);
```

### 5. State Management
```typescript
// ❌ Don't: Multiple useState calls
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);
const [isLoading, setIsLoading] = useState(false);

// ✅ Do: Use Zustand store
const { user, token, isLoading } = useAuthStore();
```

## 🧪 Testing Considerations

### Unit Testing
- Test custom hooks with `@testing-library/react-hooks`
- Test Zustand stores in isolation
- Mock Axios responses

### Integration Testing
- Mock API using MSW (Mock Service Worker)
- Test complete user flows
- Test navigation between screens

### E2E Testing
- Use Detox for real device testing
- Test complete app workflows

## 🔄 Data Flow

```
User Action
    ↓
Screen Component
    ↓
useAuth() / useStore()
    ↓
Button/Input Handler
    ↓
.login() / .fetchDashboard()
    ↓
API Call (axios)
    ↓
Backend Response
    ↓
Update Zustand Store
    ↓
Component Re-renders
    ↓
UI Updates
```

## 🛠️ Development Workflow

1. **Design Feature**: Plan screens, API endpoints, state
2. **Create Types**: Define TypeScript interfaces
3. **Build API Layer**: Create services in `api/services.ts`
4. **Create Store**: Build Zustand store for state
5. **Build Components**: Create reusable UI components
6. **Build Screens**: Compose screens using components
7. **Test**: Manual testing on device/emulator
8. **Deploy**: Build and publish to app stores

## 📝 Naming Conventions

- **Files**: kebab-case (`auth-store.ts`, `user-profile.tsx`)
- **Components**: PascalCase (`LoginScreen`, `StatCard`)
- **Functions**: camelCase (`handleLogin`, `fetchDashboard`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `STORAGE_KEYS`)
- **Types**: PascalCase (`User`, `Dashboard`, `LoginResponse`)

## 🐛 Debugging

### Redux DevTools (for Zustand)
```bash
npm install zustand-devtools
```

### Network Debugging
```bash
# React Native Debugger
npm install react-devtools-core react-native-debugger
```

### Console Logging
```typescript
import logger from '@common/utils/logger';

logger.info('Dashboard fetched', { period, count });
logger.error('API error', error);
```

## 📝 Future Enhancements

- [ ] Offline mode with local caching
- [ ] Push notifications
- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics tracking
- [ ] Voice commands integration
- [ ] Biometric authentication
- [ ] Advanced chart visualizations

## 📄 License

© 2026 MetricBI. All rights reserved.

---

For API documentation, see [Backend README](../../backend/README.md)
