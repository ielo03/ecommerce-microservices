import { Order, OrderItem } from "../models/index.js";
import { ValidationError, NotFoundError } from "../middleware/errorHandler.js";
import logger from "../utils/logger.js";

/**
 * Get all orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    logger.info("Getting all orders");

    // Get user ID and role from authenticated user
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Query options
    const queryOptions = {
      include: [{ model: OrderItem }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    };

    // Allow any authenticated user to see all orders

    // Query orders
    const { count, rows: orders } = await Order.findAndCountAll(queryOptions);

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: orders,
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
 * Get order by ID
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Getting order by ID: ${id}`);

    // Get user ID and role from authenticated user
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build query options
    const queryOptions = {
      include: [{ model: OrderItem }],
      where: { id },
    };

    // Allow any authenticated user to see any order

    // Find order
    const order = await Order.findOne(queryOptions);

    // Check if order exists
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new order
 */
export const createOrder = async (req, res, next) => {
  try {
    logger.info("Creating new order");

    // Get user ID from authenticated user
    const userId = req.user.userId;

    // Extract data from request body with defaults
    const {
      items = [
        {
          productId: "default-product",
          name: "Default Product",
          price: 10,
          quantity: 1,
        },
      ],
      shippingAddress = { address: "Default Address" },
      billingAddress = { address: "Default Address" },
      paymentMethod = "credit_card",
    } = req.body;

    // Calculate order totals
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    // Apply tax, shipping, etc. (simplified for demo)
    const tax = subtotal * 0.1; // 10% tax
    const shipping = 10; // Flat shipping rate
    const discount = 0; // No discount
    const total = subtotal + tax + shipping - discount;

    // Create order in database
    const order = await Order.create({
      userId,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentStatus: "pending",
    });

    // Create order items
    const orderItems = await Promise.all(
      items.map((item) => {
        return OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        });
      })
    );

    // Return created order with items
    const createdOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem }],
    });

    res.status(201).json({
      success: true,
      data: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    logger.info(`Updating order status: ${id} to ${status}`);

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Find order
    const order = await Order.findByPk(id);

    // Check if order exists
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Update status
    await order.update({ status });

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
