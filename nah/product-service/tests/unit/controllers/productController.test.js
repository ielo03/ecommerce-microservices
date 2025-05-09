const productController = require("../../../src/controllers/productController");
const { Product } = require("../../../src/models");

// Mock the models
jest.mock("../../../src/models", () => ({
  Product: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe("Product Controller", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      params: {},
      body: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe("getAllProducts", () => {
    test("should return all products", async () => {
      // Arrange
      const mockProducts = [
        { id: 1, name: "Product 1", price: 19.99 },
        { id: 2, name: "Product 2", price: 29.99 },
      ];

      Product.findAll.mockResolvedValue(mockProducts);

      // Act
      await productController.getAllProducts(req, res, next);

      // Assert
      expect(Product.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle errors", async () => {
      // Arrange
      const error = new Error("Database error");
      Product.findAll.mockRejectedValue(error);

      // Act
      await productController.getAllProducts(req, res, next);

      // Assert
      expect(Product.findAll).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getProductById", () => {
    test("should return a product by id", async () => {
      // Arrange
      const mockProduct = { id: 1, name: "Product 1", price: 19.99 };
      req.params.id = "1";

      Product.findByPk.mockResolvedValue(mockProduct);

      // Act
      await productController.getProductById(req, res, next);

      // Assert
      expect(Product.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 404 if product not found", async () => {
      // Arrange
      req.params.id = "999";

      Product.findByPk.mockResolvedValue(null);

      // Act
      await productController.getProductById(req, res, next);

      // Assert
      expect(Product.findByPk).toHaveBeenCalledWith("999");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Product not found",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle errors", async () => {
      // Arrange
      const error = new Error("Database error");
      req.params.id = "1";

      Product.findByPk.mockRejectedValue(error);

      // Act
      await productController.getProductById(req, res, next);

      // Assert
      expect(Product.findByPk).toHaveBeenCalledWith("1");
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("createProduct", () => {
    test("should create a new product", async () => {
      // Arrange
      const productData = {
        name: "New Product",
        description: "A new product",
        price: 39.99,
        sku: "NEW-SKU-001",
      };

      const createdProduct = { id: 3, ...productData };

      req.body = productData;

      Product.create.mockResolvedValue(createdProduct);

      // Act
      await productController.createProduct(req, res, next);

      // Assert
      expect(Product.create).toHaveBeenCalledWith(productData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdProduct,
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle validation errors", async () => {
      // Arrange
      const error = new Error("Validation error");
      error.name = "SequelizeValidationError";

      req.body = { name: "Invalid Product" }; // Missing required fields

      Product.create.mockRejectedValue(error);

      // Act
      await productController.createProduct(req, res, next);

      // Assert
      expect(Product.create).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
