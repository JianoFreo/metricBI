import { Supplier } from "../models/Supplier.js";
import { PurchaseRequest } from "../models/PurchaseRequest.js";
import { PurchaseOrder } from "../models/PurchaseOrder.js";
import {
  ISupplier,
  IPurchaseRequest,
  IPurchaseOrder,
  PurchaseRequestStatus,
  PurchaseOrderStatus,
  PaymentStatus,
} from "../types/procurement.types.js";
import { ConflictError, NotFoundError } from "@common/utils/errors.js";

/**
 * Procurement Repository
 * Handles all database operations for suppliers, purchase requests, and orders
 */
export class ProcurementRepository {
  /**
   * ========== SUPPLIER OPERATIONS ==========
   */

  async createSupplier(data: Partial<ISupplier>): Promise<any> {
    const supplier = new Supplier(data);
    await supplier.save();
    return supplier.toObject();
  }

  async findSupplierById(id: string, companyId: string): Promise<any | null> {
    return Supplier.findOne({ _id: id, companyId }).lean();
  }

  async findSuppliers(
    companyId: string,
    filter: Record<string, any> = {},
    skip: number = 0,
    limit: number = 20
  ): Promise<{ suppliers: any[]; total: number }> {
    const query = { companyId, ...filter };
    const suppliers = await Supplier.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    const total = await Supplier.countDocuments(query);
    return { suppliers, total };
  }

  async updateSupplier(
    id: string,
    companyId: string,
    data: Partial<ISupplier>
  ): Promise<any | null> {
    return Supplier.findOneAndUpdate(
      { _id: id, companyId },
      { $set: data },
      { new: true }
    ).lean();
  }

  async deleteSupplier(id: string, companyId: string): Promise<void> {
    const result = await Supplier.findOneAndDelete({ _id: id, companyId });
    if (!result) {
      throw new NotFoundError("Supplier not found");
    }
  }

  /**
   * ========== PURCHASE REQUEST OPERATIONS ==========
   */

  async createPurchaseRequest(data: Partial<IPurchaseRequest>): Promise<any> {
    const purchaseRequest = new PurchaseRequest(data);
    await purchaseRequest.save();
    return purchaseRequest.toObject();
  }

  async findPurchaseRequestById(id: string, companyId: string): Promise<any | null> {
    return PurchaseRequest.findOne({ _id: id, companyId })
      .populate("supplierId", "name email phone")
      .lean();
  }

  async findPurchaseRequests(
    companyId: string,
    filter: Record<string, any> = {},
    skip: number = 0,
    limit: number = 20
  ): Promise<{ requests: any[]; total: number }> {
    const query = { companyId, ...filter };
    const requests = await PurchaseRequest.find(query)
      .populate("supplierId", "name email phone")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    const total = await PurchaseRequest.countDocuments(query);
    return { requests, total };
  }

  async updatePurchaseRequest(
    id: string,
    companyId: string,
    data: Partial<IPurchaseRequest>
  ): Promise<any | null> {
    return PurchaseRequest.findOneAndUpdate(
      { _id: id, companyId },
      { $set: data },
      { new: true }
    )
      .populate("supplierId", "name email phone")
      .lean();
  }

