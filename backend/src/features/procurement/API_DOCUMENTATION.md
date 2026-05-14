# Procurement Module API Documentation

## Overview
The Procurement module provides comprehensive endpoints for managing suppliers, purchase requests, and purchase orders. It includes business logic for approval workflows, budget tracking, and payment management.

## Base URL
```
/api/v1/procurement
```

## Authentication
All endpoints require authentication via Bearer token in the `Authorization` header:
```
Authorization: Bearer {token}
```

---

## API Endpoints

### Supplier Management

#### Create Supplier
```http
POST /suppliers
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** `manager`, `admin`

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "email": "supplies@acmecorp.com",
  "phone": "+1-555-0123",
  "address": "123 Business St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "paymentTerms": "NET-30",
  "contactPerson": "John Doe",
  "isPreferred": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "supplier-123",
    "name": "Acme Corporation",
    "email": "supplies@acmecorp.com",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Supplier with email already exists
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions

---

#### List Suppliers
```http
GET /suppliers?status=active&page=1&limit=20&search=acme
Authorization: Bearer {token}
```

**Required Role:** `viewer`, `analyst`, `manager`, `admin`, `super_admin`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `active`, `inactive`, `suspended` |
| `search` | string | Search by name or email |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |
| `sortBy` | string | Sort field: `name`, `createdAt`, `email` |
| `sortOrder` | string | `asc` or `desc` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "supplier-123",
      "name": "Acme Corporation",
      "email": "supplies@acmecorp.com",
      "phone": "+1-555-0123",
      "status": "active",
      "isPreferred": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

#### Get Supplier Details
```http
GET /suppliers/:id
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "supplier-123",
    "name": "Acme Corporation",
    "email": "supplies@acmecorp.com",
    "phone": "+1-555-0123",
    "address": "123 Business St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "paymentTerms": "NET-30",
    "contactPerson": "John Doe",
    "status": "active",
    "isPreferred": true,
    "rating": 4.5,
    "totalOrders": 15,
    "totalSpent": 125000,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:25:00Z"
  }
}
```

---

#### Update Supplier
```http
PUT /suppliers/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** `manager`, `admin`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "phone": "+1-555-0456",
  "paymentTerms": "NET-45",
  "isPreferred": true,
  "status": "inactive"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "supplier-123",
    "name": "Updated Name",
    "updatedAt": "2024-01-25T09:15:00Z"
  }
}
```

---

#### Delete Supplier
```http
DELETE /suppliers/:id
Authorization: Bearer {token}
```

**Required Role:** `admin`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "supplier-123",
    "message": "Supplier deleted successfully"
  }
}
```

---

### Purchase Request Management

#### Create Purchase Request
```http
POST /requests
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** `manager`, `admin`

**Request Body:**
```json
{
  "description": "Office Supplies - Pens and Notebooks",
  "quantity": 100,
  "estimatedCost": 500,
  "department": "Operations",
  "preferredSupplier": "supplier-123",
  "budget": "2024-Q1",
  "notes": "Needed for new team members"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "req-123",
    "description": "Office Supplies - Pens and Notebooks",
    "status": "pending",
    "quantity": 100,
    "estimatedCost": 500,
    "createdBy": "user-123",
    "createdAt": "2024-01-25T09:15:00Z"
  }
}
```

---

#### List Purchase Requests
```http
GET /requests?status=pending&department=Operations&page=1
Authorization: Bearer {token}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `pending`, `approved`, `rejected`, `completed` |
| `department` | string | Filter by department |
| `page` | number | Page number |
| `limit` | number | Results per page |

---

#### Get Purchase Request Details
```http
GET /requests/:id
Authorization: Bearer {token}
```

---

#### Approve Purchase Request
```http
POST /requests/:id/approve
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** `manager`, `admin`

**Request Body:**
```json
{
  "notes": "Approved for budget allocation",
  "approvedBy": "user-456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "req-123",
    "status": "approved",
    "approvals": {
      "approvedBy": "user-456",
      "approvedAt": "2024-01-25T10:00:00Z"
    }
  }
}
```

---

#### Reject Purchase Request
```http
POST /requests/:id/reject
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** `manager`, `admin`

**Request Body:**
```json
{
  "reason": "Budget exceeded for this quarter",
  "rejectedBy": "user-456"
}
```

---

### Purchase Order Management

#### Create Purchase Order
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** `manager`, `admin`

**Request Body:**
```json
{
  "supplierId": "supplier-123",
  "referenceNumber": "PR-2024-001",
  "items": [
    {
      "description": "Item 1",
      "quantity": 10,
      "unitPrice": 100,
      "totalPrice": 1000
    },
    {
      "description": "Item 2",
      "quantity": 5,
      "unitPrice": 50,
      "totalPrice": 250
    }
  ],
  "totalAmount": 1250,
  "deliveryDate": "2024-02-15",
  "shippingAddress": "123 Office St",
  "notes": "Deliver to main office"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "orderNumber": "PO-2024-001",
    "status": "draft",
    "supplierId": "supplier-123",
    "totalAmount": 1250,
    "createdAt": "2024-01-25T10:30:00Z"
  }
}
```

---

