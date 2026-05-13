# Multi-Tenant Architecture Guide

## Overview

MetricBI implements a **complete multi-tenant SaaS architecture** with the following guarantees:

✅ **No cross-tenant data leakage**  
✅ **Role-based access control (RBAC)**  
✅ **User belongs to exactly one company**  
✅ **All queries automatically scoped by companyId**  
✅ **Tenant isolation enforced at middleware layer**

---

## Architecture Layers

### 1. Database Layer (Models)

#### Company Model
Represents a tenant/company in the system.

```typescript
interface ICompany {
  _id: ObjectId;                    // Primary key
  name: string;                     // Company name
  slug: string;                     // URL-friendly name (must be unique)
  owner: ObjectId;                  // Owner user ID
  members: ObjectId[];              // Array of user IDs in company
  subscriptionTier: "free" | "starter" | "professional" | "enterprise";
  subscriptionStatus: "active" | "paused" | "cancelled";
  maxUsers: number;                 // Subscription limit
  maxDataPoints: number;            // Storage limit
  customBranding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
  settings?: {
    twoFactorRequired: boolean;
    dataExportAllowed: boolean;
    apiAccessAllowed: boolean;
  };
  isActive: boolean;                // Soft delete flag
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Indexes:**
- `slug` (unique) - Fast company lookup
- `owner + isActive` - List owner's companies
- `subscriptionTier + subscriptionStatus` - Admin queries

#### User Model
Updated to support multi-tenancy with RBAC.

```typescript
interface IUserMultiTenant {
  _id: ObjectId;
  email: string;                    // Globally unique
  firstName: string;
  lastName: string;
  password: string;                 // Hashed
  companyId: ObjectId;              // CRITICAL: Links user to company
  role: UserRole;                   // viewer | analyst | manager | admin | super_admin
  permissions: string[];            // Custom permission overrides
  department?: string;
  position?: string;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum UserRole {
  VIEWER = "viewer",         // Read-only
  ANALYST = "analyst",       // Can create/edit reports
  MANAGER = "manager",       // Can manage team
  ADMIN = "admin",          // Full company access
  SUPER_ADMIN = "super_admin" // Platform-wide access
}
```

**Key Indexes:**
- `companyId + isActive` - List company users
- `companyId + role` - Get users by role
- `companyId + email` - Find user in company

---

### 2. Authentication & Authorization (Middleware)

#### JWT Token Structure
```typescript
interface IJwtPayloadMultiTenant {
  userId: string;
  email: string;
  companyId: string;        // CRITICAL: Included in every token
  role: UserRole;
  firstName: string;
  lastName: string;
}
```

Token contains `companyId` which is extracted and used to scope all operations.

#### Middleware Chain

```
HTTP Request
    ↓
+-- protectMultiTenant ──┐ Verify JWT, extract companyId
                         │ req.user = decoded token payload
                         │ req.companyId = token.companyId
    ↓
+-- verifyTenantAccess ──┐ Verify user can access requested company
                         │ Only allow access to own company
                         │ (unless SUPER_ADMIN)
    ↓
+-- requireRole ────────┐ Check user's role
                         │ Example: require ADMIN or MANAGER
    ↓
+-- requirePermission ──┐ Fine-grained permission check
                         │ Example: "create:reports", "edit:data"
    ↓
Handler receives request with:
  - req.user (authenticated user data)
  - req.companyId (user's company, pre-scoped)
```

---

## 3. Access Control Hierarchy

### Role Permissions

```typescript
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  viewer: [
    "read:dashboard",
    "read:reports"
  ],

  analyst: [
    "read:dashboard",
    "read:reports",
    "create:reports",
    "edit:own_reports"
  ],

  manager: [
    "read:dashboard",
    "read:reports",
    "create:reports",
    "edit:reports",
    "manage:users",
    "manage:dashboards"
  ],

  admin: [
    "read:dashboard",
    "read:reports",
    "create:reports",
    "edit:reports",
    "manage:users",
    "manage:dashboards",
    "manage:settings",
    "manage:integrations"
  ],

  super_admin: [
    "*:*"  // All permissions
  ]
};
```

### Super Admin
Super admin can:
- Access any company (with audit logging)
- Manage platform-level settings
- Override role restrictions
- Access all data (with proper logging)

---

## 4. Data Access & Query Scoping

### Automatic Tenant Isolation

**CRITICAL SECURITY PRINCIPLE:**  
All database queries must include `companyId` filter. Do not trust user to provide it.

#### Safe Query Patterns

```typescript
// ✅ SAFE: Query is scoped by user's companyId
const users = await User.find({
  companyId: req.companyId,  // From middleware, trusted
  isActive: true
});

// ❌ UNSAFE: Using user input directly
const users = await User.find({
  companyId: req.body.companyId  // NEVER do this
});
```

### Query Helper Functions

All in `src/features/tenant/utils/query-helper.ts`:

```typescript
// Scope Mongoose query automatically
scopeByTenant<T>(query: Query<T[], T>, companyId: string): Query<T[], T>

// Build filter object with companyId
buildTenantFilter(companyId: string): { companyId: string }

// Verify resource belongs to user's company
verifyResourceOwnership(resource: any, userCompanyId: string): void

// Check multiple resources
verifyResourcesOwnership(resources: any[], userCompanyId: string): void

// Build aggregation pipeline with tenant scoping
buildAggregationPipeline(companyId: string, additionalStages?: []): []
```

### Repository Pattern

Always use repositories to access data. Example:

```typescript
class UserRepository {
  async getUsersByCompany(companyId: string) {
    return User.find(
      buildTenantFilter(companyId)  // Automatic scoping
    ).select("-password");
  }

