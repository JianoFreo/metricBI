import {
  ConflictError,
  NotFoundError,
  AuthorizationError,
} from "@common/utils/errors.js";
import { procurementRepository } from "../repositories/procurement.repository.js";
import {
  CreateSupplierInput,
  UpdateSupplierInput,
  CreatePurchaseRequestInput,
  CreatePurchaseOrderInput,
  RecordPaymentInput,
} from "../schemas/procurement.schemas.js";
import {
  IPurchaseRequest,
  IPurchaseOrder,
  PurchaseRequestStatus,
  PurchaseOrderStatus,
} from "../types/procurement.types.js";
import logger from "@config/logger.js";

/**
 * Procurement Service
 * Contains business logic for procurement operations
 */
export class ProcurementService {
  /**
   * ========== SUPPLIER OPERATIONS ==========
   */

  async createSupplier(
    companyId: string,
    data: CreateSupplierInput
  ): Promise<any> {
    const supplier = await procurementRepository.createSupplier({
      companyId,
      ...data,
    });
    logger.info(`Supplier created: ${supplier._id} in company ${companyId}`);
    return supplier;
  }

  async getSupplier(id: string, companyId: string): Promise<any> {
    const supplier = await procurementRepository.findSupplierById(id, companyId);
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }
    return supplier;
  }

  async listSuppliers(
    companyId: string,
    query: any = {}
  ): Promise<{ suppliers: any[]; total: number; page: number }> {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const skip = (page - 1) * limit;

    const filter: any = { companyId };
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, "i") },
        { email: new RegExp(query.search, "i") },
      ];
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === "true";
    }

    const { suppliers, total } = await procurementRepository.findSuppliers(
      companyId,
      filter,
      skip,
      limit
    );

    // Apply sorting
    let sorted = suppliers;
    if (query.sortBy && ["name", "rating", "totalSpent", "createdAt"].includes(query.sortBy)) {
      sorted = suppliers.sort((a, b) => {
        const aVal = a[query.sortBy];
        const bVal = b[query.sortBy];
        const order = query.sortOrder === "desc" ? -1 : 1;
        return aVal > bVal ? order : -order;
      });
    }

    return { suppliers: sorted, total, page };
  }

  async updateSupplier(
    id: string,
    companyId: string,
    data: UpdateSupplierInput
  ): Promise<any> {
    const supplier = await procurementRepository.updateSupplier(id, companyId, data);
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }
    logger.info(`Supplier updated: ${id}`);
    return supplier;
  }

  async deleteSupplier(id: string, companyId: string): Promise<void> {
    await procurementRepository.deleteSupplier(id, companyId);
    logger.info(`Supplier deleted: ${id}`);
  }

  /**
   * ========== PURCHASE REQUEST OPERATIONS ==========
   */

  async createPurchaseRequest(
    companyId: string,
    userId: string,
    data: CreatePurchaseRequestInput
  ): Promise<any> {
    // Verify supplier exists
    const supplier = await procurementRepository.findSupplierById(
      data.supplierId,
      companyId
    );
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }

    // Calculate total
    const totalEstimatedCost = data.items.reduce(
      (sum, item) => sum + item.estimatedUnitCost * item.quantity,
      0
    );

    const requestNumber = await procurementRepository.getNextRequestNumber(companyId);

    const purchaseRequest = await procurementRepository.createPurchaseRequest({
      companyId,
      requestNumber,
      supplierId: data.supplierId,
      requestedBy: userId,
      description: data.description,
      items: data.items,
      totalEstimatedCost,
      dueDate: new Date(data.dueDate),
      notes: data.notes,
      attachments: data.attachments,
      history: [
        {
          action: "created",
          performedBy: userId,
          timestamp: new Date(),
        },
      ],
    });

    logger.info(
      `Purchase request created: ${purchaseRequest.requestNumber} (${purchaseRequest._id}) in company ${companyId}`
    );
    return purchaseRequest;
  }

  async getPurchaseRequest(id: string, companyId: string): Promise<any> {
    const request = await procurementRepository.findPurchaseRequestById(id, companyId);
    if (!request) {
      throw new NotFoundError("Purchase request not found");
    }
    return request;
  }

  async listPurchaseRequests(
    companyId: string,
    query: any = {}
  ): Promise<{ requests: any[]; total: number; page: number }> {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.supplierId) {
      filter.supplierId = query.supplierId;
    }
    if (query.requestedBy) {
      filter.requestedBy = query.requestedBy;
    }

    const { requests, total } = await procurementRepository.findPurchaseRequests(
      companyId,
      filter,
      skip,
      limit
    );

    return { requests, total, page };
  }

  async approvePurchaseRequest(
    id: string,
    companyId: string,
    approvedBy: string,
    note?: string
  ): Promise<any> {
    const request = await procurementRepository.findPurchaseRequestById(id, companyId);
    if (!request) {
      throw new NotFoundError("Purchase request not found");
    }

    if (request.status !== PurchaseRequestStatus.PENDING) {
      throw new ConflictError(`Purchase request is ${request.status}, cannot approve`);
    }

    const updated = await procurementRepository.approvePurchaseRequest(
      id,
      companyId,
      approvedBy
    );

    logger.info(
      `Purchase request approved: ${request.requestNumber} by ${approvedBy}`
    );
    return updated;
  }

  async rejectPurchaseRequest(
    id: string,
    companyId: string,
    rejectionReason: string,
    rejectedBy: string
  ): Promise<any> {
    const request = await procurementRepository.findPurchaseRequestById(id, companyId);
    if (!request) {
      throw new NotFoundError("Purchase request not found");
    }

    if (request.status !== PurchaseRequestStatus.PENDING) {
      throw new ConflictError(`Purchase request is ${request.status}, cannot reject`);
    }

    const updated = await procurementRepository.rejectPurchaseRequest(
      id,
      companyId,
      rejectionReason,
      rejectedBy
    );

    logger.info(`Purchase request rejected: ${request.requestNumber}`);
    return updated;
  }

  /**
   * ========== PURCHASE ORDER OPERATIONS ==========
   */

  async createPurchaseOrder(
    companyId: string,
    userId: string,
    data: CreatePurchaseOrderInput
  ): Promise<any> {
    // Verify supplier
    const supplier = await procurementRepository.findSupplierById(
      data.supplierId,
      companyId
    );
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }

    // Verify purchase request if provided
    if (data.purchaseRequestId) {
      const request = await procurementRepository.findPurchaseRequestById(
        data.purchaseRequestId,
        companyId
      );
      if (!request) {
        throw new NotFoundError("Purchase request not found");
      }
    }

    // Calculate totals
    const items = data.items.map((item) => ({
      ...item,
      totalCost: item.quantity * item.unitCost,
    }));
    const totalOrderValue = items.reduce((sum, item) => sum + item.totalCost, 0);

    const orderNumber = await procurementRepository.getNextOrderNumber(companyId);

    const purchaseOrder = await procurementRepository.createPurchaseOrder({
      companyId,
      orderNumber,
      purchaseRequestId: data.purchaseRequestId,
      supplierId: data.supplierId,
      createdBy: userId,
      items,
      totalOrderValue,
      orderDate: new Date(),
      expectedDeliveryDate: new Date(data.expectedDeliveryDate),
      deliveryAddress: data.deliveryAddress,
      paymentTerms: data.paymentTerms || "Net 30",
      deliveryTerms: data.deliveryTerms,
      notes: data.notes,
      attachments: data.attachments,
      history: [
        {
          action: "created",
          performedBy: userId,
          timestamp: new Date(),
        },
      ],
    });

    // Update supplier stats
    await procurementRepository.updateSupplier(data.supplierId, companyId, {
      totalOrdersCount: supplier.totalOrdersCount + 1,
      totalSpent: supplier.totalSpent + totalOrderValue,
    } as any);

    logger.info(
      `Purchase order created: ${purchaseOrder.orderNumber} (${purchaseOrder._id})`
    );
    return purchaseOrder;
  }

  async getPurchaseOrder(id: string, companyId: string): Promise<any> {
    const order = await procurementRepository.findPurchaseOrderById(id, companyId);
    if (!order) {
      throw new NotFoundError("Purchase order not found");
    }
    return order;
  }

  async listPurchaseOrders(
    companyId: string,
    query: any = {}
  ): Promise<{ orders: any[]; total: number; page: number }> {
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }
    if (query.supplierId) {
      filter.supplierId = query.supplierId;
    }

    const { orders, total } = await procurementRepository.findPurchaseOrders(
      companyId,
      filter,
      skip,
      limit
    );

    return { orders, total, page };
  }

  async updatePurchaseOrder(
    id: string,
    companyId: string,
    data: any,
    userId: string
  ): Promise<any> {
    const order = await procurementRepository.findPurchaseOrderById(id, companyId);
    if (!order) {
      throw new NotFoundError("Purchase order not found");
    }

    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new ConflictError(
        "Can only edit purchase orders in draft status"
      );
    }

    if (data.items) {
      const totalOrderValue = data.items.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitCost,
        0
      );
      data.totalOrderValue = totalOrderValue;
      data.items = data.items.map((item: any) => ({
        ...item,
        totalCost: item.quantity * item.unitCost,
      }));
    }

    const updated = await procurementRepository.updatePurchaseOrder(id, companyId, data);
    logger.info(`Purchase order updated: ${order.orderNumber}`);
    return updated;
  }

  async confirmPurchaseOrder(
    id: string,
    companyId: string,
    userId: string,
    note?: string
  ): Promise<any> {
    const order = await procurementRepository.findPurchaseOrderById(id, companyId);
    if (!order) {
      throw new NotFoundError("Purchase order not found");
    }

    if (order.status !== PurchaseOrderStatus.DRAFT && order.status !== PurchaseOrderStatus.PENDING) {
      throw new ConflictError(
        `Cannot confirm order with status ${order.status}`
      );
    }

    const updated = await procurementRepository.updateOrderStatus(
      id,
      companyId,
      PurchaseOrderStatus.CONFIRMED,
      userId,
      note
    );

    logger.info(`Purchase order confirmed: ${order.orderNumber}`);
    return updated;
  }

  async updateOrderStatus(
    id: string,
    companyId: string,
    status: PurchaseOrderStatus,
    userId: string,
    note?: string
  ): Promise<any> {
    const order = await procurementRepository.findPurchaseOrderById(id, companyId);
    if (!order) {
      throw new NotFoundError("Purchase order not found");
    }

    const updated = await procurementRepository.updateOrderStatus(
      id,
      companyId,
      status,
      userId,
      note
    );

    logger.info(`Purchase order status updated: ${order.orderNumber} → ${status}`);
    return updated;
  }

  async recordPayment(
    id: string,
    companyId: string,
    data: RecordPaymentInput,
    userId: string
  ): Promise<any> {
    const order = await procurementRepository.findPurchaseOrderById(id, companyId);
    if (!order) {
      throw new NotFoundError("Purchase order not found");
    }

    const updated = await procurementRepository.recordPayment(
      id,
      companyId,
      data.amountPaid,
      userId,
      {
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        notes: data.notes,
      }
    );

    logger.info(
      `Payment recorded for order ${order.orderNumber}: ${data.amountPaid}`
    );
    return updated;
  }

  /**
   * ========== STATISTICS ==========
   */

  async getProcurementStats(companyId: string): Promise<any> {
    return procurementRepository.getProcurementStats(companyId);
  }
}

export const procurementService = new ProcurementService();
