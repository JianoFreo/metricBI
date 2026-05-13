# MetricBI Backend - Base Architecture

## 🏗️ System Architecture Overview

MetricBI uses a **production-grade, clean architecture** designed for scalability, maintainability, and enterprise-level SaaS operations.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Express Server                            │
│                      (Port 5000, HTTP)                           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─ Security Layer
             │  ├─ Helmet (HTTP headers)
             │  ├─ CORS (cross-origin)
             │  ├─ Rate Limiting (DDoS protection)
             │  └─ JWT Authentication
             │
             ├─ Middleware Stack
             │  ├─ Request Parsing (JSON/URL-encoded)
             │  ├─ Request Logging (Winston)
             │  ├─ Validation (Zod)
             │  └─ Global Error Handler
             │
             ├─ Feature Modules
             │  └─ /features
             │     ├─ /auth (controllers/services/repos)
             │     ├─ /companies (future)
             │     ├─ /analytics (future)
             │     └─ ...
             │
             └─ Data Layer
                ├─ MongoDB Atlas
                │  └─ Mongoose Models
                │     └─ Validation/Indexing
                │
                ├─ Redis
                │  ├─ Session Storage
                │  ├─ Caching
                │  └─ Queue Management
                │
                └─ External Services
                   ├─ S3/Cloudinary
                   ├─ Firebase (notifications)
                   ├─ Gemini AI (intelligence)
                   └─ Third-party APIs
```

---

## 📁 Folder Structure

### Root Level
```
backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── config/                   # Infrastructure configuration
│   ├── features/                 # Business logic modules
│   └── common/                   # Shared utilities
├── dist/                         # Compiled JavaScript
├── logs/                         # Application logs
├── node_modules/                 # Dependencies
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
└── .env.example                  # Environment template
```

### config/ - Infrastructure Layer
```
config/
├── env.ts          # Environment variables (Zod validated)
├── logger.ts       # Winston logging configuration
├── database.ts     # MongoDB connection & management
├── redis.ts        # Redis connection & management
```

**Responsibility:** Initialize and manage external services (DB, cache, logging)

### common/ - Shared Utilities
```
common/
├── middleware/
│   ├── error.middleware.ts       # Global error handler
│   ├── rateLimiter.middleware.ts # Rate limiting
│   └── validation.middleware.ts  # Zod validation middleware
├── utils/
│   ├── errors.ts                 # Custom error classes
│   ├── response.ts               # Standardized API responses
│   └── asyncHandler.ts           # Async error wrapper
└── types/
    └── common.types.ts           # Shared type definitions
```

**Responsibility:** Reusable code across all features

### features/ - Modular Business Logic
```
features/
├── auth/                         # Authentication feature (template)
│   ├── controllers/
│   │   └── auth.controller.ts    # HTTP request handlers
│   ├── services/
│   │   └── auth.service.ts       # Business logic
│   ├── repositories/
│   │   └── auth.repository.ts    # Data access layer
│   ├── models/
│   │   └── User.ts               # Mongoose schema
│   ├── middleware/
│   │   └── auth.middleware.ts    # JWT verification
│   ├── routes/
│   │   └── auth.routes.ts        # Express routes
│   ├── schemas/
│   │   └── auth.schemas.ts       # Zod input validation
│   └── types/
│       └── auth.types.ts         # Type definitions
│
├── companies/                    # (Future) Multi-tenant core
├── analytics/                    # (Future) Metrics & dashboards
├── integrations/                 # (Future) Shopify, Amazon, etc.
└── ...
```

**Responsibility:** Each feature is self-contained with all layers

---

## 🔧 Configuration Layer

### env.ts - Environment Variables
```typescript
// Features:
// ✓ Zod validation (type-safe at runtime)
// ✓ Default values for optional vars
// ✓ Strictly defined schema
// ✓ Fails on invalid config at startup
```

**Validates:**
- `NODE_ENV` - development, production, test
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name
- `JWT_ACCESS_SECRET` - Access token secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token secret (min 32 chars)
- `REDIS_URL` - Redis connection (optional)
- `CLOUDINARY_*` - Cloud storage credentials
- `LOG_LEVEL` - error, warn, info, debug

### logger.ts - Winston Logger
```typescript
// Features:
// ✓ Console output with colors (dev)
// ✓ File output: error.log, combined.log (prod)
// ✓ Structured logging with timestamps
// ✓ Error stack traces
```

### database.ts - MongoDB Connection
```typescript
// Features:
// ✓ Mongoose connection management
// ✓ Graceful connection handling
// ✓ Connection event listeners
// ✓ Automatic reconnection
```

### redis.ts - Redis Connection
```typescript
// Features:
// ✓ Optional Redis connection
// ✓ Automatic reconnect strategy
// ✓ Client health checks
// ✓ Graceful disconnection
```

---

## 🔒 Security Middleware Stack

### 1. **Helmet** - HTTP Headers Security
- Removes X-Powered-By header
- Sets X-Frame-Options for clickjacking protection
- Enables HTTPS/HSTS
- Prevents MIME type sniffing

### 2. **CORS** - Cross-Origin Resource Sharing
- Configurable origins (env: `CORS_ORIGIN`)
- Supports credentials
- Prevents unauthorized cross-origin requests

### 3. **Rate Limiting** - DDoS Protection
```
- API Limiter: 100 requests per 15 minutes
- Auth Limiter: 5 login attempts per 15 minutes
- Custom limiters for sensitive endpoints
```

### 4. **Express Middleware**
- JSON parsing (10MB limit)
- URL-encoded parsing (10MB limit)
- Request logging with Winston

### 5. **JWT Authentication**
- Access tokens (15m expiry)
- Refresh tokens (7d expiry)
- Role-based access control (user, admin, seller)

---

## 🛠️ Application Flow

### Request Lifecycle
```
1. Helmet Security Layer
   ↓
