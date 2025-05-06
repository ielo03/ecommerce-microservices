-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ecommerce;

-- Use the database
USE ecommerce;

-- Create tables for product service
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);

CREATE TABLE IF NOT EXISTS Products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  compareAtPrice DECIMAL(10, 2),
  costPrice DECIMAL(10, 2),
  isActive BOOLEAN DEFAULT TRUE,
  isFeatured BOOLEAN DEFAULT FALSE,
  weight DECIMAL(10, 2),
  weightUnit ENUM('g', 'kg', 'lb', 'oz'),
  dimensions JSON,
  dimensionsUnit ENUM('cm', 'in'),
  metadata JSON,
  slug VARCHAR(255) NOT NULL UNIQUE,
  tags VARCHAR(500),
  seoTitle VARCHAR(255),
  seoDescription TEXT,
  seoKeywords VARCHAR(500),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME,
  CategoryId VARCHAR(36),
  FOREIGN KEY (CategoryId) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS product_images (
  id VARCHAR(36) PRIMARY KEY,
  url VARCHAR(255) NOT NULL,
  alt VARCHAR(255),
  isPrimary BOOLEAN DEFAULT FALSE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  ProductId VARCHAR(36) NOT NULL,
  FOREIGN KEY (ProductId) REFERENCES Products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
  id VARCHAR(36) PRIMARY KEY,
  sku VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  options JSON NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  ProductId VARCHAR(36) NOT NULL,
  FOREIGN KEY (ProductId) REFERENCES Products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventories (
  id VARCHAR(36) PRIMARY KEY,
  quantity INT NOT NULL DEFAULT 0,
  reservedQuantity INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  ProductVariantId VARCHAR(36) NOT NULL,
  FOREIGN KEY (ProductVariantId) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- Create tables for user service
CREATE TABLE IF NOT EXISTS Users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  role ENUM('customer', 'admin', 'product_manager', 'inventory_manager') NOT NULL DEFAULT 'customer',
  isActive BOOLEAN DEFAULT TRUE,
  emailVerified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  metadata JSON,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);

CREATE TABLE IF NOT EXISTS Addresses (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('shipping', 'billing') NOT NULL,
  isDefault BOOLEAN DEFAULT FALSE,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  company VARCHAR(100),
  addressLine1 VARCHAR(255) NOT NULL,
  addressLine2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postalCode VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UserId VARCHAR(36) NOT NULL,
  FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create tables for order service
CREATE TABLE IF NOT EXISTS Orders (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shippingAddress JSON NOT NULL,
  billingAddress JSON NOT NULL,
  paymentMethod VARCHAR(50) NOT NULL,
  paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  notes TEXT,
  metadata JSON,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS OrderItems (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  productVariantId VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  metadata JSON,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_product_name ON Products(name);
CREATE INDEX idx_product_sku ON Products(sku);
CREATE INDEX idx_product_slug ON Products(slug);
CREATE INDEX idx_product_is_active ON Products(isActive);
CREATE INDEX idx_product_is_featured ON Products(isFeatured);

CREATE INDEX idx_user_email ON Users(email);
CREATE INDEX idx_user_role ON Users(role);

CREATE INDEX idx_address_user_id ON Addresses(UserId);
CREATE INDEX idx_address_type ON Addresses(type);

CREATE INDEX idx_order_user_id ON Orders(userId);
CREATE INDEX idx_order_status ON Orders(status);
CREATE INDEX idx_order_payment_status ON Orders(paymentStatus);
CREATE INDEX idx_order_created_at ON Orders(createdAt);

CREATE INDEX idx_order_item_product_id ON OrderItems(productId);

-- Create admin user
INSERT INTO Users (id, email, password, firstName, lastName, role, isActive, emailVerified, createdAt, updatedAt)
VALUES (
  'u1000000-0000-0000-0000-000000000001',
  'admin@example.com',
  '$2b$10$3euPcmQFCiblsZeEu5s7p.9wVsWB8Y3wCmJLLTpDDWjlQC.e0BFhC', -- password: admin123
  'Admin',
  'User',
  'admin',
  TRUE,
  TRUE,
  NOW(),
  NOW()
);

-- Create sample categories
INSERT INTO categories (id, name, slug, createdAt, updatedAt)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000002', 'Clothing', 'clothing', NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000003', 'Home & Kitchen', 'home-kitchen', NOW(), NOW());

-- Create sample products
INSERT INTO Products (id, name, description, sku, price, isActive, isFeatured, slug, CategoryId, createdAt, updatedAt)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'Smartphone X',
    'Latest smartphone with amazing features',
    'PHONE-X-001',
    999.99,
    TRUE,
    TRUE,
    'smartphone-x',
    'c1000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'Laptop Pro',
    'Powerful laptop for professionals',
    'LAPTOP-PRO-001',
    1499.99,
    TRUE,
    TRUE,
    'laptop-pro',
    'c1000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'Cotton T-Shirt',
    'Comfortable cotton t-shirt',
    'TSHIRT-001',
    19.99,
    TRUE,
    FALSE,
    'cotton-tshirt',
    'c1000000-0000-0000-0000-000000000002',
    NOW(),
    NOW()
  );

-- Grant permissions to the ecommerce user
GRANT ALL PRIVILEGES ON ecommerce.* TO 'ecommerce'@'%';
FLUSH PRIVILEGES;