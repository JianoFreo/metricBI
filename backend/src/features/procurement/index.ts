/**
 * Procurement module integration
 * Registers the procurement feature with the main application
 */

import { Router } from "express";
import procurementRoutes from "./routes/procurement.routes.js";

export const registerProcurementModule = (mainRouter: Router): void => {
  // Register all procurement routes under /procurement namespace
  mainRouter.use("/procurement", procurementRoutes);

  console.log("[Procurement] Module registered successfully");
};

export default registerProcurementModule;
