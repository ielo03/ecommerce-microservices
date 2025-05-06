import { Sequelize } from "sequelize";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import userModel from "./user.js";
import addressModel from "./address.js";

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
const User = userModel(sequelize);
const Address = addressModel(sequelize);

// Define associations
User.hasMany(Address, {
  foreignKey: {
    name: "UserId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

// Use the same foreign key name for the belongsTo association
Address.belongsTo(User, {
  foreignKey: "UserId",
});

// Export models and Sequelize instance
export { sequelize, User, Address };
