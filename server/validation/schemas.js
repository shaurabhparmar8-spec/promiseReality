const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Auth validation schemas
const authValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('phone')
      .matches(/^[0-9]{10,15}$/)
      .withMessage('Phone number must be 10-15 digits'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('phone')
      .optional()
      .matches(/^[0-9]{10,15}$/)
      .withMessage('Phone number must be 10-15 digits')
  ]
};

// Property validation schemas
const propertyValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Property title must be between 5 and 100 characters'),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    
    body('type')
      .isIn(['Villa', 'Apartment', 'Plot', 'House', 'Commercial', 'Office', 'Shop'])
      .withMessage('Property type must be one of: Villa, Apartment, Plot, House, Commercial, Office, Shop'),
    
    body('price')
      .isNumeric()
      .isFloat({ min: 1000 })
      .withMessage('Price must be a number greater than 1000'),
    
    body('location')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Location must be between 5 and 200 characters'),
    
    body('bedrooms')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Bedrooms must be between 1 and 10'),
    
    body('bathrooms')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Bathrooms must be between 1 and 10'),
    
    body('area')
      .optional()
      .isNumeric()
      .isFloat({ min: 100 })
      .withMessage('Area must be a number greater than 100 sq ft'),
    
    body('features')
      .optional()
      .isArray()
      .withMessage('Features must be an array'),
    
    body('features.*')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Each feature must be between 2 and 50 characters')
  ],

  update: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid property ID'),
    
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Property title must be between 5 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    
    body('type')
      .optional()
      .isIn(['Villa', 'Apartment', 'Plot', 'House', 'Commercial', 'Office', 'Shop'])
      .withMessage('Property type must be one of: Villa, Apartment, Plot, House, Commercial, Office, Shop'),
    
    body('price')
      .optional()
      .isNumeric()
      .isFloat({ min: 1000 })
      .withMessage('Price must be a number greater than 1000'),
    
    body('location')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Location must be between 5 and 200 characters')
  ],

  getById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid property ID')
  ],

  deleteById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid property ID')
  ],

  search: [
    query('type')
      .optional()
      .isIn(['Villa', 'Apartment', 'Plot', 'House', 'Commercial', 'Office', 'Shop'])
      .withMessage('Property type must be one of: Villa, Apartment, Plot, House, Commercial, Office, Shop'),
    
    query('minPrice')
      .optional()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    
    query('maxPrice')
      .optional()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    
    query('location')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Location search must be between 2 and 100 characters'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ]
};

// Blog validation schemas
const blogValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Blog title must be between 5 and 200 characters'),
    
    body('content')
      .trim()
      .isLength({ min: 50, max: 10000 })
      .withMessage('Blog content must be between 50 and 10000 characters'),
    
    body('excerpt')
      .optional()
      .trim()
      .isLength({ min: 10, max: 300 })
      .withMessage('Blog excerpt must be between 10 and 300 characters'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    
    body('tags.*')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('Each tag must be between 2 and 30 characters'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be either "draft" or "published"')
  ],

  update: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid blog ID'),
    
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Blog title must be between 5 and 200 characters'),
    
    body('content')
      .optional()
      .trim()
      .isLength({ min: 50, max: 10000 })
      .withMessage('Blog content must be between 50 and 10000 characters'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be either "draft" or "published"')
  ],

  getById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid blog ID')
  ],

  deleteById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid blog ID')
  ]
};

// Review validation schemas
const reviewValidation = {
  create: [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Review title must be between 5 and 100 characters'),
    
    body('comment')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Review comment must be between 10 and 1000 characters'),
    
    body('propertyId')
      .optional()
      .custom(isValidObjectId)
      .withMessage('Invalid property ID')
  ],

  update: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid review ID'),
    
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Review title must be between 5 and 100 characters'),
    
    body('comment')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Review comment must be between 10 and 1000 characters')
  ],

  getById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid review ID')
  ],

  deleteById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid review ID')
  ]
};

// Contact validation schemas
const contactValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('phone')
      .optional()
      .matches(/^[0-9]{10,15}$/)
      .withMessage('Phone number must be 10-15 digits'),
    
    body('subject')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Subject must be between 5 and 100 characters'),
    
    body('message')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Message must be between 10 and 1000 characters'),
    
    body('propertyId')
      .optional()
      .custom(isValidObjectId)
      .withMessage('Invalid property ID')
  ],

  updateStatus: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid contact ID'),
    
    body('status')
      .isIn(['pending', 'responded', 'closed'])
      .withMessage('Status must be one of: pending, responded, closed')
  ]
};

// Admin validation schemas
const adminValidation = {
  createSubAdmin: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('phone')
      .matches(/^[0-9]{10,15}$/)
      .withMessage('Phone number must be 10-15 digits'),
    
    body('permissions')
      .isObject()
      .withMessage('Permissions must be an object'),
    
    body('permissions.addProperty')
      .optional()
      .isBoolean()
      .withMessage('addProperty permission must be a boolean'),
    
    body('permissions.editProperty')
      .optional()
      .isBoolean()
      .withMessage('editProperty permission must be a boolean'),
    
    body('permissions.deleteProperty')
      .optional()
      .isBoolean()
      .withMessage('deleteProperty permission must be a boolean'),
    
    body('permissions.writeBlog')
      .optional()
      .isBoolean()
      .withMessage('writeBlog permission must be a boolean'),
    
    body('permissions.deleteBlog')
      .optional()
      .isBoolean()
      .withMessage('deleteBlog permission must be a boolean'),
    
    body('permissions.writeReview')
      .optional()
      .isBoolean()
      .withMessage('writeReview permission must be a boolean'),
    
    body('permissions.deleteReview')
      .optional()
      .isBoolean()
      .withMessage('deleteReview permission must be a boolean'),
    
    body('permissions.deleteUser')
      .optional()
      .isBoolean()
      .withMessage('deleteUser permission must be a boolean'),
    
    body('permissions.viewInquiries')
      .optional()
      .isBoolean()
      .withMessage('viewInquiries permission must be a boolean'),
    
    body('permissions.viewMessages')
      .optional()
      .isBoolean()
      .withMessage('viewMessages permission must be a boolean'),
    
    body('permissions.deleteMessages')
      .optional()
      .isBoolean()
      .withMessage('deleteMessages permission must be a boolean')
  ],

  updateSubAdminPermissions: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid sub-admin ID'),
    
    body('permissions')
      .isObject()
      .withMessage('Permissions must be an object')
  ],

  subAdminById: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid sub-admin ID')
  ]
};

module.exports = {
  authValidation,
  propertyValidation,
  blogValidation,
  reviewValidation,
  contactValidation,
  adminValidation
};