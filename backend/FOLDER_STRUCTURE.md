# MetricBI Backend - Folder Structure Reference

## 📁 Complete File Tree

```
backend/
│
├── src/
│   ├── server.ts                                    # ⚙️  Server entry point
│   ├── app.ts                                       # 🌐 Express setup
│   │
│   ├── config/                                      # ⚙️  INFRASTRUCTURE
│   │   ├── env.ts          -----> Zod validation
│   │   ├── logger.ts       -----> Winston setup
│   │   ├── database.ts     -----> MongoDB
│   │   └── redis.ts        -----> Redis cache
│   │
│   ├── common/                                      # 🔧 SHARED CODE
│   │   ├── middleware/
│   │   │   ├── error.middleware.ts        # Global error handler
│   │   │   ├── rateLimiter.middleware.ts  # Rate limiting
│   │   │   └── validation.middleware.ts   # Zod validation middleware
│   │   ├── utils/
│   │   │   ├── errors.ts                  # Custom error classes
│   │   │   ├── response.ts                # Response formatting
│   │   │   └── asyncHandler.ts            # Async wrapper
│   │   └── types/
│   │       └── common.types.ts            # Shared types
│   │
│   └── features/                                    # 🎯 BUSINESS MODULES
│       ├── auth/                           # ✅ Template/Example
│       │   ├── controllers/
│       │   │   └── auth.controller.ts     # HTTP handlers
│       │   ├── services/
│       │   │   └── auth.service.ts        # Business logic
│       │   ├── repositories/
│       │   │   └── auth.repository.ts     # Data access
│       │   ├── models/
│       │   │   └── User.ts                # Mongoose schema
│       │   ├── middleware/
│       │   │   └── auth.middleware.ts     # JWT auth
│       │   ├── routes/
│       │   │   └── auth.routes.ts         # Express routes
│       │   ├── schemas/
│       │   │   └── auth.schemas.ts        # Zod validation
│       │   └── types/
│       │       └── auth.types.ts          # Type definitions
│       │
│       ├── companies/                      # ⏳ FUTURE: Multi-tenant
│       ├── analytics/                      # ⏳ FUTURE: Metrics
│       ├── integrations/                   # ⏳ FUTURE: API connectors
│       └── ...                             # Additional features get same structure
│
├── dist/                                            # 📦 Compiled JavaScript
│   ├── server.js
│   ├── app.js
│   ├── config/
│   ├── common/
│   └── features/
│
├── logs/                                            # 📋 Application logs
│   ├── error.log      (production only)
│   └── combined.log   (production only)
│
├── node_modules/                                    # 📚 Dependencies (737 packages)
│
├── package.json                                     # 📦 Dependencies & scripts
├── package-lock.json                                # 🔒 Locked versions
├── tsconfig.json                                    # ⚙️  TypeScript config
├── .env.example                                     # 📝 Environment template
├── .env.development                                 # 🔑 Dev environment (local)
├── .env.production                                  # 🔑 Prod environment (secrets)
├── .gitignore                                       # 🚫 Git ignore rules
├── README.md                                        # 📖 Main documentation
└── ARCHITECTURE.md                                  # 📐 This file
```

---

## 🏗️ Architecture Pattern

### Feature Module Structure

Each feature follows this exact pattern (use `auth` as template):

```
features/[feature-name]/
├── controllers/
│   └── [feature].controller.ts          # HTTP layer
│       - Handles requests
│       - Calls services
│       - Returns responses
│
├── services/
│   └── [feature].service.ts             # Business logic
│       - Core logic
│       - Data transformation
│       - Calls repositories
│
├── repositories/
│   └── [feature].repository.ts          # Data access
│       - Database queries
│       - Query optimization
│       - Error handling
│
├── models/
│   └── [Entity].ts                      # Mongoose schema
│       - Field definitions
│       - Validation
│       - Indexes
│
├── middleware/
│   └── [feature].middleware.ts          # Express middleware
│       - Authentication checks
│       - Authorization
│       - Request preprocessing
│
├── routes/
│   └── [feature].routes.ts              # Route definitions
│       - Endpoint mapping
│       - Middleware chaining
│       - Validation schemas
│
├── schemas/
│   └── [feature].schemas.ts             # Zod validation
│       - Input validation
│       - Output schemas
│       - Type definitions
│
└── types/
    └── [feature].types.ts               # TypeScript types
        - Interfaces
        - Enums
        - Utility types
```

---

## 📊 Layer Responsibility

### Controller Layer
**File:** `controllers/[feature].controller.ts`

```typescript
// Responsibilities:
- Receive HTTP request
- Validate input (via middleware)
- Call service layer
- Return formatted response
- Handle errors

// NEVER do:
- ❌ Direct database queries
- ❌ Complex business logic
- ❌ Unhandled errors
```

### Service Layer
**File:** `services/[feature].service.ts`

```typescript
// Responsibilities:
- Business logic
- Data transformation
- Validation
- Call repository layer
- Logging

// NEVER do:
- ❌ Direct HTTP responses
- ❌ Raw database queries
```

### Repository Layer
**File:** `repositories/[feature].repository.ts`

```typescript
// Responsibilities:
- Database queries
- Query optimization
- Error handling
- Data mapping

// NEVER do:
- ❌ Business logic
- ❌ Authentication
```

### Model Layer
**File:** `models/[Entity].ts`

```typescript
// Responsibilities:
- Mongoose schema definition
- Field types
- Validation rules
- Indexes
- Instance methods

// NEVER do:
- ❌ Business logic
- ❌ Async operations (except in hooks)
```

---

## 🔗 Data Flow Example

### Creating a Product (Future Feature)

