const jwt = require("jsonwebtoken");
const { authenticate, authorize } = require("../../../src/middleware/auth");
const {
  UnauthorizedError,
  ForbiddenError,
} = require("../../../src/utils/errors");

// Mock jsonwebtoken
jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request, response, and next function
    req = {
      headers: {},
      user: null,
    };

    res = {};

    next = jest.fn();
  });

  describe("authenticate", () => {
    test("should authenticate with valid token", async () => {
      // Arrange
      const mockUser = { id: 1, email: "user@example.com", role: "user" };
      req.headers.authorization = "Bearer valid-token";

      jwt.verify.mockReturnValue(mockUser);

      // Act
      await authenticate(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-token",
        expect.any(String)
      );
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    test("should return 401 if no authorization header", async () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      await authenticate(req, res, next);

      // Assert
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(next.mock.calls[0][0].message).toContain(
        "Authentication required"
      );
    });

    test("should return 401 if authorization header is invalid", async () => {
      // Arrange
      req.headers.authorization = "InvalidHeader";

      // Act
      await authenticate(req, res, next);

      // Assert
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(next.mock.calls[0][0].message).toContain(
        "Authentication required"
      );
    });

    test("should return 401 if token is invalid", async () => {
      // Arrange
      req.headers.authorization = "Bearer invalid-token";

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Act
      await authenticate(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        "invalid-token",
        expect.any(String)
      );
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(next.mock.calls[0][0].message).toContain(
        "Invalid or expired token"
      );
    });
  });

  describe("authorize", () => {
    test("should authorize user with correct role", () => {
      // Arrange
      req.user = { id: 1, email: "admin@example.com", role: "admin" };
      const middleware = authorize(["admin", "superadmin"]);

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    test("should return 401 if user is not authenticated", () => {
      // Arrange
      req.user = null;
      const middleware = authorize(["admin"]);

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(next.mock.calls[0][0].message).toContain(
        "Authentication required"
      );
    });

    test("should return 403 if user has incorrect role", () => {
      // Arrange
      req.user = { id: 1, email: "user@example.com", role: "user" };
      const middleware = authorize(["admin"]);

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(next.mock.calls[0][0].message).toContain("do not have permission");
    });
  });
});
