# MetricBI Backend

Production-grade Node.js + Express + TypeScript backend for MetricBI - the single source of truth for business logic, AI, MongoDB, Redis, and tenant-scoped data access.

## 🏗️ Architecture

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Refresh Tokens
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting, bcrypt
- **Code Structure**: Feature-based modular architecture

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (env, db, logger)
│   ├── features/        # Feature modules (auth, products, etc.)
│   │   ├── auth/
│   │   ├── products/
│   │   └── ...
│   ├── common/          # Shared middleware, utils, types
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── dist/                # Compiled JavaScript
├── logs/                # Application logs
├── .env.example         # Environment variables template
└── package.json         # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

```bash
# Clone repository
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.development

# Edit .env.development with your configuration
```

### Environment Setup

Create `.env.development` with the following:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=metricbi

JWT_ACCESS_SECRET=your_very_long_random_string_at_least_32_chars
JWT_REFRESH_SECRET=your_very_long_random_string_at_least_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000

REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

### Running

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## � Production-Grade Authentication System

### Overview
A SaaS-ready JWT + refresh token authentication system with role-based access control (RBAC), multi-tenancy support, bcrypt password hashing, and secure cookie handling.

### Key Features

#### 1. **JWT Token System**
- **Access Token**: 15-minute expiry (short-lived, in memory)
- **Refresh Token**: 7-day expiry (long-lived, HTTP-only cookie or request body)
- **Token Rotation**: Refresh tokens are rotated on every refresh call
- **Hash Storage**: Refresh tokens are hashed in DB for security (invalidates old tokens)

#### 2. **Password Security**
- bcryptjs with 10-salt rounds
- Passwords never sent in responses
- Secure password change forces re-login
- Minimum 8 chars, requires uppercase, lowercase, number

#### 3. **Multi-Tenancy**
- Every user belongs to a company (tenant)
- Email uniqueness scoped per company
- JWT includes `companyId` for tenant isolation
- Cross-tenant access prevented at middleware level

#### 4. **Role-Based Access Control (RBAC)**
```
viewer     → Read-only (dashboards, reports)
analyst    → Read + analysis
manager    → Create/update resources
admin      → Full company control + user management
super_admin → Platform admin (any tenant)
```

#### 5. **Secure Cookie Handling**
```typescript
// Optional HttpOnly cookie storage (controlled by AUTH_USE_COOKIES env var)
// Features:
// - HttpOnly flag (prevents JavaScript access)
// - Secure flag (HTTPS only in production)
// - SameSite=strict (CSRF protection)
// - 7-day max age
// - Path restricted to /api/v1/auth/refresh
```

#### 6. **Rate Limiting**
- Auth endpoints: 5 attempts per 15 minutes
- API endpoints: 100 requests per 15 minutes
- Prevents brute force and DDoS attacks

#### 7. **Comprehensive Validation**
All inputs validated with Zod:
- Email format validation
- Password strength requirements
- Company ID verification
- Character length constraints

### Authentication Flow

#### Register
```
1. POST /api/v1/auth/register
2. Validate input (email, password, company)
3. Check email uniqueness in company
4. Hash password with bcrypt
5. Create user document
6. Generate JWT + Refresh token
7. Hash refresh token + store in DB
8. Return user + tokens (+ cookie if enabled)
```

#### Login
```
1. POST /api/v1/auth/login
2. Find user by email + company
3. Compare password with stored hash
4. Update lastLogin timestamp
5. Generate new token pair
6. Hash refresh token + store in DB
7. Return user + tokens (+ cookie if enabled)
```

#### Refresh Token
```
1. POST /api/v1/auth/refresh (with refresh token in body or cookie)
2. Verify refresh token signature
3. Compare provided token with stored hash in DB
4. Generate new access token
5. Rotate refresh token (new hash stored)
6. Return new token pair (+ updated cookie if enabled)
```

