import Joi from "joi";
import { ValidationError } from "../utils/errors.js";

/**
 * Validate product ID
 */
export const validateProductId = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().uuid().required(),
  });

  const { error } = schema.validate({ id: req.params.id });

  if (error) {
    return next(
      new ValidationError("Invalid product ID", [error.details[0].message])
    );
  }

  next();
};

/**
 * Validate product data
 */
export const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().allow("", null),
    sku: Joi.string().min(3).max(100).required(),
    price: Joi.number().min(0).required(),
    compareAtPrice: Joi.number().min(0).allow(null),
    costPrice: Joi.number().min(0).allow(null),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean(),
    weight: Joi.number().min(0).allow(null),
    weightUnit: Joi.string().valid("g", "kg", "lb", "oz").allow(null),
    dimensions: Joi.object({
      length: Joi.number().min(0),
      width: Joi.number().min(0),
      height: Joi.number().min(0),
    }).allow(null),
    dimensionsUnit: Joi.string().valid("cm", "in").allow(null),
    metadata: Joi.object().allow(null),
    slug: Joi.string().min(3).max(255).required(),
    tags: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .allow(null),
    seoTitle: Joi.string().max(255).allow("", null),
    seoDescription: Joi.string().allow("", null),
    seoKeywords: Joi.string().max(500).allow("", null),
    categoryId: Joi.string().uuid().allow(null),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return next(new ValidationError("Invalid product data", errors));
  }

  next();
};

/**
 * Validate category data
 */
export const validateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    description: Joi.string().allow("", null),
    slug: Joi.string().min(2).max(255).required(),
    parentId: Joi.string().uuid().allow(null),
    isActive: Joi.boolean(),
    seoTitle: Joi.string().max(255).allow("", null),
    seoDescription: Joi.string().allow("", null),
    seoKeywords: Joi.string().max(500).allow("", null),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return next(new ValidationError("Invalid category data", errors));
  }

  next();
};

/**
 * Validate inventory update
 */
export const validateInventoryUpdate = (req, res, next) => {
  const schema = Joi.object({
    variantId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(0).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(
      new ValidationError("Invalid inventory data", [error.details[0].message])
    );
  }

  next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default("createdAt"),
    order: Joi.string().valid("ASC", "DESC").default("DESC"),
  });

  const { error, value } = schema.validate({
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order,
  });

  if (error) {
    return next(
      new ValidationError("Invalid pagination parameters", [
        error.details[0].message,
      ])
    );
  }

  // Update the query with validated and defaulted values
  req.query.page = value.page;
  req.query.limit = value.limit;
  req.query.sort = value.sort;
  req.query.order = value.order;

  next();
};
