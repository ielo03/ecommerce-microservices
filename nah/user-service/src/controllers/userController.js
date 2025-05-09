import { User, Address } from "../models/index.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} from "../middleware/errorHandler.js";
import { createToken } from "../middleware/auth.js";
import config from "../config/index.js";
import logger from "../utils/logger.js";

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    logger.info("Getting all users");

    // Get pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Query users
    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        page,
        limit,
        totalItems: count,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Getting user by ID: ${id}`);

    // Find user
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Address }],
    });

    // Check if user exists
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Allow any authenticated user to access any user's data

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile (current authenticated user)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    logger.info(`Getting profile for user: ${userId}`);

    // Find user
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [{ model: Address }],
    });

    // Check if user exists
    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user (register)
 */
export const createUser = async (req, res, next) => {
  try {
    logger.info("Creating new user");

    // Validate request body
    const { email, password, firstName, lastName } = req.body;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    if (!password) {
      throw new ValidationError("Password is required");
    }

    if (!firstName) {
      throw new ValidationError("First name is required");
    }

    if (!lastName) {
      throw new ValidationError("Last name is required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: "customer", // Default role
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Updating user: ${id}`);

    // Check if user is updating their own data or is an admin
    if (req.user.userId !== id && req.user.role !== "admin") {
      throw new UnauthorizedError("You are not authorized to update this user");
    }

    // Find user
    const user = await User.findByPk(id);

    // Check if user exists
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update user
    const { firstName, lastName, phone } = req.body;

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res, next) => {
  try {
    logger.info("User login attempt");

    // Validate request body
    const { email, password } = req.body;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    if (!password) {
      throw new ValidationError("Password is required");
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    // Check if user exists
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate JWT token using our custom function
    const token = createToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.expiresIn
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
