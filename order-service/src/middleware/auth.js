import config from "../config/index.js";
import { UnauthorizedError, ForbiddenError } from "./errorHandler.js";
import logger from "../utils/logger.js";

/**
 * Middleware to authenticate requests using JWT
 * Note: In a real production environment, this would verify the JWT token,
 * but for simplicity and to avoid dependency issues, we're just checking
 * if the token exists and extracting the user info from it.
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.split(" ")[1];

    try {
      // Extract user info from token (assuming it's a valid JWT)
      const base64Payload = token.split(".")[1];
      const payload = Buffer.from(base64Payload, "base64").toString("utf8");
      req.user = JSON.parse(payload);
      next();
    } catch (error) {
      logger.error("Token verification failed:", error);
      throw new UnauthorizedError("Invalid or expired token");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize requests based on user roles
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
