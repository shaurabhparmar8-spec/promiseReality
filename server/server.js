const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import configurations and middleware
const { connectDB } = require('./config/db');
const { getSecurityConfig } = require('./config/security');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Get security configuration
const securityConfig = getSecurityConfig();

// Trust proxy (important for production deployments)
app.set('trust proxy', 1);

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  // Create logs directory if it doesn't exist
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  app.use(morgan('combined', {
    stream: fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' })
  }));
} else {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet(securityConfig.helmet));

// Rate limiting
app.use(securityConfig.generalRateLimit);
app.use('/api', securityConfig.apiRateLimit);

// CORS configuration
app.use(cors(securityConfig.cors));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
  etag: true,
  index: false
}));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: require('./package.json').version
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/upload', require('./routes/upload'));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  
  // Serve static files
  app.use(express.static(clientBuildPath, {
    maxAge: '1y',
    etag: true
  }));

  // Handle React Router
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'API endpoint not found'
      });
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Promise Realty API Server Running!',
      version: require('./package.json').version,
      environment: process.env.NODE_ENV
    });
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

const PORT = process.env.PORT || 5000;

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 API URL: http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error:', error);
      }
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;