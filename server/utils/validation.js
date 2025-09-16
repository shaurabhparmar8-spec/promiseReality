/**
 * Comprehensive Validation Utility
 * Centralized validation rules for all endpoints
 */

const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const commonRules = {
  mongoId: (field) => param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} ID format`),

  email: (field = 'email') => body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters'),

  phone: (field = 'phone') => body(field)
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be exactly 10 digits'),

  password: (field = 'password') => body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  name: (field = 'name') => body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  string: (field, min = 1, max = 255) => body(field)
    .trim()
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`),

  number: (field, min = 0, max = null) => {
    let validator = body(field)
      .isNumeric()
      .withMessage(`${field} must be a number`);
    
    if (min !== null) {
      validator = validator.isFloat({ min })
        .withMessage(`${field} must be at least ${min}`);
    }
    
    if (max !== null) {
      validator = validator.isFloat({ max })
        .withMessage(`${field} cannot exceed ${max}`);
    }
    
    return validator;
  },

  boolean: (field) => body(field)
    .isBoolean()
    .withMessage(`${field} must be a boolean value`),

  array: (field, min = 0, max = null) => {
    let validator = body(field)
      .isArray()
      .withMessage(`${field} must be an array`);
    
    if (min > 0) {
      validator = validator.isArray({ min })
        .withMessage(`${field} must contain at least ${min} items`);
    }
    
    if (max !== null) {
      validator = validator.isArray({ max })
        .withMessage(`${field} cannot contain more than ${max} items`);
    }
    
    return validator;
  },

  enum: (field, values) => body(field)
    .isIn(values)
    .withMessage(`${field} must be one of: ${values.join(', ')}`),

  url: (field) => body(field)
    .isURL()
    .withMessage(`${field} must be a valid URL`),

  date: (field) => body(field)
    .isISO8601()
    .withMessage(`${field} must be a valid date in ISO 8601 format`)
};

// Validation schemas for different entities
const validationSchemas = {
  // Auth validation
  register: [
    commonRules.name('name'),
    commonRules.email(),
    commonRules.phone(),
    commonRules.password()
  ],

  login: [
    commonRules.email(),
    body('password').notEmpty().withMessage('Password is required')
  ],

  forgotPassword: [
    commonRules.email()
  ],

  resetPassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    commonRules.password('password')
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    commonRules.password('newPassword')
  ],

  // Property validation
  createProperty: [
    commonRules.string('title', 3, 200),
    commonRules.string('description', 10, 2000),
    commonRules.enum('type', ['Villa', 'Apartment', 'Plot', 'Bungalow', 'Flat', 'Penthouse', 'Studio', 'Duplex', 'Farmhouse']),
    commonRules.number('price.amount', 1),
    commonRules.enum('price.priceType', ['sale', 'rent']),
    commonRules.string('location.area', 2, 100),
    commonRules.string('location.city', 2, 50),
    commonRules.string('location.state', 2, 50),
    commonRules.string('location.pincode', 6, 6).matches(/^[1-9][0-9]{5}$/),
    commonRules.number('specifications.bedrooms', 0, 20),
    commonRules.number('specifications.bathrooms', 0, 20),
    commonRules.number('specifications.area.value', 1),
    commonRules.enum('specifications.area.unit', ['sqft', 'sqm', 'acres', 'bigha']),
    commonRules.number('specifications.parking', 0, 10),
    commonRules.enum('specifications.furnished', ['Fully-Furnished', 'Semi-Furnished', 'Unfurnished']),
    commonRules.array('amenities', 0, 20),
    commonRules.array('features', 0, 20),
    commonRules.enum('status', ['available', 'sold', 'rented', 'under-negotiation']),
    commonRules.boolean('isFeatured')
  ],

  updateProperty: [
    commonRules.mongoId('id'),
    commonRules.string('title', 3, 200).optional(),
    commonRules.string('description', 10, 2000).optional(),
    commonRules.enum('type', ['Villa', 'Apartment', 'Plot', 'Bungalow', 'Flat', 'Penthouse', 'Studio', 'Duplex', 'Farmhouse']).optional(),
    commonRules.number('price.amount', 1).optional(),
    commonRules.enum('price.priceType', ['sale', 'rent']).optional(),
    commonRules.string('location.area', 2, 100).optional(),
    commonRules.string('location.city', 2, 50).optional(),
    commonRules.string('location.state', 2, 50).optional(),
    commonRules.string('location.pincode', 6, 6).matches(/^[1-9][0-9]{5}$/).optional(),
    commonRules.number('specifications.bedrooms', 0, 20).optional(),
    commonRules.number('specifications.bathrooms', 0, 20).optional(),
    commonRules.number('specifications.area.value', 1).optional(),
    commonRules.enum('specifications.area.unit', ['sqft', 'sqm', 'acres', 'bigha']).optional(),
    commonRules.number('specifications.parking', 0, 10).optional(),
    commonRules.enum('specifications.furnished', ['Fully-Furnished', 'Semi-Furnished', 'Unfurnished']).optional(),
    commonRules.array('amenities', 0, 20).optional(),
    commonRules.array('features', 0, 20).optional(),
    commonRules.enum('status', ['available', 'sold', 'rented', 'under-negotiation']).optional(),
    commonRules.boolean('isFeatured').optional()
  ],

  // Review validation
  createReview: [
    commonRules.number('rating', 1, 5),
    commonRules.string('comment', 10, 500),
    body('property').optional().isMongoId().withMessage('Invalid property ID'),
    commonRules.enum('reviewType', ['property', 'general', 'service', 'General Experience', 'Service Quality', 'Property Purchase/Sale', 'Customer Support'])
  ],

  // Blog validation
  createBlog: [
    commonRules.string('title', 3, 200),
    commonRules.string('content', 100),
    commonRules.string('excerpt', 10, 300),
    commonRules.enum('category', ['Home Buying', 'Investment', 'Home Selling', 'Market Trends', 'Tips & Advice', 'Real Estate Tips', 'Market Updates', 'Investment Guide', 'Property News', 'Legal Advice', 'Selling Tips']),
    commonRules.array('tags', 0, 10),
    commonRules.enum('status', ['draft', 'published', 'archived']),
    commonRules.boolean('isFeatured')
  ],

  // Contact validation
  createContact: [
    commonRules.name('name'),
    commonRules.email(),
    commonRules.string('subject', 5, 200),
    commonRules.string('message', 10, 1000),
    commonRules.phone().optional()
  ],

  // Admin validation
  createSubAdmin: [
    commonRules.name('name'),
    commonRules.email(),
    commonRules.phone(),
    body('permissions').isObject().withMessage('Permissions must be an object')
  ],

  // Query validation
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  search: [
    query('q').optional().isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters')
  ]
};

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
      timestamp: new Date().toISOString()
    });
  };
};

// Sanitization middleware
const sanitize = {
  email: (value) => value.toLowerCase().trim(),
  name: (value) => value.trim().replace(/\s+/g, ' '),
  string: (value) => value.trim(),
  phone: (value) => value.replace(/\D/g, '').slice(0, 10)
};

module.exports = {
  commonRules,
  validationSchemas,
  validate,
  sanitize
};
