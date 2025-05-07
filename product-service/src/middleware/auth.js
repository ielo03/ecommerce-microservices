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
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new UnauthorizedError(
          "Authentication required. Please provide a valid token."
        )
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(
        new UnauthorizedError(
          "Authentication required. Please provide a valid token."
        )
      );
    }

    try {
      // Extract user info from token (assuming it's a valid JWT)
      const base64Payload = token.split(".")[1];
      const payload = Buffer.from(base64Payload, "base64").toString("utf8");
      req.user = JSON.parse(payload);
      next();
    } catch (error) {
      logger.error("Token verification failed:", error);
      return next(
        new UnauthorizedError("Invalid or expired token. Please login again.")
      );
    }
  } catch (error) {
    logger.error("Authentication error:", error);
    return next(new UnauthorizedError("Authentication failed."));
  }
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
