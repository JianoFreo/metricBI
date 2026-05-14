# Procurement Module - Integration Checklist

## Pre-Integration Requirements

- [ ] Node.js and npm installed
- [ ] Express.js app setup
- [ ] MongoDB connection configured
- [ ] Authentication middleware in place
- [ ] Environment variables file ready

## Integration Steps

### 1. Module Registration

In your main application file (e.g., `app.ts` or `server.ts`):

```typescript
import express from 'express';
import { registerProcurementModule } from '@features/procurement/index.js';

const app = express();

// ... other setup ...

// Register procurement module
registerProcurementModule(app);

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 2. Database Setup

#### Create Collections

Run these commands to create required collections:

```bash
# Using MongoDB CLI
mongo

# Create collections with validators
use metricbi_dev

db.createCollection('suppliers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tenantId', 'name', 'email', 'status'],
      properties: {
        _id: { bsonType: 'objectId' },
        tenantId: { bsonType: 'string' },
        name: { bsonType: 'string' },
        email: { bsonType: 'string' },
        status: { enum: ['active', 'inactive', 'suspended'] }
      }
    }
  }
})

db.createCollection('purchase_requests', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tenantId', 'description', 'quantity', 'status'],
      properties: {
        status: { enum: ['pending', 'approved', 'rejected', 'completed'] }
      }
    }
  }
})

db.createCollection('purchase_orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tenantId', 'supplierId', 'totalAmount', 'status'],
      properties: {
        status: { enum: ['draft', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
        paymentStatus: { enum: ['pending', 'partial', 'paid'] }
      }
    }
  }
})
```

#### Create Indexes

```bash
# Suppliers indexes
db.suppliers.createIndex({ tenantId: 1 })
db.suppliers.createIndex({ email: 1, tenantId: 1 }, { unique: true })
db.suppliers.createIndex({ status: 1 })
db.suppliers.createIndex({ createdAt: -1 })

# Purchase Requests indexes
db.purchase_requests.createIndex({ tenantId: 1 })
db.purchase_requests.createIndex({ status: 1 })
db.purchase_requests.createIndex({ department: 1 })
db.purchase_requests.createIndex({ createdAt: -1 })

# Purchase Orders indexes
db.purchase_orders.createIndex({ tenantId: 1 })
db.purchase_orders.createIndex({ orderNumber: 1, tenantId: 1 }, { unique: true })
db.purchase_orders.createIndex({ supplierId: 1 })
db.purchase_orders.createIndex({ status: 1 })
db.purchase_orders.createIndex({ paymentStatus: 1 })
db.purchase_orders.createIndex({ createdAt: -1 })
```

### 3. Environment Variables

Add to your `.env` file:

```env
# Procurement Settings
PROCUREMENT_BUDGET_CHECK_ENABLED=true
PROCUREMENT_MAX_ORDER_AMOUNT=100000
PROCUREMENT_AUTO_COMPLETE_DELIVERY=false
PROCUREMENT_PAYMENT_REMINDER_DAYS=7

# You should already have these
MONGODB_URI=mongodb://localhost:27017/metricbi
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 4. Verify Route Integration

Test that routes are accessible:

```bash
# Test supplier endpoint
curl -X GET http://localhost:3000/api/v1/procurement/suppliers \
  -H "Authorization: Bearer your-token"

# Expected response:
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### 5. Role-Based Access Setup

Ensure your authentication middleware includes roles:

```typescript
// In your auth middleware
interface TokenPayload {
  userId: string;
  tenantId: string;
  role: 'viewer' | 'analyst' | 'manager' | 'admin' | 'super_admin';
}

// Roles and their permissions
const roleHierarchy = {
  viewer: ['read'],
  analyst: ['read'],
  manager: ['read', 'write', 'approve'],
  admin: ['read', 'write', 'approve', 'delete'],
  super_admin: ['all']
};
```

### 6. Run Tests

```bash
# Run all procurement tests
npm run test -- procurement

# Run with coverage
npm run test -- --coverage procurement

# Run specific test file
npm run test -- procurement.routes.test.ts
```

### 7. API Documentation Access

The module includes comprehensive documentation:

- **API Reference**: See `procurement/API_DOCUMENTATION.md`
- **README**: See `procurement/README.md`
- **Examples**: See below

### 8. Monitoring & Logging

Add logging to track operations:

```typescript
// In your logger middleware
import logger from '@common/logger';

// Logs all procurement API calls
app.use('/api/v1/procurement', (req, res, next) => {
  logger.info(`[Procurement] ${req.method} ${req.path}`, {
    userId: req.user?.id,
    tenantId: req.user?.tenantId
  });
  next();
});
```

## Quick Start Examples

### Create Your First Supplier

```bash
curl -X POST http://localhost:3000/api/v1/procurement/suppliers \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Supplies Inc",
    "email": "contact@abcsupplies.com",
    "phone": "+1-555-0123",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "paymentTerms": "NET-30",
    "contactPerson": "John Smith"
  }'
