# Procurement Module

A comprehensive procurement management system that handles suppliers, purchase requests, and purchase orders with role-based access control, approval workflows, and budget tracking.

## Features

### 🏢 Supplier Management
- Create, read, update, and delete suppliers
- Supplier ratings and order history
- Preferred supplier tracking
- Contact information and payment terms management

### 📋 Purchase Request Management
- Create and track purchase requests
- Multi-level approval workflows
- Budget validation
- Department tracking
- Request status transitions: `pending` → `approved`/`rejected` → `completed`

### 🛒 Purchase Order Management
- Generate purchase orders from approved requests
- Multiple line items per order
- Order status tracking
- Delivery tracking
- Order status workflow: `draft` → `confirmed` → `shipped` → `delivered`

### 💰 Payment Management
- Record payments against orders
- Multiple payment methods support
- Payment tracking and reconciliation
- Prevents duplicate payments

### 📊 Statistics & Analytics
- Supplier performance metrics
- Spending analytics
- Order status summaries
- Top suppliers tracking
- Budget utilization reports

## Architecture

```
procurement/
├── models/               # Database schemas
│   ├── supplier.model.ts
│   ├── purchase-request.model.ts
│   └── purchase-order.model.ts
├── schemas/              # Zod validation schemas
│   └── procurement.schemas.ts
├── services/             # Business logic layer
│   ├── supplier.service.ts
│   ├── purchase-request.service.ts
│   ├── purchase-order.service.ts
│   └── procurement-stats.service.ts
├── controllers/          # Route handlers
│   └── procurement.controller.ts
├── routes/               # API endpoints
│   └── procurement.routes.ts
├── errors/               # Custom error handling
│   └── procurement.errors.ts
├── tests/                # Unit & integration tests
│   └── procurement.routes.test.ts
├── index.ts              # Module export
├── API_DOCUMENTATION.md  # API reference
└── README.md             # This file
```

## Database Models

### Supplier
```typescript
{
  id: ObjectId,
  tenantId: string,
  name: string,
  email: string (unique),
  phone: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  paymentTerms: enum (NET-15, NET-30, NET-45, NET-60),
  contactPerson: string,
  isPreferred: boolean,
  rating: number (0-5),
  status: enum (active, inactive, suspended),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Purchase Request
```typescript
{
  id: ObjectId,
  tenantId: string,
  description: string,
  quantity: number,
  estimatedCost: number,
  department: string,
  preferredSupplier: ObjectId (ref: Supplier),
  budget: string,
  status: enum (pending, approved, rejected, completed),
  notes: string,
  createdBy: ObjectId (ref: User),
  approvals: {
    approvedBy: ObjectId,
    approvedAt: date,
    notes: string
  },
  rejections: {
    rejectedBy: ObjectId,
    rejectedAt: date,
    reason: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Purchase Order
```typescript
{
  id: ObjectId,
  tenantId: string,
  orderNumber: string (unique),
  referenceNumber: string,
  supplierId: ObjectId (ref: Supplier),
  items: [{
    description: string,
    quantity: number,
    unitPrice: number,
    totalPrice: number
  }],
  totalAmount: number,
  status: enum (draft, confirmed, shipped, delivered, cancelled),
  paymentStatus: enum (pending, partial, paid),
  deliveryDate: date,
  shippingAddress: string,
  notes: string,
  payment: {
    amount: number,
    method: enum (bank_transfer, check, credit_card, cash),
    referenceNumber: string,
    date: date
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## API Endpoints

### Suppliers
- `POST /api/v1/procurement/suppliers` - Create supplier
- `GET /api/v1/procurement/suppliers` - List suppliers
- `GET /api/v1/procurement/suppliers/:id` - Get supplier
- `PUT /api/v1/procurement/suppliers/:id` - Update supplier
- `DELETE /api/v1/procurement/suppliers/:id` - Delete supplier

### Purchase Requests
- `POST /api/v1/procurement/requests` - Create request
- `GET /api/v1/procurement/requests` - List requests
- `GET /api/v1/procurement/requests/:id` - Get request
- `POST /api/v1/procurement/requests/:id/approve` - Approve request
- `POST /api/v1/procurement/requests/:id/reject` - Reject request

### Purchase Orders
- `POST /api/v1/procurement/orders` - Create order
- `GET /api/v1/procurement/orders` - List orders
- `GET /api/v1/procurement/orders/:id` - Get order
- `PUT /api/v1/procurement/orders/:id` - Update order
- `POST /api/v1/procurement/orders/:id/confirm` - Confirm order
- `POST /api/v1/procurement/orders/:id/status` - Update status
- `POST /api/v1/procurement/orders/:id/payment` - Record payment

### Statistics
- `GET /api/v1/procurement/stats` - Get statistics

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API reference.

## Role-Based Access Control

| Operation | Viewer | Analyst | Manager | Admin |
|-----------|--------|---------|---------|-------|
| View suppliers | ✓ | ✓ | ✓ | ✓ |
| Create supplier | ✗ | ✗ | ✓ | ✓ |
| Update supplier | ✗ | ✗ | ✓ | ✓ |
| Delete supplier | ✗ | ✗ | ✗ | ✓ |
| View requests | ✓ | ✓ | ✓ | ✓ |
| Create request | ✗ | ✗ | ✓ | ✓ |
| Approve request | ✗ | ✗ | ✓ | ✓ |
| View orders | ✓ | ✓ | ✓ | ✓ |
| Create order | ✗ | ✗ | ✓ | ✓ |
| Update order | ✗ | ✗ | ✓ | ✓ |
| Record payment | ✗ | ✗ | ✓ | ✓ |

## Business Logic

### Purchase Request Workflow
1. **Create**: Manager creates request with description, quantity, and estimated cost
2. **Validation**: System checks budget and validates data
3. **Approval**: Manager/admin reviews and approves/rejects
4. **Completion**: Request moves to completed when PO is created

### Purchase Order Workflow
1. **Draft**: Manager creates order with items and supplier
2. **Confirmation**: Manager confirms order (sends to supplier)
3. **Shipment**: Supplier ships order (status: `shipped`)
4. **Delivery**: Order arrives (status: `delivered`)
5. **Payment**: Manager records payment

### Budget Tracking
- Each purchase request has estimated cost
- Budget allocation prevents overspending
- Monthly/quarterly budget tracking
- Automatic budget validation on approval

## Validation

All inputs are validated using Zod schemas:
- Required field validation
- Type checking
- Email format validation
- Enum validation for status fields
- Price/quantity validation (must be positive)
- File size validation for documents

## Error Handling

Comprehensive error handling with specific error codes:
- `SUPPLIER_NOT_FOUND` (404)
- `SUPPLIER_ALREADY_EXISTS` (409)
- `INVALID_PURCHASE_REQUEST_STATUS` (400)
- `INSUFFICIENT_BUDGET` (400)
- `DUPLICATE_PAYMENT` (409)

See [procurement.errors.ts](./errors/procurement.errors.ts) for all error types.

## Testing

Run tests with:
```bash
npm run test -- procurement
```

Tests cover:
- Supplier CRUD operations
- Purchase request workflows
- Purchase order creation and status updates
- Payment recording
- Error scenarios
- Role-based access control

## Usage Examples

### Create a Supplier
```bash
curl -X POST http://localhost:3000/api/v1/procurement/suppliers \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Supplies",
    "email": "supplies@tech.com",
    "phone": "+1-555-0123",
    "paymentTerms": "NET-30"
  }'
```

### Create a Purchase Request
```bash
curl -X POST http://localhost:3000/api/v1/procurement/requests \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Office supplies",
    "quantity": 100,
    "estimatedCost": 500,
    "department": "Operations"
  }'
