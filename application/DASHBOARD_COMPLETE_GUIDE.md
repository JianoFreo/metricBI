# MetricBI Mobile Dashboard - Complete Guide

## Table of Contents
1. [Dashboard Overview](#dashboard-overview)
2. [How It Works](#how-it-works)
3. [Component Architecture](#component-architecture)
4. [Build & Deployment](#build--deployment)
5. [Backend Setup (Render)](#backend-setup-render)
6. [File Storage (Cloudinary)](#file-storage-cloudinary)
7. [Database Setup (MongoDB)](#database-setup-mongodb)
8. [Environment Configuration](#environment-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Dashboard Overview

The MetricBI mobile dashboard is a comprehensive business intelligence platform built with:
- **Frontend**: React Native + Expo
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Real-time Updates**: WebSocket & Polling

### Features
✅ KPI Cards with trending data
✅ Interactive Charts (Sales, Inventory, Procurement)
✅ AI Insights & Recommendations
✅ Quick Actions for common tasks
✅ Pull-to-refresh for real-time data
✅ Responsive design for all devices
✅ Offline-capable with caching

---

## How It Works

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Mobile App (Expo)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Dashboard Screen                                 │   │
│  │ - Renders KPI Cards, Charts, Insights           │   │
│  │ - Manages state with ServiceFactory & Hooks      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓ (HTTP/REST)
┌─────────────────────────────────────────────────────────┐
│              Backend API (Render)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Dashboard Controller                             │   │
│  │ - GET /api/dashboard → Aggregated metrics       │   │
│  │ - GET /api/dashboard/insights → AI insights     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Database                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │ MongoDB Atlas                                    │   │
│  │ - Collections: Assets, Inventory, Orders, etc.  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Request/Response Flow

**1. Dashboard Load**
```
App Mount
  ↓
useEffect() triggers fetchDashboard()
  ↓
ServiceFactory.getDashboardService().get('/')
  ↓
API Request: GET /api/dashboard
  ↓
Backend:
  - Aggregate financial summary from transactions
  - Count assets by status
  - Calculate inventory metrics
  - Fetch pending orders
  ↓
MongoDB Query:
  - Transactions (last 30 days)
  - Assets collection
  - Inventory collection
  - Orders collection
  ↓
Response: { financialSummary, assetsSummary, inventoryStatus, procurementOverview }
  ↓
setState() updates UI
  ↓
Charts & KPI Cards Render with real data
```

**2. Pull to Refresh**
```
User swipes down
  ↓
RefreshControl onRefresh callback triggered
  ↓
fetchDashboard() called again
  ↓
setLoading(true) → Shows spinner
  ↓
[Repeat request flow above]
  ↓
setLoading(false) → Removes spinner
```

**3. Quick Action**
```
User presses "Create Order" button
  ↓
handleQuickAction('create-order')
  ↓
Navigate to OrderCreation screen
  ↓
[Order creation workflow]
```

---

## Component Architecture

### Component Hierarchy

```
DashboardScreen (Main Container)
│
├── Header
│   └── Greeting + Last Updated Time
│
├── KPI Cards Section
│   ├── KPICard (Revenue)
│   ├── KPICard (Assets)
│   ├── KPICard (Inventory Value)
│   └── KPICard (Pending Orders)
│
├── Quick Actions Section
│   ├── QuickActionButton (Create Order)
│   ├── QuickActionButton (Low Stock)
│   └── ... (6 total buttons)
│
├── Charts Section
│   ├── SalesTrendChart (LineChart)
│   ├── InventoryStatusChart (BarChart)
│   ├── ProcurementOrdersChart (BarChart)
│   └── AssetCategoriesPie (PieChart)
│
└── AI Insights Section
    ├── InsightCard (Opportunity)
    ├── InsightCard (Warning)
    └── InsightCard (Info)
```

### Component Details

#### KPICard Component
**File**: `src/common/components/KPICard.tsx`

**Props**:
- `title: string` - Card title (e.g., "Total Revenue")
- `value: string | number` - Main KPI value
- `unit?: string` - Unit label (e.g., "items", "$")
- `change?: number` - % change from previous period
- `trend?: 'up' | 'down' | 'neutral'` - Trend direction
- `icon: string` - Material icon name
- `color?: string` - Primary color (hex)

**Usage**:
```typescript
<KPICard
  title="Total Revenue"
  value="$245,612"
  unit="USD"
  change={12}
  trend="up"
  icon="trending-up"
  color="#4F46E5"
/>
```

#### Chart Components
**File**: `src/common/components/Charts.tsx`

**Available Charts**:
1. `LineChartComponent` - Trend visualization
2. `BarChartComponent` - Comparison data
3. `PieChartComponent` - Distribution data
4. `SalesTrendChart` - Pre-configured sales trend
5. `InventoryStatusChart` - Inventory breakdown
6. `ProcurementOrdersChart` - Order status
7. `AssetCategoriesPie` - Asset distribution

**Example**:
```typescript
<SalesTrendChart
  data={[
    { date: '2024-01-01', sales: 45000 },
    { date: '2024-01-02', sales: 52000 },
    // ... more data points
  ]}
/>
```

#### AI Insights Component
**File**: `src/common/components/AIInsights.tsx`

**Props**:
- `insights: AIInsight[]` - Array of insights
- `isLoading?: boolean` - Loading state
- `onRefresh?: () => void` - Refresh callback
- `style?: ViewStyle` - Custom styling

**Insight Types**:
- `'opportunity'` - Green, lightbulb icon
- `'warning'` - Yellow, alert icon
- `'info'` - Blue, information icon

#### Quick Actions Component
**File**: `src/common/components/QuickActions.tsx`

**Props**:
- `actions: QuickAction[]` - Action buttons
- `layout?: 'grid' | 'horizontal'` - Layout mode
- `columns?: number` - Grid columns

**Action Object**:
```typescript
interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
  badge?: number; // Shows count badge
  disabled?: boolean;
}
```

---

## Build & Deployment

### Development Setup

**Prerequisites**:
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Mobile device or emulator (Android/iOS)

**Installation Steps**:

```bash
# Navigate to application folder
cd application

# Install dependencies
npm install

# Start Expo development server
npm start

# Start on Android emulator/device
npm run android

# Start on iOS simulator
npm run ios

# Start on web browser
npm run web

# Run linting
npm run lint
```

### Production Build

#### Build for iOS

**Prerequisite**: macOS with Xcode installed

```bash
# Generate production build
eas build --platform ios --auto-submit

# Or build locally
expo build:ios

# Install on device
# Download .ipa file and use Apple Configurator or Xcode
```

**Estimated time**: 15-20 minutes

#### Build for Android

```bash
# Generate release APK/AAB
eas build --platform android --auto-submit

# Or local build
expo build:android

# Download APK from build link
# Upload to Google Play Store
```

**Estimated time**: 10-15 minutes

#### Build for Web

```bash
# Build static files
expo build:web

# Output in web-build/ folder
# Can be deployed to Vercel, Netlify, etc.
```

### EAS Configuration

Create `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "production": {
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "release"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "123456789",
        "appleIdPassword": "@keychain:ascAppPassword",
        "teamId": "ABC123DEF"
      },
      "android": {
        "serviceAccount": "path/to/service-account.json",
        "track": "production"
      }
    }
  }
}
```

**Register for EAS**:
```bash
eas login
eas credentials
```

---

## Backend Setup (Render)

### What is Render?

Render is a cloud hosting platform for deploying backend services. It's free for hobby projects and has pay-as-you-go pricing for production.

### Deploying Backend to Render

**Step 1: Prepare Backend**

```bash
cd backend

# Ensure package.json has scripts
# {
#   "scripts": {
#     "start": "node src/server.js",
#     "build": "echo 'Build complete'",
#     "dev": "nodemon src/server.js"
#   }
# }

# Create .env file (DO NOT include sensitive data in git)
# MONGODB_URI=your_mongodb_connection_string
# CLOUDINARY_CLOUD_NAME=your_cloudinary_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
# JWT_SECRET=your_jwt_secret
# PORT=3000
```

**Step 2: Create GitHub Repository**

```bash
# Initialize git (if not done)
git init

# Add files
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/metricBI.git
git push -u origin main
```

**Step 3: Deploy to Render**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: metricbi-backend
   - **Region**: Closest to users (e.g., Oregon for US)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add all from .env file
     - MONGODB_URI
     - CLOUDINARY_CLOUD_NAME
     - CLOUDINARY_API_KEY
     - CLOUDINARY_API_SECRET
     - JWT_SECRET
5. Click "Create Web Service"
6. Wait 3-5 minutes for deployment

**Step 4: Verify Deployment**

```bash
# Test API endpoint
curl https://your-app.onrender.com/api/dashboard

# Should return dashboard data (with auth token)
```

### Environment Variables on Render

Go to Settings → Environment:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/metricbi
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_super_secret_jwt_key_12345
NODE_ENV=production
PORT=3000
```

### Render Dashboard Management

- **View Logs**: Settings → Logs
- **Restart Service**: Settings → Restart
- **Upgrade Plan**: Settings → Plan
- **Custom Domain**: Settings → Custom Domain
- **SSL Certificate**: Auto-generated (HTTPS)

### Costs

| Plan | Price | Use Case |
|------|-------|----------|
| Free | $0 | Development, testing |
| Pay-as-you-go | $0.25-5/month | Small production apps |
| Standard | $7-25/month | Medium production apps |
| Pro | $25+/month | Large production apps |

---

## File Storage (Cloudinary)

### What is Cloudinary?

Cloudinary is a cloud-based media storage and CDN service. It handles image/video uploads, transformations, and delivery with optimization.

### Cloudinary Setup

**Step 1: Create Account**

1. Go to https://cloudinary.com
2. Sign up for free account
3. Verify email
4. Accept terms

**Step 2: Get Credentials**

Dashboard → Settings → API Keys:
- Cloud Name: `xxxxx`
- API Key: `123456789`
- API Secret: `abcdefg_secret` (KEEP SECRET!)

**Step 3: Configure Backend**

**File**: `backend/src/config/cloudinary.js`

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

**Step 4: Setup Upload Endpoint**

**File**: `backend/src/routes/upload.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'metricbi',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
  },
});

const upload = multer({ storage });

// Upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    data: {
      url: req.file.secure_url,
      publicId: req.file.public_id,
      size: req.file.size,
      type: req.file.resource_type,
    },
  });
});

