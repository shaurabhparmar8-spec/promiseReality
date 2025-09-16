const express = require('express');
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { 
  submitContactForm,
  getContactMessages,
  getContactMessageById,
  markMessageAsRead,
  deleteContactMessage,
  getContactStats,
  replyToContact,
  bulkDeleteMessages,
  exportMessages
} = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// Rate limiting for contact form submissions
const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 contact form submissions per hour
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactManagementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit contact management operations
  message: {
    success: false,
    message: 'Too many contact management requests, please try again later.'
  }
});

// Validation rules
const contactFormValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, apostrophes, and hyphens'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  body('propertyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid property ID'),
  
  body('inquiryType')
    .optional()
    .isIn(['general', 'property_inquiry', 'valuation', 'investment', 'legal', 'complaint', 'suggestion'])
    .withMessage('Invalid inquiry type'),
  
  body('preferredContact')
    .optional()
    .isIn(['email', 'phone', 'whatsapp'])
    .withMessage('Invalid preferred contact method'),
  
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid urgency level')
];

const replyValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid message ID'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  body('template')
    .optional()
    .isIn(['acknowledgment', 'follow_up', 'property_info', 'meeting_scheduled', 'resolved', 'custom'])
    .withMessage('Invalid email template')
];

const messageIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid message ID')
];

const messageQueryValidation = [
  query('status')
    .optional()
    .isIn(['unread', 'read', 'replied', 'resolved', 'archived'])
    .withMessage('Invalid status'),
  
  query('inquiryType')
    .optional()
    .isIn(['general', 'property_inquiry', 'valuation', 'investment', 'legal', 'complaint', 'suggestion'])
    .withMessage('Invalid inquiry type'),
  
  query('urgency')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid urgency level'),
  
  query('propertyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid property ID'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'email', 'subject', 'urgency'])
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
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const bulkDeleteValidation = [
  body('messageIds')
    .isArray({ min: 1 })
    .withMessage('Message IDs must be a non-empty array'),
  
  body('messageIds.*')
    .isMongoId()
    .withMessage('Each message ID must be valid')
];

const exportValidation = [
  query('format')
    .optional()
    .isIn(['csv', 'json', 'xlsx'])
    .withMessage('Invalid export format'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date'),
  
  query('status')
    .optional()
    .isIn(['unread', 'read', 'replied', 'resolved', 'archived'])
    .withMessage('Invalid status')
];

// Public routes
router.post('/', 
  contactFormLimiter,
  contactFormValidation,
  catchAsync(submitContactForm)
);

// Protected routes - Admin/Sub-Admin only
router.use(authenticateToken);
router.use(requireRole(['owner', 'admin']));
router.use(requirePermission('viewInquiries'));
router.use(contactManagementLimiter);

router.get('/', 
  messageQueryValidation,
  catchAsync(getContactMessages)
);

router.get('/stats',
  catchAsync(getContactStats)
);

router.get('/export',
  exportValidation,
  catchAsync(exportMessages)
);

router.get('/:id',
  messageIdValidation,
  catchAsync(getContactMessageById)
);

router.patch('/:id/read',
  messageIdValidation,
  catchAsync(markMessageAsRead)
);

router.post('/:id/reply',
  requirePermission('replyToInquiries'),
  replyValidation,
  catchAsync(replyToContact)
);

router.patch('/:id/status',
  messageIdValidation,
  body('status')
    .isIn(['unread', 'read', 'replied', 'resolved', 'archived'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  catchAsync(markMessageAsRead)
);

router.delete('/:id',
  requirePermission('deleteMessages'),
  messageIdValidation,
  catchAsync(deleteContactMessage)
);

router.post('/bulk-delete',
  requirePermission('deleteMessages'),
  bulkDeleteValidation,
  catchAsync(bulkDeleteMessages)
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Contact service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;