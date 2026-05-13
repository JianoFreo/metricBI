import "dotenv/config";
import env from "@config/env.js";
import logger from "@config/logger.js";
import { connectDatabase, disconnectDatabase } from "@config/database.js";
import app from "./app.js";

const PORT = env.PORT;

const startServer = async (): Promise<void> => {
  try {
    logger.info(`Starting MetricBI Backend in ${env.NODE_ENV} mode...`);

    // Connect to MongoDB
    await connectDatabase();

    // Start Express Server
    const server = app.listen(PORT, () => {
      logger.info(`✓ Server running on http://localhost:${PORT}`);
      logger.info(`✓ Environment: ${env.NODE_ENV}`);
    });

    /**
     * Graceful Shutdown
     */
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, shutting down gracefully...");
      server.close(async () => {
        await disconnectDatabase();
        logger.info("✓ Server shut down successfully");
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, shutting down gracefully...");
      server.close(async () => {
        await disconnectDatabase();
        logger.info("✓ Server shut down successfully");
        process.exit(0);
      });
    });

    /**
     * Unhandled Rejection Handler
     */
    process.on("unhandledRejection", (reason: any) => {
      logger.error("Unhandled Rejection:", reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
