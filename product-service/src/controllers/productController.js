import {
  Product,
  Category,
  ProductImage,
  ProductVariant,
  Inventory,
} from "../models/index.js";
import logger from "../utils/logger.js";
import config from "../config/index.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import { Op } from "sequelize";

/**
 * Get all products with pagination and filtering
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = config.pagination.limit,
      sort = "createdAt",
      order = "DESC",
      category,
      minPrice,
      maxPrice,
      isActive,
    } = req.query;

    // Validate pagination params
    const pageNumber = parseInt(page, 10);
    const limitNumber = Math.min(
      parseInt(limit, 10),
      config.pagination.maxLimit
    );
    const offset = (pageNumber - 1) * limitNumber;

    // Build query options
    const queryOptions = {
      limit: limitNumber,
      offset,
      order: [[sort, order]],
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
        },
        {
          model: ProductImage,
          attributes: ["id", "url", "alt", "isPrimary"],
        },
      ],
    };

    // Build where clause for filtering
    const whereClause = {};

    if (category) {
      whereClause.categoryId = category;
    }

    if (minPrice) {
      whereClause.price = { ...whereClause.price, $gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      whereClause.price = { ...whereClause.price, $lte: parseFloat(maxPrice) };
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    if (Object.keys(whereClause).length > 0) {
      queryOptions.where = whereClause;
    }

    // Execute query
    const { count, rows: products } = await Product.findAndCountAll(
      queryOptions
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNumber);
    const hasNext = pageNumber < totalPages;
    const hasPrev = pageNumber > 1;

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNext,
        hasPrev,
      },
      data: products,
    });
  } catch (error) {
    logger.error("Error in getAllProducts:", error);
    next(error);
  }
};

/**
 * Get a product by ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
        },
        {
          model: ProductImage,
          attributes: ["id", "url", "alt", "isPrimary"],
        },
        {
          model: ProductVariant,
          include: [
            {
              model: Inventory,
              attributes: ["quantity", "reservedQuantity", "availableQuantity"],
            },
          ],
        },
      ],
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error(`Error in getProductById: ${error.message}`);
    next(error);
  }
};

/**
 * Create a new product
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    // Create the product
    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error(`Error in createProduct: ${error.message}`);
    next(error);
  }
};

/**
 * Update a product
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    // Update the product
    await product.update(updateData);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error(`Error in updateProduct: ${error.message}`);
    next(error);
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    // Soft delete the product
    await product.destroy();

    res.status(200).json({
      success: true,
      message: `Product with ID ${id} deleted successfully`,
    });
  } catch (error) {
    logger.error(`Error in deleteProduct: ${error.message}`);
    next(error);
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const {
      page = 1,
      limit = config.pagination.limit,
      sort = "createdAt",
      order = "DESC",
    } = req.query;

    // Validate pagination params
    const pageNumber = parseInt(page, 10);
    const limitNumber = Math.min(
      parseInt(limit, 10),
      config.pagination.maxLimit
    );
    const offset = (pageNumber - 1) * limitNumber;

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new NotFoundError(`Category with ID ${categoryId} not found`);
    }

    // Get products by category
    const { count, rows: products } = await Product.findAndCountAll({
      where: { categoryId },
      limit: limitNumber,
      offset,
      order: [[sort, order]],
      include: [
        {
          model: ProductImage,
          attributes: ["id", "url", "alt", "isPrimary"],
        },
      ],
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNumber);
    const hasNext = pageNumber < totalPages;
    const hasPrev = pageNumber > 1;

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNext,
        hasPrev,
      },
      data: products,
    });
  } catch (error) {
    logger.error(`Error in getProductsByCategory: ${error.message}`);
    next(error);
  }
};

/**
 * Search products
 */
export const searchProducts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = config.pagination.limit } = req.query;

    if (!q) {
      throw new BadRequestError("Search query is required");
    }

    // Validate pagination params
    const pageNumber = parseInt(page, 10);
    const limitNumber = Math.min(
      parseInt(limit, 10),
      config.pagination.maxLimit
    );
    const offset = (pageNumber - 1) * limitNumber;

    // Search products
    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { sku: { [Op.like]: `%${q}%` } },
          { tags: { [Op.like]: `%${q}%` } },
        ],
      },
      limit: limitNumber,
      offset,
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
        },
        {
          model: ProductImage,
          attributes: ["id", "url", "alt", "isPrimary"],
        },
      ],
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limitNumber);
    const hasNext = pageNumber < totalPages;
    const hasPrev = pageNumber > 1;

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNext,
        hasPrev,
      },
      data: products,
    });
  } catch (error) {
    logger.error(`Error in searchProducts: ${error.message}`);
    next(error);
  }
};

/**
 * Get product inventory
 */
export const getProductInventory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductVariant,
          include: [
            {
              model: Inventory,
              attributes: ["quantity", "reservedQuantity", "availableQuantity"],
            },
          ],
        },
      ],
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    res.status(200).json({
      success: true,
      data: product.ProductVariants.map((variant) => ({
        variantId: variant.id,
        variantName: variant.name,
        sku: variant.sku,
        inventory: variant.Inventory,
      })),
    });
  } catch (error) {
    logger.error(`Error in getProductInventory: ${error.message}`);
    next(error);
  }
};

/**
 * Update product inventory
 */
export const updateProductInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { variantId, quantity } = req.body;

    if (!variantId || quantity === undefined) {
      throw new BadRequestError("variantId and quantity are required");
    }

    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    // Check if variant exists
    const variant = await ProductVariant.findOne({
      where: { id: variantId, productId: id },
      include: [{ model: Inventory }],
    });

    if (!variant) {
      throw new NotFoundError(
        `Variant with ID ${variantId} not found for product ${id}`
      );
    }

    // Update inventory
    await variant.Inventory.update({ quantity });

    res.status(200).json({
      success: true,
      data: {
        variantId: variant.id,
        variantName: variant.name,
        sku: variant.sku,
        inventory: {
          quantity: variant.Inventory.quantity,
          reservedQuantity: variant.Inventory.reservedQuantity,
          availableQuantity: variant.Inventory.availableQuantity,
        },
      },
    });
  } catch (error) {
    logger.error(`Error in updateProductInventory: ${error.message}`);
    next(error);
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const limitNumber = Math.min(parseInt(limit, 10), 50);

    const products = await Product.findAll({
      where: { isFeatured: true, isActive: true },
      limit: limitNumber,
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
        },
        {
          model: ProductImage,
          attributes: ["id", "url", "alt", "isPrimary"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    logger.error(`Error in getFeaturedProducts: ${error.message}`);
    next(error);
  }
};
