const express = require('express');
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { 
  createSubAdmin,
  updateSubAdminPermissions,
  getSubAdmins,
  getSubAdminById,
  deleteSubAdmin,
  toggleSubAdminStatus,
  getDashboardStats,
  getSystemHealth,
  getAuditLogs,
  manageUsers,
  getReports
} = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// Rate limiting for admin routes
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many admin requests, please try again later.'
  }
});

const createSubAdminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit creating sub-admins to 5 per hour
  message: {
    success: false,
    message: 'Too many sub-admin creation attempts, please try again later.'
  }
});

// Apply rate limiting to all admin routes
router.use(adminLimiter);

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const createSubAdminValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
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
  
  body('permissions.writeReview')
    .optional()
    .isBoolean()
    .withMessage('writeReview permission must be a boolean'),
  
  body('permissions.deleteReview')
    .optional()
    .isBoolean()
    .withMessage('deleteReview permission must be a boolean'),
  
  body('permissions.writeBlog')
    .optional()
    .isBoolean()
    .withMessage('writeBlog permission must be a boolean'),
  
  body('permissions.deleteBlog')
    .optional()
    .isBoolean()
    .withMessage('deleteBlog permission must be a boolean'),
  
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
];

const updatePermissionsValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid sub-admin ID'),
  
  body('permissions')
    .isObject()
    .withMessage('Permissions must be an object')
];

const subAdminIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid sub-admin ID')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Sub-Admin Management Routes (Only Main Admin)
router.post('/sub-admins', 
  requireRole(['mainAdmin']),
  createSubAdminLimiter,
  createSubAdminValidation,
  catchAsync(createSubAdmin)
);

router.get('/sub-admins', 
  requireRole(['mainAdmin']),
  paginationValidation,
  catchAsync(getSubAdmins)
);

router.get('/sub-admins/:id',
  requireRole(['mainAdmin']),
  subAdminIdValidation,
  catchAsync(getSubAdminById)
);

router.put('/sub-admins/:id/permissions',
  requireRole(['mainAdmin']),
  updatePermissionsValidation,
  catchAsync(updateSubAdminPermissions)
);

router.delete('/sub-admins/:id',
  requireRole(['mainAdmin']),
  subAdminIdValidation,
  catchAsync(deleteSubAdmin)
);

router.patch('/sub-admins/:id/toggle-status',
  requireRole(['mainAdmin']),
  subAdminIdValidation,
  catchAsync(toggleSubAdminStatus)
);

// Dashboard and Analytics (Main Admin + Sub-Admins with view permissions)
router.get('/dashboard/stats',
  requireRole(['owner', 'admin']),
  catchAsync(getDashboardStats)
);

router.get('/system/health',
  requireRole(['mainAdmin']),
  catchAsync(getSystemHealth)
);

router.get('/audit-logs',
  requireRole(['mainAdmin']),
  paginationValidation,
  catchAsync(getAuditLogs)
);

// User Management (Main Admin + Sub-Admins with user management permissions)
router.get('/users',
  requireRole(['owner', 'admin']),
  requirePermission('viewUsers'),
  paginationValidation,
  catchAsync(manageUsers)
);

router.delete('/users/:id',
  requireRole(['mainAdmin', 'subAdmin']),
  requirePermission('deleteUser'),
  param('id').isMongoId().withMessage('Invalid user ID'),
  catchAsync(manageUsers)
);

// Reports (Main Admin only)
router.get('/reports',
  requireRole(['mainAdmin']),
  query('type')
    .optional()
    .isIn(['users', 'properties', 'reviews', 'blogs', 'inquiries'])
    .withMessage('Invalid report type'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date'),
  catchAsync(getReports)
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;