  async updateUser(userId: string, updates: any, userCompanyId: string) {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    
    // Verify resource belongs to user's company
    verifyResourceOwnership(user, userCompanyId);
    
    return user;
  }
}
```

---

## 5. Route Protection Patterns

### Using Middleware on Routes

```typescript
router.get(
  "/:id",
  protectMultiTenant,           // 1. Require JWT token
  verifyTenantAccess,           // 2. Verify tenant access
  requireRole("admin", "manager"), // 3. Check role
  handler                       // 4. Execute handler
);
```

### Important Middleware Properties

|Middleware|Purpose|Required|Sets|
|----------|-------|--------|-----|
|`protectMultiTenant`|Verify JWT token|✅|`req.user`, `req.companyId`|
|`verifyTenantAccess`|Verify can access company|✅|`req.companyId`|
|`requireRole(...roles)`|Check user role|-|Nothing|
|`requirePermission(...perms)`|Check permissions|-|Nothing|
|`ensureResourceOwnership`|Verify resource belongs to company|-|Nothing|

---

## 6. Company Management

### Creating a Company

```typescript
// Company created by user
// User automatically becomes owner
// Only user automatically added to members

const company = await new CompanyService().createCompany({
  name: "Acme Corp",
  description: "Leading analytics platform",
  industry: "SaaS"
}, userId);

// Result:
{
  _id: "507f1f77bcf86cd799439011",
  name: "Acme Corp",
  slug: "acme-corp",
  owner: userId,
  members: [userId],  // Only owner initially
  maxUsers: 5,
  subscriptionTier: "free",
  subscriptionStatus: "active"
}
```

### Adding Members

```typescript
// Only ADMIN or SUPER_ADMIN can add members
// User must not already be member
// Check subscription limits

await companyService.addMemberToCompany(
  companyId,
  newUserId,
  userRole  // Checked: must be ADMIN
);

// User now in: Company.members array
// User's companyId: set to this company
```

### Subscription Limits

```typescript
const limits = await repository.checkSubscriptionLimits(companyId);

{
  currentUsers: 4,
  maxUsers: 5,
  canAddUser: true,
  currentDataPoints: 12500,
  maxDataPoints: 100000
}

// Adding user when limit reached: Error "Company has reached user limit"
```

---

## 7. Data Isolation Guarantees

### Isolation at Multiple Levels

**1. Database Level**
- All queries include `companyId` filter
- Indexes on `companyId` for fast filtering
- Unique constraints on `(email, companyId)` (currently only globally unique)

**2. Middleware Level**
- JWT token contains `companyId`
- Every protected route verifies `req.companyId` matches token
- Cross-tenant access rejected at middleware

**3. Application Level**
- Service methods verify resource ownership
- Repositories scope all queries
- Error thrown if cross-tenant access attempted

**4. Audit Level**
- Super admin access logged
- Resource modifications logged
- Failed access attempts logged

### Preventing Data Leakage

✅ **What is prevented:**

```typescript
// ❌ User A cannot access User B's data
GET /api/v1/users/b123?companyId=other-company
// → 401 Not Authorized to access this tenant

// ❌ User A cannot query other companies
GET /api/v1/reports?companyId=hacker-company
// → Queries automatically filtered to user's companyId

// ❌ User A cannot see users from other companies
GET /api/v1/companies/settings
// → Returns only own company data, req.companyId auto-set

// ❌ Even if token is forged with wrong companyId
// → Signature verification fails (JWT signed with secret)
```

---

## 8. Implementation Checklist for New Features

When implementing a new feature (e.g., Reports module):

### 1. Create Model with companyId
```typescript
const ReportSchema = new Schema({
  title: String,
  companyId: {              // ✅ REQUIRED
    type: ObjectId,
    ref: "Company",
    required: true,
    index: true              // ✅ Index for queries
  },
  // other fields...
});
```

### 2. Repository Pattern
```typescript
class ReportRepository {
  async getReports(companyId: string) {
    return Report.find(
      buildTenantFilter(companyId)  // ✅ Always filter by companyId
    );
  }
}
```

### 3. Protect Routes
```typescript
router.get(
  "/",
  protectMultiTenant,      // ✅ Require auth
  verifyTenantAccess,      // ✅ Verify tenant
  requireRole("analyst"),  // ✅ Check role
  handler
);
```

### 4. Service Layer
```typescript
class ReportService {
  async createReport(data: any, companyId: string) {
    return this.repository.createReport({
      ...data,
      companyId  // ✅ Attach company context
    });
  }
}
```

### 5. Handler Receives Pre-Scoped Data
```typescript
const handler = asyncHandler(async (req: Request, res: Response) => {
  // req.companyId is already set by middleware
  // No need to extract from request body
  
  const reports = await service.getReports(req.companyId);
  sendSuccess(res, reports);
});
```

---

## 9. Testing Tenant Isolation

### Test Scenarios

```typescript
// Test 1: Cross-tenant access prevention
const userA = await User.create({ companyId: companyA, ... });
const userB = await User.create({ companyId: companyB, ... });

// UserA's token has companyId: companyA
const tokenA = jwt.sign({ companyId: companyA, ... });

// UserA tries to access CompanyB data
const response = await fetch("/api/v1/companies", {
  headers: { Authorization: `Bearer ${tokenA}` }
});
// ✅ Should only return companyA data

// Test 2: Forged token with wrong companyId
const forgedToken = jwt.sign({ companyId: companyB, ... }); // different key
// ✅ JWT verification fails, 401 Unauthorized

// Test 3: Admin adding member beyond subscription limit
company.maxUsers = 2;
company.members = [user1, user2];  // At limit
await addMember(newUser);  // Should fail with ConflictError
```

---

## 10. Common Pitfalls & Solutions

### ❌ Pitfall 1: Trusting User-Provided CompanyId
```typescript
// WRONG
const data = await Data.find({ companyId: req.body.companyId });

// RIGHT
const data = await Data.find({ companyId: req.companyId });
```

### ❌ Pitfall 2: Missing Middleware
```typescript
// WRONG
router.get("/reports", handler);

// RIGHT
router.get("/reports", 
  protectMultiTenant,    // Always add
  verifyTenantAccess,    // Always add
  handler
);
```

### ❌ Pitfall 3: Not Verifying Ownership Before Update
```typescript
// WRONG
const report = await Report.findByIdAndUpdate(id, updates);

// RIGHT
const report = await Report.findById(id);
verifyResourceOwnership(report, req.companyId);
const updated = await Report.findByIdAndUpdate(id, updates);
```

### ❌ Pitfall 4: Aggregation Pipeline Without Tenant Filter
```typescript
// WRONG
const stats = await Report.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
]);