#### List Purchase Orders
```http
GET /orders?status=confirmed&supplierId=supplier-123&page=1
Authorization: Bearer {token}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `draft`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `supplierId` | string | Filter by supplier |
| `dateFrom` | date | Filter orders from date |
| `dateTo` | date | Filter orders to date |

---

#### Get Purchase Order Details
```http
GET /orders/:id
Authorization: Bearer {token}
```

---

#### Update Purchase Order
```http
PUT /orders/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Note:** Only draft orders can be updated

**Request Body:** (partial update)
```json
{
  "deliveryDate": "2024-02-20",
  "items": [
    {
      "description": "Updated Item",
      "quantity": 15,
      "unitPrice": 100,
      "totalPrice": 1500
    }
  ],
  "totalAmount": 1500
}
```

---

#### Confirm Purchase Order
```http
POST /orders/:id/confirm
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** `manager`, `admin`

**Request Body:**
```json
{
  "confirmedAt": "2024-01-25T11:00:00Z",
  "notes": "Order confirmed and sent to supplier"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "status": "confirmed",
    "orderNumber": "PO-2024-001"
  }
}
```

---

#### Update Order Status
```http
POST /orders/:id/status
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRK-123456",
  "notes": "Order dispatched"
}
```

**Valid Status Transitions:**
- `draft` → `confirmed`
- `confirmed` → `shipped`
- `shipped` → `delivered`
- Any → `cancelled` (with reason)

---

#### Record Payment
```http
POST /orders/:id/payment
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 1250,
  "method": "bank_transfer",
  "referenceNumber": "BANK-TXN-123456",
  "date": "2024-01-26T14:30:00Z",
  "notes": "Payment processed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "paymentStatus": "paid",
    "payment": {
      "amount": 1250,
      "method": "bank_transfer",
      "referenceNumber": "BANK-TXN-123456",
      "date": "2024-01-26T14:30:00Z"
    }
  }
}
```

---

### Statistics

#### Get Procurement Statistics
```http
GET /stats
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suppliers": {
      "total": 25,
      "active": 22,
      "inactive": 3,
      "preferred": 10
    },
    "purchaseRequests": {
      "total": 150,
      "pending": 15,
      "approved": 120,
      "rejected": 15
    },
    "purchaseOrders": {
      "total": 120,
      "draft": 5,
      "confirmed": 10,
      "shipped": 20,
      "delivered": 80,
      "cancelled": 5
    },
    "financials": {
      "totalSpent": 485000,
      "monthlyAverage": 40416,
      "pendingPayments": 12500,
      "topSupplier": {
        "id": "supplier-123",
        "name": "Acme Corp",
        "amount": 125000
      }
    }
  }
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400,
    "details": {
      "field": "Additional context"
    }
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `SUPPLIER_NOT_FOUND` | 404 | Supplier doesn't exist |
| `SUPPLIER_ALREADY_EXISTS` | 409 | Email already registered |
| `PURCHASE_REQUEST_NOT_FOUND` | 404 | Request doesn't exist |
| `INVALID_PURCHASE_REQUEST_STATUS` | 400 | Invalid status transition |
| `PURCHASE_ORDER_NOT_FOUND` | 404 | Order doesn't exist |
| `INVALID_PURCHASE_ORDER_STATUS` | 400 | Invalid order status |
| `INSUFFICIENT_BUDGET` | 400 | Budget exceeded |
| `INVALID_PAYMENT_STATE` | 400 | Cannot record payment on this order |
| `DUPLICATE_PAYMENT` | 409 | Payment already recorded |
| `VALIDATION_ERROR` | 400 | Missing/invalid required fields |
| `UNAUTHORIZED` | 401 | Missing/invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |

---

## Rate Limiting

- Create endpoints: 10 requests per minute per user
- Read endpoints: 100 requests per minute per user
- Update/Delete endpoints: 50 requests per minute per user

---

## Role-Based Access Control

| Operation | Required Role |
|-----------|---------------|
| Create Supplier | `manager`, `admin` |
| Edit Supplier | `manager`, `admin` |
| Delete Supplier | `admin` |
| View Supplier | All authenticated |
| Create PO | `manager`, `admin` |
| Edit PO | `manager`, `admin` |
| Approve PR | `manager`, `admin` |
| View Stats | All authenticated |

---

## Pagination

List endpoints support pagination:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Integration with Main App

To integrate the procurement module with your main application:

```typescript
import { registerProcurementModule } from "@features/procurement/index.js";

// In your main app setup
registerProcurementModule(app);
```

---

## Examples

### Example 1: Create a Supplier and Purchase Order

```bash
# 1. Create supplier
curl -X POST http://localhost:3000/api/v1/procurement/suppliers \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Supplies Inc",
    "email": "orders@techsupplies.com",
    "phone": "+1-800-123-4567"
  }'

# Response with supplier-123

# 2. Create purchase order
curl -X POST http://localhost:3000/api/v1/procurement/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier-123",
    "items": [
      {
        "description": "Laptop",
        "quantity": 5,
        "unitPrice": 1000,
        "totalPrice": 5000
      }
    ],
    "totalAmount": 5000
  }'
```

---

## Best Practices

1. **Validation**: All inputs are validated before processing
2. **Idempotency**: Use idempotency keys for create operations
3. **Pagination**: Always use pagination for list endpoints
4. **Filtering**: Use query parameters for efficient filtering
5. **Error Handling**: Always check error responses and handle appropriately
6. **Rate Limiting**: Implement exponential backoff for retries

---

## Support

For issues or questions, contact: procurement-api@example.com
