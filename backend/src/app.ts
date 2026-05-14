import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import env from "@config/env";
import { errorHandler } from "@common/middleware/error.middleware";
import { apiLimiter } from "@common/middleware/rateLimiter.middleware";
import { sendError } from "@common/utils/response";

import logger from "@config/logger";
import authRoutes from "@features/auth/routes/auth.routes";
import companyRoutes from "@features/tenant/routes/company.routes";
import assetRoutes from "@features/assets/routes/asset.routes";
import inventoryRoutes from "@features/inventory/routes/inventory.routes";
// Analytics and Dashboard temporarily disabled
// import analyticsRoutes from "@features/analytics/routes/analytics.routes";
// import dashboardRoutes from "@features/dashboard/routes/dashboard.routes";

const app: Application = express();

/**
 * Security Middleware
 */
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);

/**
 * Request Parsing
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/**
 * Rate Limiting
 */
app.use("/api/", apiLimiter);

/**
 * Request Logging
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

/**
 * Health Check
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Routes
 */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/assets", assetRoutes);
app.use("/api/v1/inventory", inventoryRoutes);

/**
 * API Documentation
 */
app.get("/api/v1", (req: Request, res: Response) => {
  res.json({
    message: "MetricBI API v1",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      companies: "/api/v1/companies",
      assets: "/api/v1/assets",
      inventory: "/api/v1/inventory",
    },
  });
});

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
  sendError(res, 404, "Route not found", "NOT_FOUND");
});

/**
 * Error Handler (must be last)
 */
app.use(errorHandler);

export default app;
