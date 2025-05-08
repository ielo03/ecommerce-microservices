import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      compareAtPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      costPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      weightUnit: {
        type: DataTypes.ENUM("g", "kg", "lb", "oz"),
        allowNull: true,
      },
      dimensions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "JSON object with length, width, height",
      },
      dimensionsUnit: {
        type: DataTypes.ENUM("cm", "in"),
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Additional product metadata",
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      tags: {
        type: DataTypes.STRING(500),
        allowNull: true,
        get() {
          const rawValue = this.getDataValue("tags");
          return rawValue ? rawValue.split(",") : [];
        },
        set(val) {
          if (Array.isArray(val)) {
            this.setDataValue("tags", val.join(","));
          } else {
            this.setDataValue("tags", val);
          }
        },
      },
      seoTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      seoDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      seoKeywords: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true, // Soft delete (deletedAt instead of removing the record)
      indexes: [
        {
          name: "idx_product_name",
          fields: ["name"],
        },
        {
          name: "idx_product_sku",
          fields: ["sku"],
        },
        {
          name: "idx_product_slug",
          fields: ["slug"],
        },
        {
          name: "idx_product_is_active",
          fields: ["isActive"],
        },
        {
          name: "idx_product_is_featured",
          fields: ["isFeatured"],
        },
      ],
    }
  );

  return Product;
};
