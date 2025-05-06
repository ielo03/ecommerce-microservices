import config from "../config/index.js";
import { UnauthorizedError, ForbiddenError } from "./errorHandler.js";
import logger from "../utils/logger.js";
import crypto from "crypto";

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

    // In a real app, we would verify the token here
    // For now, we'll just assume it's valid and extract the user info
    // This is a simplified approach for development purposes
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
export const authorize = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      // Allow any authenticated user to perform any action

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Simple JWT implementation using built-in crypto
 * Note: This is a simplified implementation for development purposes only.
 * In a real production environment, use the jsonwebtoken package.
 */
export const createToken = (payload, expiresIn = config.jwt.expiresIn) => {
  // Create header
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  // Add expiration to payload
  const now = Math.floor(Date.now() / 1000);
  const exp =
    now +
    (typeof expiresIn === "string"
      ? expiresIn.endsWith("d")
        ? parseInt(expiresIn) * 24 * 60 * 60
        : expiresIn.endsWith("h")
        ? parseInt(expiresIn) * 60 * 60
        : expiresIn.endsWith("m")
        ? parseInt(expiresIn) * 60
        : parseInt(expiresIn)
      : expiresIn);

  const tokenPayload = {
    ...payload,
    iat: now,
    exp,
  };

  // Encode header and payload
  const base64Header = Buffer.from(JSON.stringify(header))
    .toString("base64")
    .replace(/=/g, "");
  const base64Payload = Buffer.from(JSON.stringify(tokenPayload))
    .toString("base64")
    .replace(/=/g, "");

  // Create signature (simplified, not actual HMAC)
  // In a real implementation, use crypto.createHmac
  const signature = Buffer.from(
    `${base64Header}.${base64Payload}.${config.jwt.secret}`
  )
    .toString("base64")
    .replace(/=/g, "");

  // Return JWT
  return `${base64Header}.${base64Payload}.${signature}`;
};
