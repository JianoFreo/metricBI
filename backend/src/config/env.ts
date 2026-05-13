import { z } from "zod";
import logger from "./logger.js";

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000").transform(Number),
  
  // Database
  MONGODB_URI: z.string().url(),
  MONGODB_DB_NAME: z.string().default("metricbi"),
  
  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // External APIs
  OPENAI_API_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  
  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  
  // CORS
  CORS_ORIGIN: z.string().default("*"),
});

type EnvType = z.infer<typeof envSchema>;

let env: EnvType;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error("Environment validation failed:", error.errors);
    process.exit(1);
  }
  throw error;
}

export default env;
