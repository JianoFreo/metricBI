/**
 * Procurement-specific error handler
 * Extends the common error handler for procurement domain
 */

export class ProcurementError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "ProcurementError";
  }
}

export class SupplierNotFoundError extends ProcurementError {
  constructor(supplierId: string) {
    super(
      "SUPPLIER_NOT_FOUND",
      404,
      `Supplier with ID ${supplierId} not found`,
      { supplierId }
    );
  }
}

export class SupplierAlreadyExistsError extends ProcurementError {
  constructor(email: string) {
    super(
      "SUPPLIER_ALREADY_EXISTS",
      409,
      `Supplier with email ${email} already exists`,
      { email }
    );
  }
}

export class PurchaseRequestNotFoundError extends ProcurementError {
  constructor(id: string) {
    super(
      "PURCHASE_REQUEST_NOT_FOUND",
      404,
      `Purchase request with ID ${id} not found`,
      { id }
    );
  }
}

export class InvalidPurchaseRequestStatusError extends ProcurementError {
  constructor(id: string, currentStatus: string) {
    super(
      "INVALID_PURCHASE_REQUEST_STATUS",
      400,
      `Cannot perform action on purchase request in ${currentStatus} status`,
      { id, currentStatus }
    );
  }
}

export class PurchaseOrderNotFoundError extends ProcurementError {
  constructor(id: string) {
    super(
      "PURCHASE_ORDER_NOT_FOUND",
      404,
      `Purchase order with ID ${id} not found`,
      { id }
    );
  }
}

export class InvalidPurchaseOrderStatusError extends ProcurementError {
  constructor(id: string, currentStatus: string) {
    super(
      "INVALID_PURCHASE_ORDER_STATUS",
      400,
      `Cannot perform action on purchase order in ${currentStatus} status`,
      { id, currentStatus }
    );
  }
}

export class InsufficientBudgetError extends ProcurementError {
  constructor(budgetLimit: number, requestedAmount: number) {
    super(
      "INSUFFICIENT_BUDGET",
      400,
      `Insufficient budget. Limit: ${budgetLimit}, Requested: ${requestedAmount}`,
      { budgetLimit, requestedAmount }
    );
  }
}

export class InvalidPaymentStateError extends ProcurementError {
  constructor(id: string, status: string) {
    super(
      "INVALID_PAYMENT_STATE",
      400,
      `Cannot record payment on purchase order in ${status} status`,
      { id, status }
    );
  }
}

export class DuplicatePaymentError extends ProcurementError {
  constructor(id: string) {
    super(
      "DUPLICATE_PAYMENT",
      409,
      `Payment already recorded for purchase order ${id}`,
      { id }
    );
  }
}
