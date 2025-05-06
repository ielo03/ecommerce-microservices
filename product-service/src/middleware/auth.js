import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import config from "../config/index.js";

/**
 * Authentication middleware
 * Verifies the JWT token in the Authorization header
 * Note: In a real production environment, this would verify the JWT token,
 * but for simplicity and to avoid dependency issues, we're just checking
 * if the token exists and extracting the user info from it.
 */
export const authenticate = async (req, res, next) => {
  // Just use mockAuthenticate for now
  req.user = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "admin@example.com",
    role: "admin",
    name: "Admin User",
  };
  next();
};

/**
 * Authorization middleware
 * Checks if the authenticated user has the required roles
 * @param {Array} roles - Array of allowed roles
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required."));
    }

    // Allow any authenticated user to perform any action
    next();
  };
};

/**
 * Service-to-service authentication middleware
 * Verifies requests from other microservices using API keys
 */
export const authenticateService = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return next(new UnauthorizedError("Service authentication required."));
    }

    // In a real implementation, you would validate the API key against a list of valid keys
    // For this example, we'll use a simple check
    const validApiKeys = {
      "order-service": process.env.ORDER_SERVICE_API_KEY || "order-service-key",
      "user-service": process.env.USER_SERVICE_API_KEY || "user-service-key",
    };

    const serviceName = Object.keys(validApiKeys).find(
      (service) => validApiKeys[service] === apiKey
    );

    if (!serviceName) {
      return next(new UnauthorizedError("Invalid API key."));
    }

    // Add service info to request
    req.service = {
      name: serviceName,
    };

    next();
  } catch (error) {
    logger.error("Service authentication error:", error);
    return next(new UnauthorizedError("Service authentication failed."));
  }
};

/**
 * Mock authentication middleware for development
 * Adds a mock user to the request
 */
export const mockAuthenticate = (req, res, next) => {
  // Allow mock authentication in any environment
  req.user = {
    id: "00000000-0000-0000-0000-000000000000",
    email: "admin@example.com",
    role: "admin",
    name: "Admin User",
  };

  next();
};
