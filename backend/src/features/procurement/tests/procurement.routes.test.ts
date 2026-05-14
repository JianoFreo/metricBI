import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "vitest";
import request from "supertest";
import app from "../../../app.js";
import db from "../../../config/db.js";
import { Supplier } from "../models/supplier.model.js";
import { PurchaseRequest } from "../models/purchase-request.model.js";
import { PurchaseOrder } from "../models/purchase-order.model.js";

// Mock database
vi.mock("../../../config/db.js");

describe("Procurement Module - Supplier Routes", () => {
  const mockTenantId = "tenant-123";
  const mockUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/v1/procurement/suppliers", () => {
    it("should create a new supplier", async () => {
      const supplierData = {
        name: "Acme Corp",
        email: "supplies@acmecorp.com",
        phone: "+1-555-0123",
        address: "123 Business St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        paymentTerms: "NET-30",
      };

      vi.spyOn(Supplier, "create").mockResolvedValue({
        id: "supplier-123",
        ...supplierData,
        tenantId: mockTenantId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/procurement/suppliers")
        .set("Authorization", "Bearer valid-token")
        .send(supplierData);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe("Acme Corp");
      expect(Supplier.create).toHaveBeenCalled();
    });

    it("should reject duplicate supplier email", async () => {
      const supplierData = {
        name: "Acme Corp",
        email: "duplicate@acmecorp.com",
        phone: "+1-555-0123",
        address: "123 Business St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        paymentTerms: "NET-30",
      };

      vi.spyOn(Supplier, "create").mockRejectedValue({
        message: "Supplier with email already exists",
      });

      const response = await request(app)
        .post("/api/v1/procurement/suppliers")
        .set("Authorization", "Bearer valid-token")
        .send(supplierData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject invalid supplier data", async () => {
      const invalidData = {
        name: "", // Empty name
        email: "invalid-email",
      };

      const response = await request(app)
        .post("/api/v1/procurement/suppliers")
        .set("Authorization", "Bearer valid-token")
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/procurement/suppliers", () => {
    it("should list suppliers", async () => {
      const mockSuppliers = [
        {
          id: "supplier-1",
          name: "Supplier 1",
          email: "supplier1@test.com",
          status: "active",
        },
        {
          id: "supplier-2",
          name: "Supplier 2",
          email: "supplier2@test.com",
          status: "active",
        },
      ];

      vi.spyOn(Supplier, "find").mockResolvedValue(mockSuppliers as any);

      const response = await request(app)
        .get("/api/v1/procurement/suppliers")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/v1/procurement/suppliers?page=1&limit=10")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
    });

    it("should support filtering by status", async () => {
      const response = await request(app)
        .get("/api/v1/procurement/suppliers?status=active")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/v1/procurement/suppliers/:id", () => {
    it("should retrieve supplier details", async () => {
      const mockSupplier = {
        id: "supplier-123",
        name: "Acme Corp",
        email: "supplies@acmecorp.com",
        status: "active",
      };

      vi.spyOn(Supplier, "findById").mockResolvedValue(mockSupplier as any);

      const response = await request(app)
        .get("/api/v1/procurement/suppliers/supplier-123")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe("supplier-123");
    });

    it("should return 404 for non-existent supplier", async () => {
      vi.spyOn(Supplier, "findById").mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/procurement/suppliers/non-existent")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/v1/procurement/suppliers/:id", () => {
    it("should update supplier", async () => {
      const updateData = { name: "Updated Name" };

      vi.spyOn(Supplier, "findByIdAndUpdate").mockResolvedValue({
        id: "supplier-123",
        ...updateData,
        status: "active",
      } as any);

      const response = await request(app)
        .put("/api/v1/procurement/suppliers/supplier-123")
        .set("Authorization", "Bearer valid-token")
        .send(updateData);

      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/v1/procurement/suppliers/:id", () => {
    it("should delete supplier (admin only)", async () => {
      vi.spyOn(Supplier, "findByIdAndDelete").mockResolvedValue({
        id: "supplier-123",
      } as any);

      const response = await request(app)
        .delete("/api/v1/procurement/suppliers/supplier-123")
        .set("Authorization", "Bearer admin-token");

      expect(response.status).toBe(200);
    });
  });
});

describe("Procurement Module - Purchase Request Routes", () => {
  describe("POST /api/v1/procurement/requests", () => {
    it("should create purchase request", async () => {
      const requestData = {
        description: "Office Supplies",
        quantity: 50,
        estimatedCost: 1000,
        department: "Operations",
        preferredSupplier: "supplier-123",
      };

      vi.spyOn(PurchaseRequest, "create").mockResolvedValue({
        id: "req-123",
        ...requestData,
        status: "pending",
        createdAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/procurement/requests")
        .set("Authorization", "Bearer valid-token")
        .send(requestData);

      expect(response.status).toBe(201);
    });
  });

  describe("POST /api/v1/procurement/requests/:id/approve", () => {
    it("should approve purchase request", async () => {
      vi.spyOn(PurchaseRequest, "findByIdAndUpdate").mockResolvedValue({
        id: "req-123",
        status: "approved",
      } as any);

      const response = await request(app)
        .post("/api/v1/procurement/requests/req-123/approve")
        .set("Authorization", "Bearer valid-token")
        .send({ notes: "Approved" });

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/v1/procurement/requests/:id/reject", () => {
    it("should reject purchase request", async () => {
      vi.spyOn(PurchaseRequest, "findByIdAndUpdate").mockResolvedValue({
        id: "req-123",
        status: "rejected",
      } as any);

      const response = await request(app)
        .post("/api/v1/procurement/requests/req-123/reject")
        .set("Authorization", "Bearer valid-token")
        .send({ reason: "Budget exceeded" });

      expect(response.status).toBe(200);
    });
  });
});

describe("Procurement Module - Purchase Order Routes", () => {
  describe("POST /api/v1/procurement/orders", () => {
    it("should create purchase order", async () => {
      const orderData = {
        supplierId: "supplier-123",
        items: [
          {
            description: "Item 1",
            quantity: 10,
            unitPrice: 100,
            totalPrice: 1000,
          },
        ],
        totalAmount: 1000,
      };

      vi.spyOn(PurchaseOrder, "create").mockResolvedValue({
        id: "order-123",
        ...orderData,
        status: "draft",
        createdAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/procurement/orders")
        .set("Authorization", "Bearer valid-token")
        .send(orderData);

      expect(response.status).toBe(201);
    });
  });

  describe("POST /api/v1/procurement/orders/:id/confirm", () => {
    it("should confirm purchase order", async () => {
      vi.spyOn(PurchaseOrder, "findByIdAndUpdate").mockResolvedValue({
        id: "order-123",
        status: "confirmed",
      } as any);

      const response = await request(app)
        .post("/api/v1/procurement/orders/order-123/confirm")
        .set("Authorization", "Bearer valid-token")
        .send({ confirmedAt: new Date() });

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/v1/procurement/orders/:id/status", () => {
    it("should update order status", async () => {
      vi.spyOn(PurchaseOrder, "findByIdAndUpdate").mockResolvedValue({
        id: "order-123",
        status: "delivered",
      } as any);

      const response = await request(app)
        .post("/api/v1/procurement/orders/order-123/status")
        .set("Authorization", "Bearer valid-token")
        .send({ status: "delivered" });

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/v1/procurement/orders/:id/payment", () => {
    it("should record payment", async () => {
      vi.spyOn(PurchaseOrder, "findByIdAndUpdate").mockResolvedValue({
        id: "order-123",
        paymentStatus: "paid",
      } as any);

      const response = await request(app)
        .post("/api/v1/procurement/orders/order-123/payment")
        .set("Authorization", "Bearer valid-token")
        .send({
          amount: 1000,
          method: "bank_transfer",
          referenceNumber: "TXN-123456",
        });

      expect(response.status).toBe(200);
    });

    it("should prevent duplicate payments", async () => {
      vi.spyOn(PurchaseOrder, "findById").mockResolvedValue({
        id: "order-123",
        paymentStatus: "paid",
      } as any);

      const response = await request(app)
        .post("/api/v1/procurement/orders/order-123/payment")
        .set("Authorization", "Bearer valid-token")
        .send({
          amount: 1000,
          method: "bank_transfer",
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});

describe("Procurement Module - Statistics Route", () => {
  describe("GET /api/v1/procurement/stats", () => {
    it("should return procurement statistics", async () => {
      const mockStats = {
        totalSuppliers: 25,
        activeOrders: 10,
        pendingRequests: 5,
        totalSpent: 50000,
      };

      const response = await request(app)
        .get("/api/v1/procurement/stats")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("totalSuppliers");
    });
  });
});
