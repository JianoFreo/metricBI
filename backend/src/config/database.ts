import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
    });
    logger.info("✓ MongoDB connected successfully");
  } catch (error) {
    logger.error("✗ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("✓ MongoDB disconnected");
  } catch (error) {
    logger.error("✗ MongoDB disconnection failed:", error);
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  logger.info("✓ Mongoose connected to database");
});

mongoose.connection.on("error", (err) => {
  logger.error("✗ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("⚠ Mongoose disconnected from database");
});
