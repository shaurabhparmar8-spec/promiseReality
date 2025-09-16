
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();

// Import middleware
const { globalErrorHandler, AppError } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const reviewRoutes = require('./routes/reviews');
const blogRoutes = require('./routes/blogs');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/upload');

// Security Configuration
const securityConfig = {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  helmet: {
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
  }
};

// Rate limiting
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15
  },
  standardHeaders: true,
  legacyHeaders: false
});

const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many API requests from this IP, please try again later.',
    retryAfter: 15
  }
});

// Security Middleware
app.use(helmet(securityConfig.helmet));

// Rate limiting
app.use(generalRateLimit);
app.use('/api', apiRateLimit);

// CORS Middleware
app.use(cors(securityConfig.cors));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Promise Realty API Server Running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Promise Realty API Server Running!',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin', 
      properties: '/api/properties',
      reviews: '/api/reviews',
      blogs: '/api/blogs',
      contact: '/api/contact',
      upload: '/api/upload'
    }
  });
});

// Handle undefined routes
app.all('/api/*', (req, res, next) => {
  const error = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(error);
});

// Serve React app for all other routes (client-side routing support)
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;