```
1. Request
   └─ POST /api/v1/products
      ├─ Body: { name, price, category }
      └─ Headers: { Authorization: "Bearer token" }

2. Middleware Stack
   ├─ Helmet (security headers)
   ├─ CORS validation
   ├─ Rate limiting
   ├─ Authentication (protect middleware)
   └─ Validation (validate schema)

3. Product Routes
   └─ (routes/product.routes.ts)
      └─ POST "/" → createProduct

4. Controller
   └─ (controllers/product.controller.ts)
      └─ createProduct(req, res)
          ├─ Extract: req.body, req.user, req.tenantId
          └─ Call: productService.createProduct()

5. Service
   └─ (services/product.service.ts)
      └─ createProduct(data, tenantId, userId)
          ├─ Validate business rules
          ├─ Check duplicate SKU
          ├─ Call: productRepository.create()
          └─ Return: Product object

6. Repository
   └─ (repositories/product.repository.ts)
      └─ createProduct(data)
          ├─ Create Mongoose document
          ├─ Save to MongoDB
          └─ Return: Saved product

7. Database
   └─ MongoDB
      └─ Insert into products collection

8. Response Chain (back up)
   └─ Response formatting
      ├─ Status: 201 Created
      ├─ Body:
      │   {
      │     "success": true,
      │     "data": { productId, name, price, ... },
      │     "timestamp": "2024-01-01T..."
      │   }
      └─ Send to client
```

---

## 🎯 File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Controllers | `[feature].controller.ts` | `auth.controller.ts` |
| Services | `[feature].service.ts` | `auth.service.ts` |
| Repositories | `[feature].repository.ts` | `auth.repository.ts` |
| Models | `[Entity].ts` (PascalCase) | `User.ts`, `Product.ts` |
| Middleware | `[feature].middleware.ts` OR `[purpose].middleware.ts` | `auth.middleware.ts` |
| Routes | `[feature].routes.ts` | `auth.routes.ts` |
| Schemas | `[feature].schemas.ts` | `auth.schemas.ts` |
| Types | `[feature].types.ts` | `auth.types.ts` |

---

## 🚀 Creating a New Feature

### Step 1: Create Folder Structure
```bash
mkdir -p src/features/companies/{controllers,services,repositories,models,middleware,routes,schemas,types}
```

### Step 2: Create Files (in order)

1. **Types** (`types/company.types.ts`)
   - Define interfaces
   - Define enums

2. **Schemas** (`schemas/company.schemas.ts`)
   - Zod validation schemas
   - Export types

3. **Models** (`models/Company.ts`)
   - Mongoose schema
   - Indexes

4. **Repository** (`repositories/company.repository.ts`)
   - Database operations
   - CRUD methods

5. **Service** (`services/company.service.ts`)
   - Business logic
   - Data transformation

6. **Middleware** (`middleware/company.middleware.ts`)
   - Authorization
   - Custom checks

7. **Controller** (`controllers/company.controller.ts`)
   - Request handlers
   - Response formatting

8. **Routes** (`routes/company.routes.ts`)
   - Endpoint mapping
   - Middleware chain

### Step 3: Register in app.ts
```typescript
import companyRoutes from "@features/companies/routes/company.routes.js";
app.use("/api/v1/companies", companyRoutes);
```

---

## 📦 Dependencies by Layer

### Infrastructure (`config/`)
- dotenv
- mongoose
- redis
- winston

### Security
- helmet
- cors
- express-rate-limit
- jsonwebtoken
- bcryptjs

### Data Validation
- zod

### Development
- typescript
- @types/*
- tsx
- prettier
- eslint

---

## 🔑 Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript compilation settings |
| `package.json` | Dependencies, scripts, metadata |
| `.env.example` | Documentation of env vars needed |
| `.env.development` | Dev machine config (git ignored) |
| `.env.production` | Production secrets (git ignored) |
| `.gitignore` | Files to exclude from git |

---

## 📊 Database Schema Pattern

Every Mongoose schema should include:

```typescript
const SchemaName = new Schema({
  // Required fields
  field1: { type: String, required: true },
  
  // Indexed fields
  email: { type: String, required: true, unique: true, index: true },
  
  // Multi-tenant support
  tenantId: { type: String, required: true, index: true },
  
  // Soft deletes
  isActive: { type: Boolean, default: true, index: true },
  
  // Audit fields
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
}, {
  timestamps: true,  // Adds createdAt, updatedAt
});

// Compound indexes
SchemaName.index({ tenantId: 1, isActive: 1 });
```

---

## 🧪 Testing Pattern (Future)

```
backend/
├── src/
└── __tests__/
    ├── unit/
    │   ├── services/
    │   │   └── auth.service.test.ts
    │   └── utils/
    │       └── errors.test.ts
    │
    ├── integration/
    │   ├── auth/
    │   │   ├── register.test.ts
    │   │   └── login.test.ts
    │   └── products/
    │       └── create.test.ts
    │
    └── fixtures/
        └── mockData.ts
```

---

## 📈 Scalability Considerations

### Implemented
- ✅ Modular feature-based structure
- ✅ Database indexing strategy
- ✅ Redis-ready caching
- ✅ Rate limiting
- ✅ Async/await throughout
- ✅ Error handling

### Ready for Future
- ⏳ Microservices (each feature → separate service)
- ⏳ Message queues (BullMQ + Redis)
- ⏳ Event sourcing
- ⏳ CQRS pattern
- ⏳ GraphQL layer
- ⏳ Sharding

---

## 🚦 Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production server |
| `npm run lint` | Check code quality |
| `npm run format` | Auto-format code |
| `npm test` | Run tests |

---

**Complete Base Architecture Structure ✅**
