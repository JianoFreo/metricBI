import "dotenv/config";
import env from "@config/env";
import logger from "@config/logger";
import { connectDatabase, disconnectDatabase } from "@config/database";
import { connectRedis, disconnectRedis } from "@config/redis";
import app from "./app";

const PORT = env.PORT;

const startServer = async (): Promise<void> => {
  try {
    logger.info(`Starting MetricBI Backend in ${env.NODE_ENV} mode...`);

    // Connect to MongoDB
    await connectDatabase();

    // Connect to Redis (optional)
    await connectRedis();

    // Start Express Server
    const server = app.listen(PORT, () => {
      logger.info(`✓ Server running on http://localhost:${PORT}`);
      logger.info(`✓ Environment: ${env.NODE_ENV}`);
    });

    /**
     * Graceful Shutdown
     */
    const shutdown = async () => {
      logger.info("Shutting down gracefully...");
      server.close(async () => {
        await disconnectDatabase();
        await disconnectRedis();
        logger.info("✓ Server shut down successfully");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    /**
     * Unhandled Rejection Handler
     */
    process.on("unhandledRejection", (reason: any) => {
      logger.error("✗ Unhandled Rejection:", reason);
      process.exit(1);
    });

    /**
     * Uncaught Exception Handler
     */
    process.on("uncaughtException", (error) => {
      logger.error("✗ Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    logger.error("✗ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
