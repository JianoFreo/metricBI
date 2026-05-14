# Production-Grade Authentication System - Implementation Guide

## Overview

This document describes the complete authentication system implementation for MetricBI - a production-ready SaaS multi-tenant platform with JWT tokens, role-based access control, and secure password management.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Application                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ POST /register, /login
                 ↓
         ┌──────────────────┐
         │  Auth Routes     │
         │  (auth.routes)   │
         └────────┬─────────┘
                  │
                  ↓
         ┌──────────────────┐
         │ Auth Controller  │
         │ (HTTP handlers)  │
         └────────┬─────────┘
                  │
                  ↓
         ┌──────────────────┐
         │  Auth Service    │
         │  (Business Logic)│
         └────────┬─────────┘
                  │
         ┌────────┴─────────┐
         ↓                  ↓
    ┌──────────┐      ┌──────────────┐
    │Repository│      │Token Utility │
    │(Database)│      │(JWT & Crypto)│
    └──────────┘      └──────────────┘
         │                  │
         ↓                  ↓
    ┌──────────────────────────────┐
    │    MongoDB + Mongoose        │
    │  (User documents + hashes)   │
    └──────────────────────────────┘
```

## Core Components

### 1. User Model (`src/features/auth/models/User.ts`)

```typescript
// Key fields:
- email (unique per company, indexed)
- password (hashed with bcrypt, never returned)
- refreshTokenHash (hashed refresh token for rotation)
- companyId (tenant ID for multi-tenancy)
- role (viewer | analyst | manager | admin | super_admin)
- isActive (soft delete capability)
- createdAt, updatedAt (timestamps)
- lastLogin (audit trail)

// Indexes:
- { email: 1, companyId: 1, unique: true }
- { companyId: 1, role: 1 }
```

### 2. Auth Service (`src/features/auth/services/auth.service.ts`)

Implements core authentication logic:

```typescript
AuthService:
  ├── register(data) → IAuthResponse
  │   ├── Verify email uniqueness in company
  │   ├── Hash password with bcrypt
  │   ├── Create user document
  │   ├── Generate JWT + refresh token
  │   ├── Hash & store refresh token
  │   └── Return user + tokens
  │
  ├── login(data) → IAuthResponse
  │   ├── Find user by email + company
  │   ├── Compare password hash
  │   ├── Update lastLogin
  │   ├── Generate token pair
  │   ├── Hash & store new refresh token
  │   └── Return user + tokens
  │
  ├── refreshAccessToken(refreshToken) → TokenPair
  │   ├── Verify refresh token signature
  │   ├── Compare with stored hash (token rotation)
  │   ├── Generate new token pair
  │   ├── Hash & store new refresh token
  │   └── Return new tokens
  │
  ├── updatePassword(userId, oldPassword, newPassword)
  │   ├── Verify user exists
  │   ├── Compare old password hash
  │   ├── Hash new password
  │   ├── Update user document
  │   ├── Clear refresh token (force re-login)
  │   └── Return success
  │
  └── logout(userId)
      ├── Clear refresh token hash
      └── Mark session as invalid
```

### 3. Token Utility (`src/features/auth/utils/token.utils.ts`)

Handles all JWT and cryptographic operations:

```typescript
createTokenPair(payload)
  → { accessToken (15m), refreshToken (7d) }

verifyToken(token, secret)
  → DecodedToken | null

hashRefreshToken(token)
  → bcrypt hash (for storage)

compareRefreshToken(token, hash)
  → boolean (for token rotation validation)

getRefreshTokenFromRequest(req)
  → string | null (from body or cookie)

setRefreshTokenCookie(res, token)
  → Sets HttpOnly cookie with security flags

clearRefreshTokenCookie(res)
  → Clears refresh token cookie
```

### 4. Auth Controller (`src/features/auth/controllers/auth.controller.ts`)

HTTP request handlers:

```typescript
register(req, res)
  → POST /api/v1/auth/register
  → Creates new user account

login(req, res)
  → POST /api/v1/auth/login
  → Authenticates user

refreshToken(req, res)
  → POST /api/v1/auth/refresh
  → Rotates refresh token

getProfile(req, res)
  → GET /api/v1/auth/me
  → Returns current user (protected)

changePassword(req, res)
  → POST /api/v1/auth/change-password
  → Changes password (protected)

logout(req, res)
  → POST /api/v1/auth/logout
  → Logs out user (protected)
```

### 5. Auth Middleware (`src/features/auth/middleware/auth.middleware.ts`)

Enforces authentication and authorization:

```typescript
protect(req, res, next)
  ├── Extract Bearer token from Authorization header
  ├── Verify JWT signature
  ├── Attach user + companyId to request
  └── Call next() or throw AuthenticationError

verifyTenant(req, res, next)
  ├── Check req.user exists
  ├── Verify requested tenant matches user's company
  ├── Allow super_admin to bypass (platform admin)
  └── Call next() or throw AuthorizationError