  async approvePurchaseRequest(
    id: string,
    companyId: string,
    approvedBy: string
  ): Promise<any | null> {
    return PurchaseRequest.findOneAndUpdate(
      { _id: id, companyId, status: PurchaseRequestStatus.PENDING },
      {
        $set: {
          status: PurchaseRequestStatus.APPROVED,
          approvedBy,
          approvalDate: new Date(),
        },
        $push: {
          history: {
            action: "approved",
            performedBy: approvedBy,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate("supplierId", "name email phone")
      .lean();
  }

  async rejectPurchaseRequest(
    id: string,
    companyId: string,
    rejectionReason: string,
    rejectedBy: string
  ): Promise<any | null> {
    return PurchaseRequest.findOneAndUpdate(
      { _id: id, companyId, status: PurchaseRequestStatus.PENDING },
      {
        $set: {
          status: PurchaseRequestStatus.REJECTED,
          rejectionReason,
        },
        $push: {
          history: {
            action: "rejected",
            performedBy: rejectedBy,
            timestamp: new Date(),
            note: rejectionReason,
          },
        },
      },
      { new: true }
    )
      .populate("supplierId", "name email phone")
      .lean();
  }

  /**
   * ========== PURCHASE ORDER OPERATIONS ==========
   */

  async createPurchaseOrder(data: Partial<IPurchaseOrder>): Promise<any> {
    const purchaseOrder = new PurchaseOrder(data);
    await purchaseOrder.save();
    return purchaseOrder.toObject();
  }

  async findPurchaseOrderById(id: string, companyId: string): Promise<any | null> {
    return PurchaseOrder.findOne({ _id: id, companyId })
      .populate("supplierId", "name email phone paymentTerms")
      .lean();
  }

  async findPurchaseOrders(
    companyId: string,
    filter: Record<string, any> = {},
    skip: number = 0,
    limit: number = 20
  ): Promise<{ orders: any[]; total: number }> {
    const query = { companyId, ...filter };
    const orders = await PurchaseOrder.find(query)
      .populate("supplierId", "name email phone")
      .skip(skip)
      .limit(limit)
      .sort({ orderDate: -1 })
      .lean();
    const total = await PurchaseOrder.countDocuments(query);
    return { orders, total };
  }

  async updatePurchaseOrder(
    id: string,
    companyId: string,
    data: Partial<IPurchaseOrder>
  ): Promise<any | null> {
    return PurchaseOrder.findOneAndUpdate(
      { _id: id, companyId },
      { $set: data },
      { new: true }
    )
      .populate("supplierId", "name email phone")
      .lean();
  }

  async updateOrderStatus(
    id: string,
    companyId: string,
    status: PurchaseOrderStatus,
    performedBy: string,
    note?: string
  ): Promise<any | null> {
    return PurchaseOrder.findOneAndUpdate(
      { _id: id, companyId },
      {
        $set: { status },
        $push: {
          history: {
            action: status,
            performedBy,
            newStatus: status,
            timestamp: new Date(),
            note,
          },
        },
      },
      { new: true }
    )
      .populate("supplierId", "name email phone")
      .lean();
  }

  async recordPayment(
    id: string,
    companyId: string,
    amountPaid: number,
    performedBy: string,
    metadata?: Record<string, any>
  ): Promise<any | null> {
    const order = await PurchaseOrder.findOne({ _id: id, companyId }).lean();
    if (!order) {
      throw new NotFoundError("Purchase order not found");
    }

    let newPaymentStatus: PaymentStatus;
    if (amountPaid >= order.totalOrderValue) {
      newPaymentStatus = PaymentStatus.PAID;
    } else if (amountPaid > 0) {
      newPaymentStatus = PaymentStatus.PARTIALLY_PAID;
    } else {
      newPaymentStatus = PaymentStatus.NOT_PAID;
    }

    return PurchaseOrder.findOneAndUpdate(
      { _id: id, companyId },
      {
        $set: { paymentStatus: newPaymentStatus },
        $push: {
          history: {
            action: "payment_recorded",
            performedBy,
            timestamp: new Date(),
            metadata: { amountPaid, ...metadata },
          },
        },
      },
      { new: true }
    )
      .populate("supplierId", "name email phone")
      .lean();
  }

  /**
   * ========== STATISTICS ==========
   */

  async getProcurementStats(companyId: string): Promise<any> {
    const totalSuppliersCount = await Supplier.countDocuments({ companyId });
    const activeSuppliersCount = await Supplier.countDocuments({
      companyId,
      isActive: true,
    });

    const totalPurchaseRequests = await PurchaseRequest.countDocuments({
      companyId,
    });
    const pendingRequests = await PurchaseRequest.countDocuments({
      companyId,
      status: PurchaseRequestStatus.PENDING,
    });
    const approvedRequests = await PurchaseRequest.countDocuments({
      companyId,
      status: PurchaseRequestStatus.APPROVED,
    });

    const orders = await PurchaseOrder.find({ companyId })
      .select("totalOrderValue")
      .lean();
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalOrderValue || 0), 0);
    const averageOrderValue =
      orders.length > 0 ? totalSpent / orders.length : 0;

    return {
      totalSuppliersCount,
      activeSuppliersCount,
      totalPurchaseRequests,
      pendingRequests,
      approvedRequests,
      totalPurchaseOrders: orders.length,
      totalSpent,
      averageOrderValue,
    };
  }

  /**
   * ========== GENERATION UTILITIES ==========
   */

  async getNextRequestNumber(companyId: string): Promise<string> {
    const count = await PurchaseRequest.countDocuments({ companyId });
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `PR-${year}${month}-${String(count + 1).padStart(5, "0")}`;
  }

  async getNextOrderNumber(companyId: string): Promise<string> {
    const count = await PurchaseOrder.countDocuments({ companyId });
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `PO-${year}${month}-${String(count + 1).padStart(5, "0")}`;
  }
}

export const procurementRepository = new ProcurementRepository();