```

### Create and Confirm a Purchase Order
```bash
# Create
curl -X POST http://localhost:3000/api/v1/procurement/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier-123",
    "items": [{
      "description": "Item 1",
      "quantity": 10,
      "unitPrice": 100,
      "totalPrice": 1000
    }],
    "totalAmount": 1000
  }'

# Confirm (returns order-123)
curl -X POST http://localhost:3000/api/v1/procurement/orders/order-123/confirm \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Order confirmed"
  }'
```

### Record Payment
```bash
curl -X POST http://localhost:3000/api/v1/procurement/orders/order-123/payment \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "method": "bank_transfer",
    "referenceNumber": "TXN-123456",
    "date": "2024-01-26T14:30:00Z"
  }'
```

## Dependencies

- `express` - Web framework
- `zod` - Schema validation
- `mongoose` - MongoDB ODM (if using MongoDB)
- `jsonwebtoken` - Authentication

## Integration

To integrate with your main application:

```typescript
// app.ts
import { registerProcurementModule } from "@features/procurement/index.js";

const app = express();

// ... other middleware ...

registerProcurementModule(app);

app.listen(3000);
```

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/metricbi

# Optional: Procurement settings
PROCUREMENT_BUDGET_CHECK_ENABLED=true
PROCUREMENT_MAX_ORDER_AMOUNT=100000
PROCUREMENT_AUTO_COMPLETE_DELIVERY=false
```

## Performance Considerations

1. **Indexing**: Collection on `tenantId`, `status`, `supplierId` for faster queries
2. **Pagination**: Default limit 20, max 100 per request
3. **Caching**: Consider caching supplier list for performance
4. **Bulk Operations**: Use batch operations for large imports

## Future Enhancements

- [ ] Supplier rating and review system
- [ ] Quantity discounts handling
- [ ] Recurring purchase orders
- [ ] Invoice management integration
- [ ] Inventory tracking
- [ ] Automated workflows (webhooks)
- [ ] Email notifications
- [ ] PDF export for orders
- [ ] Multi-currency support
- [ ] Advanced reporting and analytics

## Contributing

1. Create feature branch (`git checkout -b feature/procurement-xyz`)
2. Write tests for new functionality
3. Follow existing code style
4. Update API documentation
5. Submit pull request

## License

MIT

## Support

For questions or issues:
- Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Tests: [tests/](./tests/)
- Issues: GitHub Issues
- Contact: procurement-api@example.com
