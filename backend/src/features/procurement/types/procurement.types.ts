/**
 * Procurement Module - Type Definitions
 */

export enum PurchaseRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum PurchaseOrderStatus {
  DRAFT = "draft",
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  NOT_PAID = "not_paid",
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
}

export interface ISupplier {
  _id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
  bankAccountDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    swiftCode?: string;
  };
  paymentTerms?: string; // e.g., "Net 30", "2/10 Net 30"
  isActive: boolean;
  rating?: number; // 1-5 stars
  totalOrdersCount: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseRequestItem {
  itemId: string;
  description: string;
  quantity: number;
  estimatedUnitCost: number;
  notes?: string;
}

export interface IPurchaseRequestHistory {
  action: "created" | "updated" | "approved" | "rejected";
  performedBy: string; // User ID
  timestamp: Date;
  note?: string;
  metadata?: Record<string, any>;
}

export interface IPurchaseRequest {
  _id: string;
  companyId: string;
  requestNumber: string; // Unique per company
  supplierId: string; // Reference to Supplier
  requestedBy: string; // User ID
  description: string;
  items: IPurchaseRequestItem[];
  totalEstimatedCost: number;
  status: PurchaseRequestStatus;
  approvedBy?: string; // User ID if approved
  rejectionReason?: string;
  approvalDate?: Date;
  dueDate: Date;
  notes?: string;
  attachments?: string[]; // URLs or file paths
  history: IPurchaseRequestHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseOrderItem {
  itemId: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface IPurchaseOrderHistory {
  action:
    | "created"
    | "updated"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "payment_recorded";
  performedBy: string; // User ID
  previousStatus?: PurchaseOrderStatus;
  newStatus?: PurchaseOrderStatus;
  timestamp: Date;
  note?: string;
  metadata?: Record<string, any>;
}

export interface IPurchaseOrder {
  _id: string;
  companyId: string;
  orderNumber: string; // Unique per company
  purchaseRequestId?: string; // Reference to PurchaseRequest
  supplierId: string; // Reference to Supplier
  createdBy: string; // User ID
  items: IPurchaseOrderItem[];
  totalOrderValue: number;
  orderDate: Date;
  expectedDeliveryDate: Date;
  deliveryAddress: string;
  status: PurchaseOrderStatus;
  paymentStatus: PaymentStatus;
  paymentTerms: string; // e.g., "Net 30"
  deliveryTerms?: string; // e.g., "FOB Shipping Point"
  notes?: string;
  attachments?: string[];
  history: IPurchaseOrderHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProcurementStats {
  totalSuppliersCount: number;
  activeSuppliersCount: number;
  totalPurchaseRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  totalPurchaseOrders: number;
  totalSpent: number;
  averageOrderValue: number;
}
