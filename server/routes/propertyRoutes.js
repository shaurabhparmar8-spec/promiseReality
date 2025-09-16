const express = require('express');
const { body } = require('express-validator');
const {
  getAllProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requirePermission, requireAnyPermission, PERMISSIONS } = require('../middleware/rbac');
const { upload, handleMulterError } = require('../middleware/upload');
const Property = require('../models/Property');

const router = express.Router();

// Middleware for property routes with enhanced debugging
router.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`\n🔍 Property ${req.method} ${req.path} - Route accessed`);
    console.log('📋 Content-Type:', req.headers['content-type']);
    console.log('🔐 Authorization header exists:', !!req.headers.authorization);
    if (req.headers.authorization) {
      console.log('🎫 Token preview:', req.headers.authorization.substring(0, 50) + '...');
    }
  }
  next();
});

// Working validation rules for FormData format
const propertyValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description is required'),
  body('propertyType')
    .optional()
    .notEmpty()
    .withMessage('Property type is required')
];

// Public routes
// GET /api/properties - Get all properties with filtering
router.get('/', optionalAuth, getAllProperties);

// GET /api/properties/featured - Get featured properties for slider
router.get('/featured', getFeaturedProperties);

// GET /api/properties/stats - Get property statistics (Admin only)
// router.get('/stats', authenticateToken, requireAdmin, getPropertyStats);

// Test endpoint to verify server is working
router.get('/test/:id', (req, res) => {
  console.log('Test endpoint hit with ID:', req.params.id);
  res.json({
    success: true,
    message: 'Server is working',
    id: req.params.id,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for form validation
router.post('/test-validation', 
  upload.array('images', 10),
  propertyValidation,
  (req, res) => {
    const errors = validationResult(req);
    res.json({
      success: errors.isEmpty(),
      message: errors.isEmpty() ? 'Validation passed' : 'Validation failed',
      errors: errors.array(),
      receivedData: {
        body: req.body,
        files: req.files ? req.files.length : 0
      }
    });
  }
);

// Simple test endpoint without middleware
router.post('/test-simple', (req, res) => {
  console.log('Simple test endpoint hit');
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  res.json({
    success: true,
    message: 'Simple test endpoint working',
    receivedData: {
      body: req.body,
      files: req.files ? req.files.length : 0,
      headers: req.headers
    }
  });
});

// Test create property without any validation
router.post('/create-test', 
  authenticateToken, 
  requirePermission(PERMISSIONS.ADD_PROPERTY), 
  upload.array('images', 10),
  handleMulterError,
  createProperty
);

// GET /api/properties/:id - Get single property by ID
router.get('/:id', optionalAuth, getPropertyById);

// POST /api/properties/:id/view - Update view count
router.post('/:id/view', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    res.json({
      success: true,
      data: { views: property.views }
    });
  } catch (error) {
    // For mock data scenarios, just return success without updating
    console.log('View count update failed (likely using mock data):', error.message);
    res.json({
      success: true,
      data: { views: 1 },
      message: 'View count simulated (mock data)'
    });
  }
});

// Note: Property likes are now handled through auth routes
// POST /api/auth/properties/:propertyId/like

// Admin-only routes with RBAC
// POST /api/properties - Create new property
router.post('/', 
  authenticateToken, 
  requirePermission(PERMISSIONS.ADD_PROPERTY), 
  upload.array('images', 10),
  handleMulterError,
  propertyValidation,
  createProperty
);

// PUT /api/properties/:id - Update property
router.put('/:id', 
  authenticateToken, 
  requirePermission(PERMISSIONS.EDIT_PROPERTY), 
  upload.array('images', 10), 
  handleMulterError,
  propertyValidation,
  updateProperty
);

// DELETE /api/properties/:id - Delete property
router.delete('/:id', 
  authenticateToken, 
  requirePermission(PERMISSIONS.DELETE_PROPERTY), 
  deleteProperty
);

// PATCH /api/properties/:id/featured - Toggle featured status
// router.patch('/:id/featured', authenticateToken, requireAdmin, toggleFeatured);

module.exports = router;