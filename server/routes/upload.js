const express = require('express');
const { param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { 
  upload, 
  handleMulterError 
} = require('../middleware/upload');
const { catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 uploads per windowMs
  message: {
    success: false,
    message: 'Too many upload requests, please try again later.'
  }
});

// Validation rules
const imageIdValidation = [
  param('filename')
    .matches(/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp)$/)
    .withMessage('Invalid filename format')
];

// Apply rate limiting to all upload routes
router.use(uploadLimiter);

// Apply authentication to upload routes
router.use(authenticateToken);
router.use(requireRole(['owner', 'admin', 'user']));

// Simple image upload endpoint
router.post('/images',
  upload.array('images', 10),
  handleMulterError,
  catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: `/uploads/${file.filename}`
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: uploadedFiles
      }
    });
  })
);

// Serve uploaded files with proper headers
router.get('/files/:filename', catchAsync(async (req, res) => {
  const filename = req.params.filename;
  
  // Validate filename
  if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)$/.test(filename)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid filename format'
    });
  }

  const filePath = path.join(__dirname, '..', 'uploads', filename);
  
  try {
    await fs.access(filePath);
    
    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Log file access
    logger.info('File accessed', {
      filename,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });

    res.sendFile(filePath);
  } catch (error) {
    logger.warn('File not found', {
      filename,
      ip: req.ip,
      userId: req.user?.id
    });
    
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
}));

// Delete image
router.delete('/:filename',
  imageIdValidation,
  catchAsync(async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      
      logger.info('File deleted', {
        filename,
        userId: req.user.id
      });
      
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      logger.error('File deletion failed', { 
        error: error.message, 
        filename,
        userId: req.user.id 
      });
      
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  })
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Upload service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
