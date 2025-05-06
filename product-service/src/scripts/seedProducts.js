import {
  sequelize,
  Product,
  Category,
  ProductImage,
  ProductVariant,
  Inventory,
} from "../models/index.js";
import logger from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";

// Sample data
const categories = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    name: "Electronics",
    slug: "electronics",
    isActive: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    name: "Clothing",
    slug: "clothing",
    isActive: true,
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    isActive: true,
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    logger.info("Database synced");

    // Create categories
    const createdCategories = await Category.bulkCreate(categories);
    logger.info("Categories created");

    // Create products
    const products = [
      {
        id: uuidv4(),
        name: "Smartphone X",
        description: "Latest smartphone with amazing features",
        sku: "PHONE-X-001",
        price: 999.99,
        isActive: true,
        isFeatured: true,
        slug: "smartphone-x",
        CategoryId: createdCategories[0].id,
      },
      {
        id: uuidv4(),
        name: "Laptop Pro",
        description: "Powerful laptop for professionals",
        sku: "LAPTOP-PRO-001",
        price: 1499.99,
        isActive: true,
        isFeatured: true,
        slug: "laptop-pro",
        CategoryId: createdCategories[0].id,
      },
      {
        id: uuidv4(),
        name: "Cotton T-Shirt",
        description: "Comfortable cotton t-shirt",
        sku: "TSHIRT-001",
        price: 19.99,
        isActive: true,
        isFeatured: false,
        slug: "cotton-tshirt",
        CategoryId: createdCategories[1].id,
      },
    ];

    const createdProducts = await Product.bulkCreate(products);
    logger.info("Products created");

    // Create product images
    const productImages = [
      {
        id: uuidv4(),
        url: "https://example.com/images/smartphone-x.jpg",
        alt: "Smartphone X",
        isPrimary: true,
        ProductId: createdProducts[0].id,
      },
      {
        id: uuidv4(),
        url: "https://example.com/images/laptop-pro.jpg",
        alt: "Laptop Pro",
        isPrimary: true,
        ProductId: createdProducts[1].id,
      },
      {
        id: uuidv4(),
        url: "https://example.com/images/cotton-tshirt.jpg",
        alt: "Cotton T-Shirt",
        isPrimary: true,
        ProductId: createdProducts[2].id,
      },
    ];

    await ProductImage.bulkCreate(productImages);
    logger.info("Product images created");

    // Create product variants
    const productVariants = [
      {
        sku: "PHONE-X-001-BLACK",
        name: "Smartphone X - Black",
        price: 999.99,
        attributes: JSON.stringify({ color: "Black", storage: "128GB" }),
        isActive: true,
        ProductId: createdProducts[0].id,
      },
      {
        sku: "PHONE-X-001-WHITE",
        name: "Smartphone X - White",
        price: 999.99,
        attributes: JSON.stringify({ color: "White", storage: "128GB" }),
        isActive: true,
        ProductId: createdProducts[0].id,
      },
      {
        sku: "LAPTOP-PRO-001-SILVER",
        name: "Laptop Pro - Silver",
        price: 1499.99,
        attributes: JSON.stringify({
          color: "Silver",
          ram: "16GB",
          storage: "512GB",
        }),
        isActive: true,
        ProductId: createdProducts[1].id,
      },
      {
        sku: "TSHIRT-001-M",
        name: "Cotton T-Shirt - Medium",
        price: 19.99,
        attributes: JSON.stringify({ size: "M", color: "White" }),
        isActive: true,
        ProductId: createdProducts[2].id,
      },
      {
        sku: "TSHIRT-001-L",
        name: "Cotton T-Shirt - Large",
        price: 19.99,
        attributes: JSON.stringify({ size: "L", color: "White" }),
        isActive: true,
        ProductId: createdProducts[2].id,
      },
    ];

    const createdVariants = await ProductVariant.bulkCreate(productVariants);
    logger.info("Product variants created");

    // Create inventory for each variant
    const inventoryData = createdVariants.map((variant) => ({
      quantity: 100,
      reservedQuantity: 0,
      ProductVariantId: variant.id,
    }));

    await Inventory.bulkCreate(inventoryData);
    logger.info("Inventory created");

    logger.info("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