requireRole(...roles)(req, res, next)
  ├── Check req.user exists
  ├── Verify user.role in allowed roles
  └── Call next() or throw AuthorizationError
```

### 6. Zod Schemas (`src/features/auth/schemas/auth.schemas.ts`)

Input validation:

```typescript
registerSchema
  ├── companyId: string (required)
  ├── email: string (valid email format)
  ├── password: string (≥8 chars, uppercase, lowercase, number)
  ├── firstName: string (≥2 chars)
  ├── lastName: string (≥2 chars)
  └── role: enum (optional, defaults to "viewer")

loginSchema
  ├── companyId: string (required)
  ├── email: string (valid email format)
  └── password: string (≥1 char)

refreshTokenSchema
  └── refreshToken: string (optional - from body or cookie)

changePasswordSchema
  ├── oldPassword: string (≥1 char)
  └── newPassword: string (≥8 chars, uppercase, lowercase, number)
```

### 7. Auth Routes (`src/features/auth/routes/auth.routes.ts`)

Endpoint definitions:

```typescript
Public Routes (no auth required):
  POST /register  → register controller
  POST /login     → login controller
  POST /refresh   → refreshToken controller

Protected Routes (require JWT):
  GET  /me                → getProfile
  POST /change-password   → changePassword
  POST /logout            → logout

Middleware Chain:
  Public: authLimiter → validate(schema) → controller
  Protected: protect → verifyTenant → validate(schema) → controller
```

## Authentication Flows

### Register Flow

```
Client                          Backend
  │                              │
  ├─ POST /register ──────────→ │
  │  {                           │
  │    companyId,                │
  │    email,                    │
  │    password (plaintext),     │
  │    firstName,                │
  │    lastName                  │
  │  }                           │
  │                              │
  │                           ① ├─ Validate Zod schema
  │                           ② ├─ Check email uniqueness
  │                           ③ ├─ Hash password (bcrypt)
  │                           ④ ├─ Create User document
  │                           ⑤ ├─ Generate JWT pair
  │                           ⑥ ├─ Hash refresh token
  │                           ⑦ ├─ Store hash in DB
  │                              │
  │  ← 201 Created ────────────┤ ⑧ ├─ Return response
  │  {                           │
  │    user: {                   │
  │      _id,                    │
  │      email,                  │
  │      firstName,              │
  │      lastName,               │
  │      role,                   │
  │      companyId,              │
  │      createdAt               │
  │      // NO password          │
  │    },                        │
  │    tokens: {                 │
  │      accessToken (JWT),      │
  │      refreshToken (JWT)      │
  │    }                         │
  │  }                           │
  │                              │
  │  [Sets HttpOnly cookie if    │
  │   AUTH_USE_COOKIES=true]     │
```

### Login Flow

```
Client                          Backend
  │                              │
  ├─ POST /login ────────────→ │
  │  {                           │
  │    companyId,                │
  │    email,                    │
  │    password (plaintext)      │
  │  }                           │
  │                              │
  │                           ① ├─ Validate schema
  │                           ② ├─ Find user
  │                           ③ ├─ Compare password hash
  │                           ④ ├─ Update lastLogin
  │                           ⑤ ├─ Generate new tokens
  │                           ⑥ ├─ Hash refresh token
  │                           ⑦ ├─ Store new hash (replaces old)
  │                              │
  │  ← 200 OK ────────────────┤ ⑧ ├─ Return response
  │  {                           │
  │    user: { ... },            │
  │    tokens: {                 │
  │      accessToken,            │
  │      refreshToken            │
  │    }                         │
  │  }                           │
```

### Refresh Token Flow

```
Client                          Backend
  │                              │
  ├─ POST /refresh ──────────→ │
  │  {                           │
  │    refreshToken: "..."       │
  │  }                           │
  │  OR                          │
  │  [Cookie: metricbi_refresh_token=...]
  │                              │
  │                           ① ├─ Extract token from body/cookie
  │                           ② ├─ Verify JWT signature
  │                           ③ ├─ Find user
  │                           ④ ├─ Get stored hash
  │                           ⑤ ├─ Compare tokens
  │                           ⑥ ├─ Generate NEW tokens
  │                           ⑦ ├─ Hash new refresh token
  │                           ⑧ ├─ Store new hash (old one invalidated)
  │                              │
  │  ← 200 OK ────────────────┤ ⑨ ├─ Return new token pair
  │  {                           │
  │    accessToken,              │
  │    refreshToken              │
  │  }                           │
  │                              │
  │  Refresh tokens rotated:     │
  │  - Old token's hash deleted  │
  │  - Only new token is valid   │
  │  - Prevents token reuse      │
