import { Sequelize } from "sequelize";
import config from "../config/index.js";
import logger from "../utils/logger.js";

// Import model factories
import productModel from "./product.js";
import categoryModel from "./category.js";
import productImageModel from "./productImage.js";
import productVariantModel from "./productVariant.js";
import inventoryModel from "./inventory.js";

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

// Initialize models
const Product = productModel(sequelize);
const Category = categoryModel(sequelize);
const ProductImage = productImageModel(sequelize);
const ProductVariant = productVariantModel(sequelize);
const Inventory = inventoryModel(sequelize);

// Define associations
Category.hasMany(Product);
Product.belongsTo(Category);

Product.hasMany(ProductImage);
ProductImage.belongsTo(Product);

Product.hasMany(ProductVariant);
ProductVariant.belongsTo(Product);

ProductVariant.hasOne(Inventory);
Inventory.belongsTo(ProductVariant);

// Export models and Sequelize instance
export {
  sequelize,
  Product,
  Category,
  ProductImage,
  ProductVariant,
  Inventory,
};
