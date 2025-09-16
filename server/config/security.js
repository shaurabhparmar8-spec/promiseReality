const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Production Security Configuration
const productionSecurityConfig = {
  // Helmet configuration for production
  helmet: {
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
        manifestSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
  },

  // CORS configuration for production
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // General rate limiting
  generalRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // API rate limiting
  apiRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 API requests per windowMs
    message: {
      success: false,
      message: 'Too many API requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
};

// Development Security Configuration
const developmentSecurityConfig = {
  helmet: {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  },
  cors: {
    origin: true,
    credentials: true,
  },
  generalRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // More lenient for development
    skip: () => false,
  }),
  apiRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // More lenient for development
    skip: () => false,
  }),
};

module.exports = {
  getSecurityConfig: () => {
    return process.env.NODE_ENV === 'production' 
      ? productionSecurityConfig 
      : developmentSecurityConfig;
  },
  productionSecurityConfig,
  developmentSecurityConfig,
};