```

### Create a Purchase Request

```bash
curl -X POST http://localhost:3000/api/v1/procurement/requests \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Office furniture - Desks and chairs",
    "quantity": 10,
    "estimatedCost": 5000,
    "department": "Operations",
    "preferredSupplier": "supplier-id-from-above",
    "budget": "2024-Q1",
    "notes": "Priority: High"
  }'
```

### Create and Confirm a Purchase Order

```bash
# Step 1: Create order
curl -X POST http://localhost:3000/api/v1/procurement/orders \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier-id",
    "items": [
      {
        "description": "Office Chair - Ergonomic",
        "quantity": 10,
        "unitPrice": 300,
        "totalPrice": 3000
      },
      {
        "description": "Standing Desk",
        "quantity": 10,
        "unitPrice": 200,
        "totalPrice": 2000
      }
    ],
    "totalAmount": 5000,
    "deliveryDate": "2024-02-15",
    "shippingAddress": "123 Office St, New York, NY 10001",
    "notes": "Deliver to main office"
  }'
  
# Response: { "id": "order-123", ... }

# Step 2: Confirm order
curl -X POST http://localhost:3000/api/v1/procurement/orders/order-123/confirm \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Order confirmed - PO sent to supplier"
  }'
```

### Update Order Status

```bash
# Mark as shipped
curl -X POST http://localhost:3000/api/v1/procurement/orders/order-123/status \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingNumber": "TRACK-123456",
    "notes": "Dispatched from warehouse"
  }'

# Mark as delivered
curl -X POST http://localhost:3000/api/v1/procurement/orders/order-123/status \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered",
    "notes": "Received and verified"
  }'
```

### Record Payment

```bash
curl -X POST http://localhost:3000/api/v1/procurement/orders/order-123/payment \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "method": "bank_transfer",
    "referenceNumber": "BANK-TXN-20240115001",
    "date": "2024-01-26T14:30:00Z",
    "notes": "Payment processed via company bank account"
  }'
```

### View Statistics

```bash
curl -X GET http://localhost:3000/api/v1/procurement/stats \
  -H "Authorization: Bearer your-access-token"
```

## Troubleshooting

### 401 Unauthorized
- Check authentication token is valid
- Verify token hasn't expired
- Ensure Authorization header format: `Bearer {token}`

### 403 Forbidden
- Check user role matches required permission
- Verify tenant isolation is working
- Check user is assigned to correct role

### 404 Not Found
- Verify resource ID exists
- Check tenant ID matches
- Ensure collection was created in database

### 400 Bad Request
- Validate JSON payload format
- Check all required fields are provided
- Verify field types match schema
- Check enum values for status fields

### 409 Conflict
- Duplicate email when creating supplier
- Payment already recorded on order
- Check unique constraints in model

### Rate Limit (429)
- Too many requests in short time
- Back off and retry after delay
- Check rate limit headers in response

## Performance Optimization

### Indexes
- Verify all indexes are created (see Step 2)
- Monitor slow queries in MongoDB

### Caching
Consider caching supplier list:
```typescript
const cachedSuppliers = await cache.get(`suppliers:${tenantId}`);
if (!cachedSuppliers) {
  const suppliers = await supplierService.list(tenantId);
  await cache.set(`suppliers:${tenantId}`, suppliers, 3600); // 1 hour
}
```

### Pagination
Always use pagination on list endpoints:
```bash
curl -X GET 'http://localhost:3000/api/v1/procurement/suppliers?page=1&limit=50'
```

## Monitoring

Add monitoring for:
- API response times
- Error rates by endpoint
- Database query performance
- Payment recording failures
- Approval workflow delays

## Support & Documentation

- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Module README**: [README.md](./README.md)
- **Test Examples**: [procurement.routes.test.ts](./tests/procurement.routes.test.ts)
- **Error Handling**: [procurement.errors.ts](./errors/procurement.errors.ts)

## Completion Checklist

- [ ] Module files copied to correct paths
- [ ] Database collections created
- [ ] Indexes created
- [ ] Environment variables set
- [ ] Module imported in main app
- [ ] Tests passing locally
- [ ] Endpoints tested with curl/Postman
- [ ] RBAC tested with different roles
- [ ] Error scenarios tested
- [ ] Monitoring configured
- [ ] Documentation reviewed
- [ ] Ready for deployment

## Post-Integration

1. **Documentation**
   - Share API_DOCUMENTATION.md with frontend team
   - Update project wiki with procurement flows

2. **Training**
   - Train team on procurement workflows
   - Review RBAC permissions

3. **Monitoring**
   - Set up alerts for errors
   - Track key metrics

4. **Feedback**
   - Collect user feedback
   - Plan enhancements for next iteration

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-26  
**Status**: Complete & Ready for Integration
