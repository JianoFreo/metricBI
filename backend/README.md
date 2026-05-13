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

## 📚 API Endpoints

### Authentication
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
