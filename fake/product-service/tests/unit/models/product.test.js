const { Sequelize } = require("sequelize");
const ProductModel = require("../../../src/models/product");

describe("Product Model", () => {
  let sequelize;
  let Product;

  beforeEach(() => {
    // Create a new Sequelize instance with in-memory SQLite for testing
    sequelize = new Sequelize("sqlite::memory:", {
      logging: false,
    });

    // Initialize the Product model with the test Sequelize instance
    Product = ProductModel(sequelize);

    // Sync the model to create tables in the in-memory database
    return sequelize.sync({ force: true });
  });

  afterEach(() => {
    // Close the connection after each test
    return sequelize.close();
  });

  test("should create a product with valid data", async () => {
    // Arrange
    const productData = {
      name: "Test Product",
      description: "This is a test product",
      price: 19.99,
      sku: "TEST-SKU-001",
      isActive: true,
    };

    // Act
    const product = await Product.create(productData);

    // Assert
    expect(product).toBeDefined();
    expect(product.id).toBeDefined();
    expect(product.name).toBe(productData.name);
    expect(product.description).toBe(productData.description);
    expect(parseFloat(product.price)).toBe(productData.price);
    expect(product.sku).toBe(productData.sku);
    expect(product.isActive).toBe(productData.isActive);
    expect(product.createdAt).toBeDefined();
    expect(product.updatedAt).toBeDefined();
  });

  test("should not create a product without a name", async () => {
    // Arrange
    const productData = {
      description: "This is a test product",
      price: 19.99,
      sku: "TEST-SKU-002",
      isActive: true,
    };

    // Act & Assert
    await expect(Product.create(productData)).rejects.toThrow();
  });

  test("should not create a product without a price", async () => {
    // Arrange
    const productData = {
      name: "Test Product",
      description: "This is a test product",
      sku: "TEST-SKU-003",
      isActive: true,
    };

    // Act & Assert
    await expect(Product.create(productData)).rejects.toThrow();
  });

  test("should not create a product with duplicate SKU", async () => {
    // Arrange
    const productData1 = {
      name: "Test Product 1",
      description: "This is test product 1",
      price: 19.99,
      sku: "TEST-SKU-004",
      isActive: true,
    };

    const productData2 = {
      name: "Test Product 2",
      description: "This is test product 2",
      price: 29.99,
      sku: "TEST-SKU-004", // Same SKU as productData1
      isActive: true,
    };

    // Act
    await Product.create(productData1);

    // Assert
    await expect(Product.create(productData2)).rejects.toThrow();
  });
});