2. CORS Validation
   ↓
3. Request Parsing
   ↓
4. Rate Limiting
   ↓
5. Request Logging
   ↓
6. Route Matching
   ↓
7. Middleware (Auth, Validation)
   ↓
8. Controller → Service → Repository
   ↓
9. Database Query
   ↓
10. Response Formatting
    ↓
11. Error Handler (if error)
    ↓
12. Send Response
```

---

## 📋 Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* ... */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚀 API Endpoints Structure

### Versioned API
```
/api/v1/                   # API root
├── /auth                  # Authentication
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   ├── GET  /me
│   ├── POST /change-password
│   └── POST /logout
│
├── /companies             # (Future)
├── /analytics             # (Future)
├── /integrations          # (Future)
└── ...
```

### Health & Status
```
GET  /health               # Server health check
GET  /api/v1               # API documentation
```

---

## 🔐 Error Handling Strategy

### Error Middleware Flow
```
Error Thrown
    ↓
Global Error Middleware
    ↓
Error Classification:
  ├─ AppError (known errors)
  ├─ ValidationError (input validation)
  ├─ AuthenticationError (JWT/auth)
  ├─ AuthorizationError (permissions)
  ├─ NotFoundError (resource missing)
  ├─ ConflictError (duplicate/state)
  ├─ Mongoose Errors (validation, cast)
  ├─ JWT Errors (invalid/expired)
  └─ Unknown Errors (generic 500)
    ↓
Standardized Error Response
    ↓
Logged with Winston
    ↓
Return to Client
```

---

## 📊 Data Models

### Mongoose Schema Setup
- Automatic timestamps (createdAt, updatedAt)
- Indexed fields for performance
- Type safety with TypeScript interfaces
- Validation at schema level

### Indexing Strategy
```
Composite Indexes:
  ├─ (tenantId, isActive)     # Multi-tenant filtering
  ├─ (category, price)        # Product filtering
  ├─ email (unique)           # User lookups
  ├─ (tenantId, email, unique) # Tenant-scoped uniqueness
  └─ createdAt (desc)         # Time-based queries
```

---

## 🔄 Clean Architecture Pattern

### Controller Layer
- HTTP request handling
- Input validation
- Calls service layer
- Returns formatted response

### Service Layer
- Business logic
- Data validation
- Calls repository layer
- Handles transactions

### Repository Layer
- Database operations
- Query optimization
- Data access abstraction

### Model Layer
- Mongoose schemas
- Data type definitions
- Validation rules

---

## 🌍 Multi-Tenant Architecture

### Built-in Everywhere
```typescript
// Request context includes:
req.user.tenantId    // Current tenant
req.tenantId         // Extracted from JWT

// Database queries:
{ tenantId, isActive: true, ... }  // Always filter by tenant

// Authorization:
verifyTenant middleware  // Ensure user can access this tenant
```

---

## 🧪 Development Commands

```bash
# Install dependencies
npm install

