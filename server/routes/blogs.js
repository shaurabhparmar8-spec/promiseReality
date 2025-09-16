const express = require('express');
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { 
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  getFeaturedBlogs,
  getBlogsByCategory,
  getBlogsByTag,
  searchBlogs,
  getBlogStats,
  likeBlog,
  unlikeBlog,
  getBlogComments,
  addBlogComment,
  deleteBlogComment
} = require('../controllers/blogController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const { upload, handleMulterError } = require('../middleware/upload');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// Rate limiting
const blogManagementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit blog creation/updates to 10 per 15 minutes
  message: {
    success: false,
    message: 'Too many blog management requests, please try again later.'
  }
});

const blogInteractionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit interactions (likes, comments)
  message: {
    success: false,
    message: 'Too many blog interactions, please try again later.'
  }
});

// Validation rules
const createBlogValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 100, max: 50000 })
    .withMessage('Content must be between 100 and 50000 characters'),
  
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt must not exceed 300 characters'),
  
  body('category')
    .isIn(['Tips & Advice', 'Market Trends', 'Investment Guide', 'Legal Matters', 'Property News', 'Company Updates', 'Success Stories'])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title must not exceed 60 characters'),
  
  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description must not exceed 160 characters'),
  
  body('readingTime')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Reading time must be between 1 and 60 minutes')
];

const updateBlogValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid blog ID'),
  ...createBlogValidation.filter(rule => 
    !rule.builder.fields.some(field => ['title', 'content'].includes(field))
  ),
  // Make required fields optional for updates
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 100, max: 50000 })
    .withMessage('Content must be between 100 and 50000 characters')
];

const blogIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid blog ID')
];

const slugValidation = [
  param('slug')
    .isSlug()
    .withMessage('Invalid blog slug')
];

const blogQueryValidation = [
  query('category')
    .optional()
    .isIn(['Tips & Advice', 'Market Trends', 'Investment Guide', 'Legal Matters', 'Property News', 'Company Updates', 'Success Stories'])
    .withMessage('Invalid category'),
  
  query('tag')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag must be between 1 and 50 characters'),
  
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  query('author')
    .optional()
    .isMongoId()
    .withMessage('Invalid author ID'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'views', 'likes'])
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

const commentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid blog ID'),
  
  body('content')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Comment must be between 3 and 1000 characters'),
  
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

// Public routes
router.get('/', blogQueryValidation, catchAsync(getAllBlogs));
router.get('/featured', catchAsync(getFeaturedBlogs));
router.get('/category/:category', 
  param('category').isIn(['Tips & Advice', 'Market Trends', 'Investment Guide', 'Legal Matters', 'Property News', 'Company Updates', 'Success Stories']),
  blogQueryValidation,
  catchAsync(getBlogsByCategory)
);
router.get('/tag/:tag', 
  param('tag').trim().isLength({ min: 1, max: 50 }),
  blogQueryValidation,
  catchAsync(getBlogsByTag)
);
router.get('/search', blogQueryValidation, catchAsync(searchBlogs));
router.get('/stats', catchAsync(getBlogStats));
router.get('/slug/:slug', slugValidation, catchAsync(getBlogBySlug));
router.get('/:id', blogIdValidation, catchAsync(getBlogById));

// Comments routes
router.get('/:id/comments', 
  blogIdValidation,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  catchAsync(getBlogComments)
);

// Protected routes - User interactions
router.post('/:id/like',
  authenticateToken,
  blogInteractionLimiter,
  blogIdValidation,
  catchAsync(likeBlog)
);

router.delete('/:id/like',
  authenticateToken,
  blogInteractionLimiter,
  blogIdValidation,
  catchAsync(unlikeBlog)
);

router.post('/:id/comments',
  authenticateToken,
  blogInteractionLimiter,
  commentValidation,
  catchAsync(addBlogComment)
);

router.delete('/:id/comments/:commentId',
  authenticateToken,
  param('id').isMongoId(),
  param('commentId').isMongoId(),
  catchAsync(deleteBlogComment)
);

// Admin/Sub-Admin routes
router.post('/',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('writeBlog'),
  blogManagementLimiter,
  upload.array('images', 10),
  handleMulterError,
  createBlogValidation,
  catchAsync(createBlog)
);

router.put('/:id',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('writeBlog'),
  blogManagementLimiter,
  upload.array('images', 10),
  handleMulterError,
  updateBlogValidation,
  catchAsync(updateBlog)
);

router.delete('/:id',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('deleteBlog'),
  blogIdValidation,
  catchAsync(deleteBlog)
);

router.patch('/:id/status',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('writeBlog'),
  blogIdValidation,
  body('status')
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  catchAsync(toggleBlogStatus)
);

router.patch('/:id/feature',
  authenticateToken,
  requireRole(['owner', 'admin']),
  requirePermission('writeBlog'),
  blogIdValidation,
  body('featured')
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  catchAsync(updateBlog)
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Blogs service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;