```

### Protected Resource Access Flow

```
Client                          Backend
  │                              │
  ├─ GET /api/v1/assets ────→  │
  │  Headers: {                  │
  │    Authorization:            │
  │    "Bearer <accessToken>"    │
  │  }                           │
  │                              │
  │                           ① ├─ Extract token from header
  │                           ② ├─ Verify JWT signature
  │                           ③ ├─ Decode token → {userId, companyId, role}
  │                           ④ ├─ Attach to req.user, req.companyId
  │                              │
  │                           ⑤ ├─ Check role permission
  │                           ⑥ ├─ Query: Asset.find({companyId: req.companyId})
  │                           ⑦ ├─ Service logic
  │                              │
  │  ← 200 OK ────────────────┤ ⑧ ├─ Return data
  │  [                           │
  │    {                         │
  │      _id,                    │
  │      name,                   │
  │      companyId (same tenant) │
  │    }                         │
  │  ]                           │
```

## Security Features

### 1. JWT Token Strategy
- **Access Token** (15 minutes)
  - Short expiry = limited damage if stolen
  - Stored in memory (not secure storage like localStorage)
  - Included in Authorization header

- **Refresh Token** (7 days)
  - Long expiry for convenience
  - Stored as HttpOnly cookie (JavaScript can't access)
  - OR in secure request body
  - Hashed in database (not stored as plaintext)

### 2. Token Rotation
- Each refresh generates a NEW refresh token
- Old token's hash is immediately deleted
- Prevents token reuse attacks
- Detects token compromise (can't use old token twice)

### 3. Password Security
```
Plaintext Password → Bcrypt (10 rounds) → Stored Hash
Never transmitted, never returned in API response
```

### 4. Rate Limiting
```
Auth Endpoints: 5 attempts / 15 minutes
  Prevents brute force attacks on login/register

API endpoints: 100 requests / 15 minutes
  DDoS protection on all routes
```

### 5. Multi-Tenancy Isolation
```
Every query includes: { companyId: req.companyId }
Cross-tenant access impossible at middleware level
Super_admin can audit other tenants (with logging)
```

### 6. RBAC Hierarchy
```
viewer      < analyst      < manager      < admin      < super_admin
  ↓           ↓             ↓              ↓            ↓
 Read        Read        Read+Create    Manage Users  Platform Admin
 Only        Only        Update         Settings      Any Company
```

## Environment Configuration

```env
# JWT Configuration
JWT_ACCESS_SECRET=your_very_long_random_string_at_least_32_characters
JWT_REFRESH_SECRET=another_very_long_random_string_at_least_32_characters
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cookie Configuration (optional)
AUTH_USE_COOKIES=false                    # Set to true to use HttpOnly cookies
AUTH_COOKIE_NAME=metricbi_refresh_token
AUTH_COOKIE_DOMAIN=.example.com          # Optional

# Security
NODE_ENV=production        # Use production in production!
```

## Testing the Authentication System

### 1. Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "650abcd1234567890123456",
    "email": "user@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "650xyz...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "viewer",
      "companyId": "650abcd...",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "650abcd1234567890123456",
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

### 3. Get Profile (Protected)
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'
```

## Production Checklist

- [ ] All JWT_*_SECRET values are ≥32 characters
- [ ] NODE_ENV=production in production environment
- [ ] MongoDB connection uses strong credentials
- [ ] HTTPS enabled (required for secure cookies)
- [ ] Rate limiting configured appropriately
- [ ] Logging captures auth events
- [ ] Error messages don't leak sensitive info
- [ ] Password reset flow implemented (if needed)
- [ ] Token blacklist/revocation implemented (optional)
- [ ] Audit logs for login/logout/password changes
- [ ] 2FA implemented (if required)
- [ ] Admin dashboard for user management

## Deployment Notes

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables (Secrets Management)
Use Docker secrets or environment service (Kubernetes, AWS Secrets Manager, etc.)

### Database Backups
- Regular MongoDB backups
- Test restore procedures
- Document recovery process

### Monitoring
- Monitor 401/403 errors (auth failures)
- Track rate limit hits
- Alert on unusual login patterns
- Log all password changes

## Future Enhancements

1. **2FA (Two-Factor Authentication)**
   - TOTP (Time-based One-Time Password)
   - SMS/Email verification

2. **OAuth 2.0 Integration**
   - Google, GitHub, Microsoft sign-in
   - Third-party application access

3. **Token Revocation**
   - Immediate logout (blacklist)
   - Device management

4. **Password Reset**
   - Email verification flow
   - Secure token with expiry

5. **Session Management**
   - Active sessions list
   - Logout from all devices
   - IP address tracking

6. **Audit Logging**
   - All auth events to separate collection
   - Failed login attempts
   - Password changes
   - Role changes

## References

- [JWT.io](https://jwt.io/) - JWT structure and validation
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Zod Validation](https://zod.dev/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## Support

For issues or questions about the authentication system, please contact the development team or create an issue in the repository.
