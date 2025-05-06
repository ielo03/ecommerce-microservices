import dotenv from "dotenv";

dotenv.config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || "development",
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || "ecommerce_products",
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "password",
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "json",
  },

  // API configuration
  api: {
    prefix: "/api",
    version: "v1",
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // Limit each IP to 100 requests per windowMs
    },
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  },

  // Service discovery
  services: {
    order: {
      url: process.env.ORDER_SERVICE_URL || "http://order-service:8080",
    },
    user: {
      url: process.env.USER_SERVICE_URL || "http://user-service:8080",
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 60, // seconds
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD, 10) || 120, // seconds
  },

  // Pagination defaults
  pagination: {
    limit: parseInt(process.env.PAGINATION_LIMIT, 10) || 20,
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT, 10) || 100,
  },

  // Feature flags
  features: {
    enableInventoryCheck: process.env.ENABLE_INVENTORY_CHECK === "true",
    enableRecommendations: process.env.ENABLE_RECOMMENDATIONS === "true",
    enableCaching: process.env.ENABLE_CACHING === "true",
  },
};

export default config;