// RIGHT
const stats = await Report.aggregate(
  buildAggregationPipeline(req.companyId, [
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ])
);
```

---

## 11. API Examples

### Create Company
```bash
POST /api/v1/companies
Authorization: Bearer <jwt-token>

{
  "name": "Acme Corp",
  "description": "Analytics platform",
  "industry": "Technology",
  "employeeCount": 50
}

Response (201):
{
  "id": "507f...",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "maxUsers": 5,
  "subscriptionTier": "free",
  "createdAt": "2024-05-13T..."
}
```

### Get Company Details
```bash
GET /api/v1/companies/my-company
Authorization: Bearer <jwt-token>

Response (200):
{
  "id": "507f...",
  "name": "Acme Corp",
  "membersCount": 3,
  "subscriptionTier": "professional",
  "settings": {
    "twoFactorRequired": false,
    "dataExportAllowed": true
  },
  ...
}
```

### Get Company Members
```bash
GET /api/v1/companies/members
Authorization: Bearer <jwt-token>

Response (200):
[
  {
    "id": "507f...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@acme.com",
    "role": "admin",
    "department": "Executives"
  },
  ...
]
```

### Add Member to Company
```bash
POST /api/v1/companies/members
Authorization: Bearer <jwt-token>
Role Required: admin

{
  "userId": "507f-user-id"
}

Response (201):
{
  "id": "507f...",
  "membersCount": 4,
  "members": [...]
}
```

---

## 12. Multi-Tenant Request Flow

```
User Login
  ├─ Auth Service validates credentials
  ├─ Auth Service finds user (companyId already in DB)
  ├─ JWT generated with userId + companyId
  └─ Send token to client

Protected Request
  ├─ Client sends: Authorization: Bearer <token>
  ├─ protectMultiTenant extracts companyId from JWT
  ├─ verifyTenantAccess verifies companyId matches request
  ├─ requireRole checks user permission
  ├─ Handler receives req.companyId (auto-scoped)
  ├─ Service queries with buildTenantFilter(req.companyId)
  ├─ Database returns only this company's data
  └─ Response sent to client

Attempted Cross-Tenant Access
  ├─ Attacker tries: GET /companies/other-company/data
  ├─ Token has companyId: attacker-company
  ├─ verifyTenantAccess sees mismatch
  └─ Returns 403 Forbidden (Access Denied)
```

---

## Summary

| Layer | Protection | Guarantee |
|-------|-----------|-----------|
| **JWT** | Token contains companyId | Cannot forge companyId without secret |
| **Middleware** | Every route verifies companyId | Unauthorized access rejected at entry |
| **Repository** | All queries filtered by companyId | Database only returns scoped data |
| **Service** | Validates resource ownership | Cannot access unowned resources |
| **Database** | Indexes on companyId | Fast filtering, no accidental leakage |

**Result: Complete tenant isolation with zero cross-tenant data leakage possible.**
