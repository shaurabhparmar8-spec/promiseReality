const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}${
          info.splat !== undefined ? ` ${JSON.stringify(info.splat)}` : ''
        }`
      )
    ),
  }),
];

// Add file transport in production
if (process.env.NODE_ENV === 'production' || process.env.LOG_FILE) {
  const logDir = path.join(__dirname, '..', 'logs');
  
  // Ensure logs directory exists
  const fs = require('fs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  transports.push(
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf((info) => {
      // Redact sensitive information
      const sanitized = { ...info };
      
      // Remove sensitive fields
      if (sanitized.password) delete sanitized.password;
      if (sanitized.newPassword) delete sanitized.newPassword;
      if (sanitized.currentPassword) delete sanitized.currentPassword;
      if (sanitized.token && sanitized.token.length > 10) {
        sanitized.token = sanitized.token.substring(0, 8) + '...';
      }
      if (sanitized.resetToken) {
        sanitized.resetToken = '***REDACTED***';
      }
      
      return JSON.stringify(sanitized);
    })
  ),
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Enhanced logging methods for security events
logger.security = {
  passwordReset: (action, data) => {
    logger.info(`SECURITY: Password reset ${action}`, {
      action,
      ...data,
      category: 'security',
      subcategory: 'password_reset'
    });
  },
  
  authentication: (action, data) => {
    logger.info(`SECURITY: Authentication ${action}`, {
      action,
      ...data,
      category: 'security',
      subcategory: 'authentication'
    });
  },
  
  rateLimitExceeded: (data) => {
    logger.warn('SECURITY: Rate limit exceeded', {
      ...data,
      category: 'security',
      subcategory: 'rate_limit'
    });
  },
  
  suspiciousActivity: (data) => {
    logger.error('SECURITY: Suspicious activity detected', {
      ...data,
      category: 'security',
      subcategory: 'suspicious_activity'
    });
  },
  
  emailSent: (data) => {
    logger.info('EMAIL: Email sent', {
      ...data,
      category: 'email'
    });
  },
  
  emailFailed: (data) => {
    logger.error('EMAIL: Email sending failed', {
      ...data,
      category: 'email'
    });
  }
};

module.exports = logger;