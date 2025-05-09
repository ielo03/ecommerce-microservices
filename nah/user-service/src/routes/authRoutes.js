import express from "express";
import { loginUser } from "../controllers/userController.js";

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginUser);

export default router;
