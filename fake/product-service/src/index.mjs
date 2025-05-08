import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { sequelize } from "./models/index.js";
import productRoutes from "./routes/productRoutes.js";
import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import config from "./config/index.js";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8081;

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Log when request is received
  logger.info(`REQUEST: ${req.method} ${req.originalUrl} [${req.ip}]`);

  // Log when response is sent
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `RESPONSE: ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "product-service",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/products", productRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Connect to the database
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully.");

    // Sync database models (in development only)
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      logger.info("Database models synchronized.");
    }

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Product service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  process.exit(0);
});

export default app; // Export for testing
