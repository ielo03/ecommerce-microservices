import express from "express";
import * as productController from "../controllers/productController.js";
import {
  validateProduct,
  validateProductId,
} from "../middleware/validators.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and filtering
 * @access  Public
 */
router.get("/", productController.getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a product by ID
 * @access  Public
 */
router.get("/:id", validateProductId, productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post(
  "/",
  authenticate,
  validateProduct,
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (Admin only)
 */
router.put(
  "/:id",
  authenticate,
  validateProductId,
  validateProduct,
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  authenticate,
  validateProductId,
  productController.deleteProduct
);

/**
 * @route   GET /api/products/category/:categoryId
 * @desc    Get products by category
 * @access  Public
 */
router.get("/category/:categoryId", productController.getProductsByCategory);

/**
 * @route   GET /api/products/search
 * @desc    Search products
 * @access  Public
 */
router.get("/search", productController.searchProducts);

/**
 * @route   GET /api/products/:id/inventory
 * @desc    Get product inventory
 * @access  Public
 */
router.get(
  "/:id/inventory",
  validateProductId,
  productController.getProductInventory
);

/**
 * @route   PUT /api/products/:id/inventory
 * @desc    Update product inventory
 * @access  Private (Admin only)
 */
router.put(
  "/:id/inventory",
  authenticate,
  validateProductId,
  productController.updateProductInventory
);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get("/featured", productController.getFeaturedProducts);

export default router;
