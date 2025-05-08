import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ProductVariant = sequelize.define(
    "ProductVariant",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      attributes: {
        type: DataTypes.JSON,
        allowNull: true,
        comment:
          "JSON object containing variant attributes like color, size, etc.",
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      compareAtPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Original price for showing discounts",
      },
      weight: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
      },
      weightUnit: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: "kg",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      tableName: "product_variants",
    }
  );

  return ProductVariant;
};
