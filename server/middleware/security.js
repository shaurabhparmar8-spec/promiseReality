const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Enhanced security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting for password reset endpoints
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security.rateLimitExceeded({
      ipAddress: req.ip,
      endpoint: req.path,
      count: req.rateLimit.current
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Login rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per window per IP
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Progressive delay for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per window without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  headers: true
});

// Input validation middleware
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Please provide a valid email address'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }
    next();
  }
];

const validatePasswordReset = [
  body('token')
    .isLength({ min: 64, max: 64 })
    .isHexadecimal()
    .withMessage('Invalid reset token format'),
  
  body('newPassword')
    .isLength({ min: 10, max: 128 })
    .withMessage('Password must be between 10 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateLogin = [
  body('email')
    .notEmpty()
    .isLength({ max: 254 })
    .withMessage('Email or phone is required'),
  
  body('password')
    .notEmpty()
    .isLength({ max: 128 })
    .withMessage('Password is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: errors.array()
      });
    }
    next();
  }
];

// IP whitelist/blacklist middleware
const ipFilter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check if IP is blacklisted
  const blacklistedIPs = (process.env.BLACKLISTED_IPS || '').split(',').filter(Boolean);
  if (blacklistedIPs.includes(clientIP)) {
    logger.security.suspiciousActivity({
      ipAddress: clientIP,
      userAgent: req.get('User-Agent'),
      activity: 'Blacklisted IP access attempt'
    });
    
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // Check if IP is whitelisted (if whitelist is configured)
  const whitelistedIPs = (process.env.WHITELISTED_IPS || '').split(',').filter(Boolean);
  if (whitelistedIPs.length > 0 && !whitelistedIPs.includes(clientIP)) {
    logger.security.suspiciousActivity({
      ipAddress: clientIP,
      userAgent: req.get('User-Agent'),
      activity: 'Non-whitelisted IP access attempt'
    });
    
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Suspicious activity detection
const suspiciousActivityDetector = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  // Detect suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && req.path.includes('/auth/')) {
    logger.security.suspiciousActivity({
      ipAddress,
      userAgent,
      activity: 'Suspicious user agent on auth endpoint',
      endpoint: req.path
    });
    
    // Add extra delay for suspicious requests
    setTimeout(() => next(), 2000);
  } else {
    next();
  }
};

// HTTPS redirect middleware
const httpsRedirect = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
};

module.exports = {
  securityHeaders,
  passwordResetLimiter,
  apiLimiter,
  loginLimiter,
  speedLimiter,
  validateEmail,
  validatePasswordReset,
  validateLogin,
  ipFilter,
  requestLogger,
  suspiciousActivityDetector,
  httpsRedirect
};