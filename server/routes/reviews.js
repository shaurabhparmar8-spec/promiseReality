const express = require('express');
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { 
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleReviewStatus,
  getFeaturedReviews,
  getReviewStats,
  reportReview
} = require('../controllers/reviewController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// Rate limiting for review creation
const reviewCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit review creation to 3 per hour per user
  message: {
    success: false,
    message: 'Too many review submissions, please try again later.'
  }
});

const reviewManagementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit review management operations
  message: {
    success: false,
    message: 'Too many review management requests, please try again later.'
  }
});

// Validation rules
const createReviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  
  body('propertyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid property ID'),
  
  body('serviceType')
    .optional()
    .isIn(['buying', 'selling', 'renting', 'property_management', 'consultation', 'general'])
    .withMessage('Invalid service type'),
  
  body('anonymous')
    .optional()
    .isBoolean()
    .withMessage('Anonymous must be a boolean')
];

const updateReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  
  body('serviceType')
    .optional()
    .isIn(['buying', 'selling', 'renting', 'property_management', 'consultation', 'general'])
    .withMessage('Invalid service type'),
  
  body('anonymous')
    .optional()
    .isBoolean()
    .withMessage('Anonymous must be a boolean')
];

const reviewIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID')
];

const reviewQueryValidation = [
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  query('serviceType')
    .optional()
    .isIn(['buying', 'selling', 'renting', 'property_management', 'consultation', 'general'])
    .withMessage('Invalid service type'),
  
  query('propertyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid property ID'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  query('sortBy')
    .optional()
    .isIn(['rating', 'createdAt', 'helpful'])
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

const reportReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID'),
  
  body('reason')
    .isIn(['spam', 'inappropriate', 'fake', 'off_topic', 'other'])
    .withMessage('Invalid report reason'),
  
  body('details')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Details must not exceed 500 characters')
];

// Public routes
router.get('/', reviewQueryValidation, catchAsync(getAllReviews));
router.get('/featured', catchAsync(getFeaturedReviews));
router.get('/stats', catchAsync(getReviewStats));
router.get('/:id', reviewIdValidation, catchAsync(getReviewById));

// Protected routes - User actions
router.post('/',
  authenticateToken,
  reviewCreationLimiter,
  createReviewValidation,
  catchAsync(createReview)
);

router.put('/:id',
  authenticateToken,
  updateReviewValidation,
  catchAsync(updateReview)
);

router.delete('/:id',
  authenticateToken,
  reviewIdValidation,
  catchAsync(deleteReview)
);

// Report review (authenticated users)
router.post('/:id/report',
  authenticateToken,
  reportReviewValidation,
  catchAsync(reportReview)
);

// Mark review as helpful (authenticated users)
router.post('/:id/helpful',
  authenticateToken,
  reviewIdValidation,
  catchAsync((req, res, next) => {
    req.body.action = 'helpful';
    next();
  }),
  catchAsync(updateReview)
);

// Admin/Sub-Admin routes
router.patch('/:id/status',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('manageReviews'),
  reviewManagementLimiter,
  reviewIdValidation,
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason must not exceed 200 characters'),
  catchAsync(toggleReviewStatus)
);

router.patch('/:id/feature',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('manageReviews'),
  reviewIdValidation,
  body('featured')
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  catchAsync(updateReview)
);

// Admin only - Force delete reviews
router.delete('/:id/force',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('deleteReview'),
  reviewIdValidation,
  catchAsync(deleteReview)
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Reviews service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;