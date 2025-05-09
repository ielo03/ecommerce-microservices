import request from "supertest";
import express from "express";
import app from "../../src/index.mjs";

// Mock Express app
jest.mock("express", () => {
  const mockExpress = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn(),
  }));
  mockExpress.json = jest.fn(() => "json-middleware");
  return mockExpress;
});

// Mock environment variables
process.env.PORT = "8083";

describe("User Service", () => {
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

  test("should have user endpoints", () => {
    // Arrange & Act - the endpoints are set up when the module is imported

    // Assert
    expect(mockApp.get).toHaveBeenCalledWith(
      "/api/users",
      expect.any(Function)
    );
    expect(mockApp.get).toHaveBeenCalledWith(
      "/api/users/:id",
      expect.any(Function)
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      "/api/users",
      expect.any(Function)
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.any(Function)
    );
  });

  test("should use middleware", () => {
    // Arrange & Act - middleware is set up when the module is imported

    // Assert
    expect(mockApp.use).toHaveBeenCalledWith(expect.anything());
  });

  test("should listen on the configured port", () => {
    // Arrange & Act - the server is started when the module is imported

    // Assert
    expect(mockApp.listen).toHaveBeenCalledWith("8083", expect.any(Function));
  });
});
