import { Sequelize } from "sequelize";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import orderModel from "./order.js";
import orderItemModel from "./orderItem.js";

// Initialize Sequelize with database configuration
const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: "mysql",
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Import models
const Order = orderModel(sequelize);
const OrderItem = orderItemModel(sequelize);

// Define associations
Order.hasMany(OrderItem, {
  foreignKey: {
    name: "orderId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

// Use the same foreign key name for the belongsTo association
OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
});

// Export models and Sequelize instance
export { sequelize, Order, OrderItem };
