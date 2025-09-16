const express = require('express');
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { 
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  togglePropertyStatus,
  getFeaturedProperties,
  getPropertiesByType,
  searchProperties,
  getPropertyStats
} = require('../controllers/propertyController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const { upload, handleMulterError } = require('../middleware/upload');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// Rate limiting for property creation/updates
const propertyManagementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit property creation/updates to 10 per 15 minutes
  message: {
    success: false,
    message: 'Too many property management requests, please try again later.'
  }
});

// Validation rules
const createPropertyValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('type')
    .isIn(['Villa', 'Apartment', 'Plot', 'Office', 'Commercial', 'Warehouse', 'Farmhouse', 'Other'])
    .withMessage('Invalid property type'),
  
  body('price')
    .isNumeric({ min: 1 })
    .withMessage('Price must be a positive number'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  
  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Bedrooms must be between 0 and 20'),
  
  body('bathrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Bathrooms must be between 0 and 20'),
  
  body('area')
    .optional()
    .isNumeric({ min: 1 })
    .withMessage('Area must be a positive number'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('amenities.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each amenity must be between 1 and 100 characters'),
  
  body('status')
    .optional()
    .isIn(['available', 'sold', 'rented', 'under_offer'])
    .withMessage('Invalid property status'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('coordinates')
    .optional()
    .isObject()
    .withMessage('Coordinates must be an object'),
  
  body('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

const updatePropertyValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid property ID'),
  ...createPropertyValidation.filter(rule => 
    !rule.builder.fields.some(field => ['title', 'description', 'type', 'price', 'location'].includes(field))
  ),
  // Make required fields optional for updates
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('type')
    .optional()
    .isIn(['Villa', 'Apartment', 'Plot', 'Office', 'Commercial', 'Warehouse', 'Farmhouse', 'Other'])
    .withMessage('Invalid property type'),
  
  body('price')
    .optional()
    .isNumeric({ min: 1 })
    .withMessage('Price must be a positive number'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters')
];

const propertyIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid property ID')
];

const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('type')
    .optional()
    .isIn(['Villa', 'Apartment', 'Plot', 'Office', 'Commercial', 'Warehouse', 'Farmhouse', 'Other'])
    .withMessage('Invalid property type'),
  
  query('minPrice')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be between 1 and 100 characters'),
  
  query('bedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Bedrooms must be between 0 and 20'),
  
  query('bathrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Bathrooms must be between 0 and 20'),
  
  query('minArea')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Minimum area must be a positive number'),
  
  query('maxArea')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Maximum area must be a positive number'),
  
  query('status')
    .optional()
    .isIn(['available', 'sold', 'rented', 'under_offer'])
    .withMessage('Invalid property status'),
  
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  query('sortBy')
    .optional()
    .isIn(['price', 'area', 'createdAt', 'title', 'location'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Public routes
router.get('/', searchValidation, catchAsync(getAllProperties));
router.get('/featured', catchAsync(getFeaturedProperties));
router.get('/by-type/:type', 
  param('type').isIn(['Villa', 'Apartment', 'Plot', 'Office', 'Commercial', 'Warehouse', 'Farmhouse', 'Other']),
  catchAsync(getPropertiesByType)
);
router.get('/search', searchValidation, catchAsync(searchProperties));
router.get('/stats', catchAsync(getPropertyStats));
router.get('/:id', propertyIdValidation, catchAsync(getPropertyById));

// Protected routes (Admin/Sub-Admin only)
router.post('/',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('addProperty'),
  propertyManagementLimiter,
  upload.array('images', 10),
  handleMulterError,
  createPropertyValidation,
  catchAsync(createProperty)
);

router.put('/:id',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('editProperty'),
  propertyManagementLimiter,
  upload.array('images', 10),
  handleMulterError,
  updatePropertyValidation,
  catchAsync(updateProperty)
);

router.delete('/:id',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('deleteProperty'),
  propertyIdValidation,
  catchAsync(deleteProperty)
);

router.patch('/:id/toggle-status',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('editProperty'),
  propertyIdValidation,
  body('status')
    .isIn(['available', 'sold', 'rented', 'under_offer'])
    .withMessage('Invalid status'),
  catchAsync(togglePropertyStatus)
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Properties service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;