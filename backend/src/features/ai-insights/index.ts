/**
 * AI Insights Module - Integration
 * Registers the AI insights module with the main application
 */

import { Router } from "express";
import insightsRoutes from "./routes/insights.routes.js";

export const registerAIInsightsModule = (mainRouter: Router): void => {
  // Register all insights routes under /insights namespace
  mainRouter.use("/insights", insightsRoutes);

  console.log("[AI Insights] Module registered successfully");
};

export default registerAIInsightsModule;