module.exports = router;
```

**Step 5: Install Dependencies**

```bash
cd backend
npm install cloudinary multer multer-storage-cloudinary
```

### Using Cloudinary in Frontend

```typescript
// Upload file from mobile app
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    '/api/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data.url; // Use this URL in your app
};
```

### Cloudinary Features

| Feature | Benefit |
|---------|---------|
| Auto-optimization | 30% smaller file sizes |
| Responsive images | Automatic responsive breakpoints |
| Video streaming | Adaptive bitrate streaming |
| CDN delivery | 99.99% uptime, fast global CDN |
| Image transformations | Crop, resize, filter, watermark |
| Analytics | Track usage and bandwidth |

---

## Database Setup (MongoDB)

### What is MongoDB?

MongoDB is a NoSQL database that stores data in JSON-like documents, perfect for flexible schemas.

### MongoDB Setup (Atlas - Free)

**Step 1: Create Account**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Verify email

**Step 2: Create Cluster**

1. Click "Create" on left menu
2. Select **M0 Sandbox** (free tier)
3. Select region (choose closest to you)
4. Click "Create Cluster"
5. Wait 3-5 minutes for provisioning

**Step 3: Get Connection String**

1. Click "Databases" on left
2. Click "Connect"
3. Choose "Drivers"
4. Select "Node.js"
5. Copy connection string

**Step 4: Create User**

1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Choose "Password"
4. Enter username/password
5. Click "Add User"

Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

**Step 5: Allow IP Access**

1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (for development)
   - For production: Add specific IPs only
4. Click "Confirm"

**Step 6: Update Backend**

**File**: `backend/.env`

```
MONGODB_URI=mongodb+srv://metricBI_user:SecurePass123@cluster.mongodb.net/metricBI?retryWrites=true&w=majority
```

### MongoDB Collections

The dashboard uses these collections:

**1. Users Collection**
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  name: "John Doe",
  role: "admin",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**2. Assets Collection**
```javascript
{
  _id: ObjectId,
  name: "Forklift",
  category: "Equipment",
  value: 25000,
  status: "active",
  location: "Warehouse A",
  createdAt: ISODate
}
```

**3. Inventory Collection**
```javascript
{
  _id: ObjectId,
  sku: "INV-001",
  name: "Steel Plate",
  quantity: 250,
  reorderLevel: 50,
  unitCost: 12.50,
  category: "Materials"
}
```

**4. Orders Collection**
```javascript
{
  _id: ObjectId,
  orderNumber: "PO-2024-001",
  supplier: "Acme Corp",
  status: "shipped",
  orderDate: ISODate,
  expectedDelivery: ISODate,
  totalValue: 5000,
  items: [/* line items */]
}
```

### MongoDB Indexes (Performance)

```javascript
// Create indexes for faster queries
db.users.createIndex({ email: 1 }, { unique: true });
db.assets.createIndex({ category: 1 });
db.assets.createIndex({ status: 1 });
db.inventory.createIndex({ sku: 1 }, { unique: true });
db.orders.createIndex({ orderDate: -1 });
db.orders.createIndex({ status: 1 });
```

---

## Environment Configuration

### Mobile App (.env.local)

**File**: `application/.env.local`

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api

# Authentication
EXPO_PUBLIC_JWT_STORAGE_KEY=metricbi_token

# Features
EXPO_PUBLIC_ENABLE_AI_INSIGHTS=true
EXPO_PUBLIC_CACHE_TTL=300000

# Logging
EXPO_PUBLIC_LOG_LEVEL=info
```