#### Protected Endpoints
```
1. Extract Bearer token from Authorization header
2. Verify JWT signature with access secret
3. Extract user + companyId from token
4. Attach to request context (req.user, req.companyId)
5. Proceed to route handler
```

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/change-password` - Change password (protected)
- `POST /api/v1/auth/logout` - Logout (protected)

### Products
- `GET /api/v1/products` - Get all products (paginated)
- `POST /api/v1/products` - Create product (admin/seller)
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product (admin/seller)
- `DELETE /api/v1/products/:id` - Delete product (admin/seller)
- `GET /api/v1/products/search/:query` - Search products
- `GET /api/v1/products/category/:category` - Get by category

## 🔒 Security Features

✅ **Helmet** - HTTP headers hardening
✅ **CORS** - Cross-origin resource sharing
✅ **Rate Limiting** - DDoS protection
✅ **bcryptjs** - Password hashing
✅ **JWT** - Secure token authentication
✅ **Zod** - Input validation
✅ **Error Handling** - Standardized error responses
✅ **Logging** - Audit trail with Winston

## 📊 Database Schema

### User
- Email (unique, indexed)
- Password (hashed with bcrypt)
- First Name / Last Name
- Role (user, admin, seller)
- Active Status
- Timestamps

### Product
- Name, Description
- Price, Cost
- SKU (unique)
- Images array
- Category (indexed)
- Tags
- Stock quantity
- Active Status
- TenantId (multi-tenancy)
- Created By (user reference)
- Timestamps

## 🛡️ Error Handling

All errors follow a standardized format:

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

## 🔑 Key Concepts

### Backend Ownership Rules
- All business logic lives in the backend.
- All AI integration logic lives in the backend.
- All MongoDB and Redis access lives in the backend.
- Every persisted record must be scoped by `companyId` for tenant isolation.
- The mobile application only calls backend APIs and never contains database logic.

### Feature-Based Architecture
Each feature (auth, products) contains its own:
- Routes
- Controllers
- Services
- Repositories
- Models
- Schemas
- Types

### Repository Pattern
Abstracts data access logic - all database queries go through repositories

### Service Layer
Contains business logic, can call multiple repositories

### Controller Layer
Handles HTTP requests, calls services, returns responses

### Middleware
- `protect` - JWT verification
- `authorize` - Role-based access control
- `validate` - Zod schema validation
- `errorHandler` - Global error catching

## 🔗 Dependencies

### Core
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **typescript** - Type safety

### Security
- **helmet** - Security headers
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **express-rate-limit** - Rate limiting
- **cors** - CORS handling

### Utilities
- **dotenv** - Environment variables
- **zod** - Input validation
- **winston** - Logging
- **axios** - HTTP client

### External APIs
- **openai** - OpenAI API
- **aws-sdk** - AWS services
- **firebase-admin** - Firebase notifications

## 📝 Scripts

```bash
npm run dev           # Start development server
npm run build         # Compile TypeScript
npm start             # Run compiled server
npm run lint          # Lint code
npm run format        # Format with Prettier
npm test              # Run tests
npm test:watch       # Run tests in watch mode
```

## 🚢 Deployment

### Docker
Create `Dockerfile` and `.dockerignore` for containerization

### Environment Variables
Use different `.env` files for each environment:
- `.env.development`
- `.env.staging`
- `.env.production`

### Build
```bash
npm run build
npm prune --production
```

### Start
```bash
npm start
```

## 📚 Next Steps

1. **Setup MongoDB Atlas**
   - Create cluster
   - Configure connection string
   - Setup IP whitelist

2. **Redis Setup** (optional)
   - Install Redis locally or use cloud provider
   - Configure REDIS_URL

3. **External Services**
   - OpenAI API key
   - AWS S3 credentials
   - Firebase setup

4. **CI/CD Pipeline**
   - GitHub Actions
   - Automated testing
   - Docker builds

5. **Additional Modules**
   - Orders feature
   - Analytics feature
   - Integrations (Shopify, Amazon, etc.)

## 📞 Support

For issues or questions, please create an issue or contact the team.

## 📄 License

MIT License - See LICENSE file for details
