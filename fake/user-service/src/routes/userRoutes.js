import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getAllUsers,
  getUserById,
  getUserProfile,
  createUser,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get("/", authenticate, getAllUsers);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, getUserProfile);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (User or Admin)
 */
router.get("/:id", authenticate, getUserById);

/**
 * @route   POST /api/users
 * @desc    Create a new user (register)
 * @access  Public
 */
router.post("/", createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (User or Admin)
 */
router.put("/:id", authenticate, updateUser);

export default router;
