import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import config from "../config/index.js";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(
          "customer",
          "admin",
          "product_manager",
          "inventory_manager"
        ),
        defaultValue: "customer",
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true, // Soft delete (deletedAt instead of removing the record)
      indexes: [
        {
          name: "idx_user_email",
          fields: ["email"],
        },
        {
          name: "idx_user_role",
          fields: ["role"],
        },
      ],
      hooks: {
        // Hash password before saving
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(
              user.password,
              config.bcrypt.saltRounds
            );
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(
              user.password,
              config.bcrypt.saltRounds
            );
          }
        },
      },
    }
  );

  // Instance method to compare passwords
  User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Instance method to return user data without sensitive information
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};
