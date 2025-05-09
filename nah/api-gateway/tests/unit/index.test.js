import request from "supertest";
import express from "express";
import app from "../../src/index.mjs";

// Mock Express app
jest.mock("express", () => {
  const mockExpress = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    listen: jest.fn(),
  }));
  mockExpress.json = jest.fn(() => "json-middleware");
  return mockExpress;
});

// Mock http-proxy-middleware
jest.mock("http-proxy-middleware", () => ({
  createProxyMiddleware: jest.fn(() => "proxy-middleware"),
}));

// Mock environment variables
process.env.PORT = "8080";
process.env.PRODUCT_SERVICE_URL = "http://product-service:8081";
process.env.ORDER_SERVICE_URL = "http://order-service:8082";
process.env.USER_SERVICE_URL = "http://user-service:8083";

describe("API Gateway", () => {
  let mockApp;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a new mock Express app
    mockApp = express();
  });

  test("should have health check endpoint", () => {
    // Arrange & Act - the endpoint is set up when the module is imported

    // Assert
    expect(mockApp.get).toHaveBeenCalledWith("/health", expect.any(Function));
  });

  test("should set up proxy routes", () => {
    // Arrange & Act - the proxy routes are set up when the module is imported

    // Assert
    expect(mockApp.use).toHaveBeenCalledWith(
      "/api/products",
      expect.anything()
    );
    expect(mockApp.use).toHaveBeenCalledWith("/api/orders", expect.anything());
    expect(mockApp.use).toHaveBeenCalledWith("/api/users", expect.anything());
    expect(mockApp.use).toHaveBeenCalledWith("/api/auth", expect.anything());
  });

  test("should use middleware", () => {
    // Arrange & Act - middleware is set up when the module is imported

    // Assert
    expect(mockApp.use).toHaveBeenCalledWith(expect.anything());
  });

  test("should listen on the configured port", () => {
    // Arrange & Act - the server is started when the module is imported

    // Assert
    expect(mockApp.listen).toHaveBeenCalledWith("8080", expect.any(Function));
  });
});
