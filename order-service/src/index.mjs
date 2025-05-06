import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { sequelize } from "./models/index.js";
import orderRoutes from "./routes/orderRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8082;

// Custom token for morgan to log request body
morgan.token("req-body", (req) => {
  if (req.method === "POST" || req.method === "PUT") {
    // Mask sensitive data
    const body = { ...req.body };
    return JSON.stringify(body);
  }
  return "";
});

// Enhanced request logging
app.use(
  morgan(
    ":method :url :status :response-time ms - :res[content-length] - :req-body"
  )
);

// Additional detailed request logging
app.use((req, res, next) => {
  const start = Date.now();

  console.log(`REQUEST: ${req.method} ${req.originalUrl} [${req.ip}]`);

  // Save the original res.end to wrap it
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    const duration = Date.now() - start;
    console.log(
      `RESPONSE: ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  };

  next();
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "order-service" });
});

// API routes
app.use("/api/orders", orderRoutes);

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
      logger.info(`Order service running on port ${PORT}`);
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
