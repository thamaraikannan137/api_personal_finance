import express from "express";
import type { Request, Response, RequestHandler } from "express";
import cors from "cors";
import helmet, { type HelmetOptions } from "helmet";
import env from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import logger from "./config/logger.js";
import { requestLogger } from "./middlewares/logging.middleware.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Security middleware
type HelmetInitializer = (options?: Readonly<HelmetOptions>) => RequestHandler;
const helmetInitializer: HelmetInitializer =
  typeof helmet === "function"
    ? (helmet as HelmetInitializer)
    : ((helmet as { default: HelmetInitializer }).default as HelmetInitializer);

app.use(helmetInitializer());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(requestLogger);

// Rate limiting
// app.use("/api", apiRateLimiter);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(env.PORT, () => {
      logger.info(`🚀 Server is running on port ${env.PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`📡 API available at http://localhost:${env.PORT}/api`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

startServer();

export default app;