### Backend (.env)

**File**: `backend/.env`

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/metricbi

# Authentication
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=https://metricbi-app.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Accessing Environment Variables

**Frontend** (Expo - must be prefixed with `EXPO_PUBLIC_`):
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
```

**Backend** (Node.js):
```javascript
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
```

### Environment Secrets Management

**DO NOT COMMIT**:
- .env files
- JWT_SECRET
- Cloudinary API Secret
- Database passwords
- API keys

**Safe practices**:
1. Add `.env` to `.gitignore`
2. Copy `.env.example` for developers
3. Use secret managers:
   - GitHub Secrets (for CI/CD)
   - Render environment variables (production)
   - AWS Secrets Manager (enterprise)
   - HashiCorp Vault (advanced)

---

## Troubleshooting

### Dashboard Not Loading

**Issue**: "No data available" message

**Root Causes**:
1. Backend API not responding
2. MongoDB connection failed
3. Authentication token expired

**Solutions**:
```javascript
// Check API connectivity
fetch('https://your-backend.onrender.com/api/dashboard')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Check token validity
const token = localStorage.getItem('auth_token');
console.log('Token:', token);

// Check MongoDB connection
// Go to Render logs and search for connection errors
```

### Slow Charts Rendering

**Issue**: Charts take 3-5 seconds to render

**Causes**:
1. Large dataset
2. Inefficient aggregation pipeline
3. Network latency

**Solutions**:
```javascript
// Backend: Optimize aggregation
// Reduce data points before sending
db.aggregation([
  { $match: { createdAt: { $gte: thirtyDaysAgo } } },
  { $limit: 100 }, // Limit data points
  { $project: { date:1, value: 1 } }
]);

