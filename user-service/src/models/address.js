import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Address = sequelize.define(
    "Address",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM("shipping", "billing"),
        allowNull: false,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      company: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      addressLine1: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      addressLine2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      postalCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: "idx_address_user_id",
          fields: ["UserId"],
        },
        {
          name: "idx_address_type",
          fields: ["type"],
        },
      ],
    }
  );

  return Address;
};