# Development (hot reload)
npm run dev

# Build TypeScript
npm run build

# Production start
npm start

# Type checking
npm run build

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm test

# Watch tests
npm test:watch
```

---

## 📝 Environment Variables

Required:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=metricbi
JWT_ACCESS_SECRET=your_32_char_secret_here
JWT_REFRESH_SECRET=your_32_char_secret_here
LOG_LEVEL=debug
```

Optional:
```env
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## ✨ Features Included

### ✅ Infrastructure
- [x] Express server (TypeScript)
- [x] MongoDB connection (Mongoose)
- [x] Redis connection (optional caching)
- [x] Environment validation (Zod)
- [x] Logging system (Winston)
- [x] Error handling (global middleware)
- [x] Security middleware (Helmet, CORS, Rate Limiting)

### ✅ Authentication
- [x] JWT tokens (access + refresh)
- [x] Password hashing (bcryptjs)
- [x] Role-based access control
- [x] Protected routes middleware

### ✅ Development Experience
- [x] TypeScript strict mode
- [x] Path aliases (@config, @features, @common)
- [x] Hot reload (tsx watch)
- [x] Build optimization (tsc)
- [x] Development logging

### ⏳ Next Features
- [ ] Companies/Tenants module
- [ ] File upload service (Cloudinary)
- [ ] Queue system (BullMQ + Redis)
- [ ] Analytics module
- [ ] Integrations (Shopify, Amazon, Alibaba)
- [ ] AI features (Gemini)
- [ ] Email notifications
- [ ] Webhooks

---

## 🚦 Server Startup Sequence

```
1. Load environment variables (Zod validated)
2. Initialize logging system
3. Connect to MongoDB
4. Connect to Redis (optional)
5. Start Express server on PORT
6. Log success message
7. Setup graceful shutdown handlers
   ├─ SIGTERM
   ├─ SIGINT
   └─ Unhandled rejections
```

---

## 📊 Monitoring & Health

### Health Check Endpoint
```
GET /health
Response: { status: "ok", environment: "dev/prod", timestamp }
```

### Logging Levels
- **error** - Failed operations, critical issues
- **warn** - Warnings, deprecations, non-critical issues
- **info** - Important lifecycle events (startup, shutdown)
- **debug** - Detailed request/response logging

---

## 🎯 Architecture Benefits

1. **Scalability**
   - Feature-based modular structure
   - Database indexing strategy
   - Redis caching ready
   - Async/await throughout

2. **Maintainability**
   - Clear separation of concerns
   - Single responsibility principle
   - Easy to locate business logic
   - Type-safe (full TypeScript)

3. **Security**
   - JWT authentication
   - Rate limiting
   - CORS validation
   - Environment variable validation
   - Input sanitization via Zod

4. **Development**
   - Hot reload with tsx
   - Comprehensive error messages
   - Structured logging
   - TypeScript strict mode

5. **Production Ready**
   - Graceful shutdown handling
   - Connection pooling
   - Error recovery
   - Health checks
   - Environment-based configuration

---

## 🔗 Next Steps

1. **Setup Environment**
   ```bash
   cp .env.example .env.development
   # Edit with your MongoDB URI and Redis URL
   ```

2. **Run Development Server**
   ```bash
   npm install
   npm run dev
   ```

3. **Test Health Check**
   ```bash
   curl http://localhost:5000/health
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

5. **Implement First Feature**
   - Create feature folder in `src/features/`
   - Follow Auth folder pattern
   - Use type-safe patterns

---

## 📚 File-by-File Guide

| File | Purpose | Status |
|------|---------|--------|
| `server.ts` | Server entry point | ✅ Complete |
| `app.ts` | Express setup | ✅ Complete |
| `config/env.ts` | Env validation | ✅ Complete |
| `config/logger.ts` | Winston logging | ✅ Complete |
| `config/database.ts` | MongoDB connection | ✅ Complete |
| `config/redis.ts` | Redis setup | ✅ Complete |
| `common/middleware/error.middleware.ts` | Error handler | ✅ Complete |
| `common/middleware/rateLimiter.middleware.ts` | Rate limiting | ✅ Complete |
| `common/utils/errors.ts` | Error classes | ✅ Complete |
| `common/utils/response.ts` | Response formatting | ✅ Complete |
| `features/auth/` | Auth template | ✅ Complete |

---

**Backend Base Architecture: ✅ READY FOR FEATURE DEVELOPMENT**