// Frontend: Implement data pagination
const [chartData, setChartData] = useState([]);
const [page, setPage] = useState(1);
```

### Authentication Token Expired

**Issue**: "Unauthorized" 401 errors

**Solution**:
```javascript
// Implement auto-refresh
const refreshToken = async () => {
  const response = await axios.post('/api/auth/refresh');
  SetToken(response.data.token);
};

// Add to interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      return refreshToken().then(() => retryRequest());
    }
  }
);
```

### Cloudinary Upload Failed

**Issue**: "Access Denied" or 403 error

**Causes**:
1. API Key/Secret incorrect
2. File type not allowed
3. Quota exceeded

**Solutions**:
```javascript
// Verify credentials
cloudinary.api.resources({ max_results: 1 });

// Check allowed formats
const allowedFormats = ['jpg', 'png', 'gif'];

// Monitor usage in Cloudinary dashboard
```

### MongoDB Connection Timeout

**Issue**: "Connection timeout" after 30 seconds

**Causes**:
1. IP address not whitelisted
2. Cluster overloaded
3. Network connectivity

**Solutions**:
```javascript
// Add IP to Network Access in MongoDB Atlas
// Settings → Network Access → Add IP

// Check connection string
const isValid = uri.includes('mongodb+srv://');

// Increase timeout
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};
```

### Memory Leaks in Mobile App

**Issue**: App slows down after 30 minutes of use

**Causes**:
1. Unopened subscriptions
2. Large arrays not cleared
3. Event listeners not removed

**Solutions**:
```typescript
useEffect(() => {
  const unsubscribe = store.subscribe((state) => {
    // Handle updates
  });

  return () => {
    unsubscribe(); // CLEANUP!
  };
}, []);
```

---

## Performance Optimization

### Mobile App

1. **Image Optimization**:
   - Use Cloudinary auto-optimization
   - Set appropriate image sizes

2. **Caching**:
   - Cache API responses for 5 minutes
   - Use AsyncStorage for offline

3. **Code Splitting**:
   - Lazy load screens
   - Dynamic imports for heavy components

### Backend

1. **Database Indexes**:
   - Add indexes to frequently queried fields
   - Monitor slow queries

2. **Response Caching**:
   - Cache aggregation results
   - Use Redis for frequently accessed data

3. **Query Optimization**:
   - Use projection to select only needed fields
   - Limit results with pagination

---

## Monitoring & Analytics

### Render Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: CPU, memory, network usage
- **Uptime**: 99.99% SLA for paid plans

### MongoDB Metrics

- **Query Performance**: Atlas dashboard
- **Storage Usage**: Monitor collections size
- **Connection Pool**: Monitor active connections

### Mobile App Errors

Integrate error tracking:
```bash
npm install @sentry/react-native
```

Configure:
```typescript
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://your@sentry.io/project",
  environment: "production",
});
```

---

## Conclusion

The MetricBI dashboard is now fully configured and deployable:

✅ **Frontend**: React Native + Expo
✅ **Backend**: Express.js on Render
✅ **Database**: MongoDB Atlas
✅ **Files**: Cloudinary
✅ **Real-time**: Pull-to-refresh + Polling
✅ **Production-ready**: Security, performance, monitoring

For support or questions, refer to the specific service documentation:
- Expo: https://docs.expo.dev
- Render: https://render.com/docs
- MongoDB: https://www.mongodb.com/docs
- Cloudinary: https://cloudinary.com/documentation
