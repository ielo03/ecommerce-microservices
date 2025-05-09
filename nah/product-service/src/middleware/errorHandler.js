import logger from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.id,
  });

  // Default to 500 server error
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = [];

  // Handle specific error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  } else if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    // Handle Sequelize validation errors
    statusCode = 400;
    message = "Validation Error";
    errors = err.errors.map((e) => e.message);
  } else if (err.name === "JsonWebTokenError") {
    // Handle JWT errors
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    // Handle JWT expiration
    statusCode = 401;
    message = "Token expired";
  } else if (err.name === "SyntaxError" && err.message.includes("JSON")) {
    // Handle JSON parsing errors
    statusCode = 400;
    message = "Invalid JSON";
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    status: statusCode >= 500 ? "error" : "fail",
    message,
    errors: errors.length > 0 ? errors : undefined,
    // Include stack trace in development mode
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
