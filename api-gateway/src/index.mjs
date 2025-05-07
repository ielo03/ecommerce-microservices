import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Service URLs
const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://localhost:8081";
const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "http://localhost:8082";
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:8083";

// JWT Secret - MUST match the secret used in the user service
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Custom token for morgan to log request body
morgan.token("req-body", (req) => {
  if (req.method === "POST" || req.method === "PUT") {
    // Mask sensitive data like passwords
    const body = { ...req.body };
    if (body.password) body.password = "********";
    return JSON.stringify(body);
  }
  return "";
});

// Custom token for morgan to log user ID if authenticated
morgan.token("user-id", (req) => {
  return req.user ? req.user.userId : "anonymous";
});

// Enhanced request logging
app.use(
  morgan(":method :url :status :response-time ms - :user-id - :req-body")
);

// Additional detailed request logging
app.use((req, res, next) => {
  const start = Date.now();

  console.log(
    `API GATEWAY REQUEST: ${req.method} ${req.originalUrl} [${req.ip}]`
  );

  // Save the original res.end to wrap it
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    const duration = Date.now() - start;
    console.log(
      `API GATEWAY RESPONSE: ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  };

  next();
});

// Middleware - IMPORTANT: These must be before route handlers
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "api-gateway" });
});

// Authentication middleware - simplified to allow all requests
const authenticate = (req, res, next) => {
  // Set a default user for all requests - no token validation
  req.user = {
    userId: "00000000-0000-0000-0000-000000000000",
    email: "user@example.com",
    role: "user",
    name: "Default User",
  };

  console.log(
    `User automatically authenticated: ${req.user.userId} [${req.originalUrl}]`
  );
  next();
};

// Proxy middleware options with logging and error handling
const createLoggingProxy = (targetUrl, serviceName) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      "^/api/products": "/api/products",
      "^/api/orders": "/api/orders",
      "^/api/users": "/api/users",
      "^/api/auth": "/api/auth",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(
        `PROXY REQUEST: ${req.method} ${req.originalUrl} -> ${serviceName}`
      );

      // If the body was already read (e.g., by body-parser), restream it
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(
        `PROXY RESPONSE: ${serviceName} -> ${proxyRes.statusCode} ${req.method} ${req.originalUrl}`
      );
    },
    onError: (err, req, res) => {
      console.error(
        `PROXY ERROR: ${serviceName} ${req.method} ${req.originalUrl}`,
        err.message
      );

      // Send an error response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: `Error connecting to ${serviceName}: ${err.message}`,
        });
      }
    },
    // Increase timeout to 30 seconds
    proxyTimeout: 30000,
    timeout: 30000,
  });
};

// Routes
// Product service routes
app.use(
  "/api/products",
  authenticate,
  createLoggingProxy(PRODUCT_SERVICE_URL, "product-service")
);

// Order service routes (protected)
app.use(
  "/api/orders",
  authenticate,
  createLoggingProxy(ORDER_SERVICE_URL, "order-service")
);

// User service routes
app.use(
  "/api/users",
  authenticate,
  createLoggingProxy(USER_SERVICE_URL, "user-service")
);

// Auth routes (public)
app.use("/api/auth", createLoggingProxy(USER_SERVICE_URL, "user-service"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(
    `API GATEWAY ERROR: ${req.method} ${req.originalUrl}`,
    err.stack
  );

  // Send an error response if headers haven't been sent yet
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Connected to services:`);
  console.log(`- Product Service: ${PRODUCT_SERVICE_URL}`);
  console.log(`- Order Service: ${ORDER_SERVICE_URL}`);
  console.log(`- User Service: ${USER_SERVICE_URL}`);
});

export default app;
