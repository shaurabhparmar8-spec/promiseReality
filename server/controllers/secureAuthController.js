const { validationResult } = require('express-validator');
const User = require('../models/User');
const emailService = require('../services/emailService');
const rateLimitService = require('../services/rateLimitService');
const passwordValidationService = require('../services/passwordValidationService');
const logger = require('../utils/logger');
const crypto = require('crypto');

class SecureAuthController {
  // Secure forgot password implementation
  async forgotPassword(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
          errors: errors.array()
        });
      }

      const { email } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'Unknown';

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Check rate limits
      const rateLimitResult = await rateLimitService.checkPasswordResetRateLimit(ipAddress, normalizedEmail);
      
      if (!rateLimitResult.allowed) {
        // Log rate limit violation
        logger.security.rateLimitExceeded({
          ipAddress,
          email: normalizedEmail,
          endpoint: '/auth/forgot-password',
          count: Math.max(rateLimitResult.ipLimit.count, rateLimitResult.emailLimit.count)
        });

        // Apply progressive backoff
        const backoffDelay = await rateLimitService.getBackoffDelay(ipAddress);
        
        // Always return generic success message to prevent enumeration
        setTimeout(() => {
          res.status(200).json({
            success: true,
            message: 'If that email exists in our system, we have sent a password reset link to that email address. Please check your email and follow the instructions.'
          });
        }, backoffDelay);
        
        return;
      }

      // Record the attempt
      await rateLimitService.recordPasswordResetAttempt(ipAddress, normalizedEmail);

      // Log security event
      logger.security.passwordResetRequested({
        email: normalizedEmail,
        ipAddress,
        userAgent
      });

      // Find user (but don't reveal if they exist)
      let user;
      try {
        user = await User.findOne({ email: normalizedEmail }).select('+resetTokenHash +resetTokenExpiresAt +resetTokenUsed');
      } catch (error) {
        logger.error('Database error during password reset:', error);
      }

      // Always return success message regardless of whether user exists
      const genericResponse = {
        success: true,
        message: 'If that email exists in our system, we have sent a password reset link to that email address. Please check your email and follow the instructions.'
      };

      // If user exists, process the reset
      if (user && user.isActive) {
        try {
          // Generate secure token
          const resetToken = user.generateResetToken();
          
          // Update user with reset token info
          user.resetRequestIP = ipAddress;
          user.lastResetRequestAt = new Date();
          
          await user.save();

          // Send email (don't wait for it to complete)
          emailService.sendPasswordResetEmail(normalizedEmail, resetToken, userAgent, ipAddress)
            .then(result => {
              if (result.success) {
                logger.info('Password reset email sent successfully', {
                  email: normalizedEmail,
                  messageId: result.messageId
                });
              } else {
                logger.error('Password reset email failed to send', {
                  email: normalizedEmail,
                  error: result.error
                });
              }
            })
            .catch(error => {
              logger.error('Password reset email error:', error);
            });

        } catch (error) {
          logger.error('Error processing password reset:', error);
          // Still return success to prevent enumeration
        }
      } else {
        // User doesn't exist or is inactive
        // Add artificial delay to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        
        if (user && !user.isActive) {
          logger.security.passwordResetFailed({
            email: normalizedEmail,
            ipAddress,
            userAgent,
            reason: 'Account inactive'
          });
        }
      }

      // Always return the same response
      res.status(200).json(genericResponse);

    } catch (error) {
      logger.error('Forgot password error:', error);
      
      // Return generic success even on server error to prevent enumeration
      res.status(200).json({
        success: true,
        message: 'If that email exists in our system, we have sent a password reset link to that email address. Please check your email and follow the instructions.'
      });
    }
  }

  // Validate reset token (optional endpoint)
  async validateResetToken(req, res) {
    try {
      const { token } = req.query;
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Reset token is required'
        });
      }

      // Find user with valid token
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await User.findOne({
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { $gt: new Date() },
        resetTokenUsed: false,
        isActive: true
      }).select('email resetTokenExpiresAt');

      if (!user) {
        logger.security.passwordResetFailed({
          email: 'unknown',
          ipAddress,
          userAgent: req.get('User-Agent'),
          reason: 'Invalid or expired token'
        });

        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token. Please request a new password reset.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        expiresAt: user.resetTokenExpiresAt
      });

    } catch (error) {
      logger.error('Token validation error:', error);
      
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }
  }

  // Reset password with token
  async resetPassword(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { token, newPassword } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'Unknown';

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required'
        });
      }

      // Find user with valid token
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await User.findOne({
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { $gt: new Date() },
        resetTokenUsed: false,
        isActive: true
      }).select('+resetTokenHash +resetTokenExpiresAt +resetTokenUsed +passwordHash');

      if (!user) {
        logger.security.passwordResetFailed({
          email: 'unknown',
          ipAddress,
          userAgent,
          reason: 'Invalid or expired token'
        });

        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token. Please request a new password reset.'
        });
      }

      // Validate new password
      const passwordValidation = passwordValidationService.validatePassword(newPassword, {
        name: user.name,
        email: user.email,
        phone: user.phone
      });

      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet security requirements',
          errors: passwordValidation.feedback,
          requirements: passwordValidation.requirements
        });
      }

      try {
        // Update password
        user.passwordHash = newPassword; // Will be hashed by pre-save hook
        
        // Clear reset token
        user.clearResetToken();
        
        // Update security fields
        user.resetRequestIP = ipAddress;
        
        // Optional: Clear all active sessions to force re-login
        if (process.env.CLEAR_SESSIONS_ON_RESET === 'true') {
          user.clearAllSessions();
        }

        await user.save();

        // Log successful reset
        logger.security.passwordResetCompleted({
          email: user.email,
          ipAddress,
          userAgent
        });

        res.status(200).json({
          success: true,
          message: 'Password has been reset successfully. You can now log in with your new password.',
          passwordStrength: {
            score: passwordValidation.score,
            text: passwordValidationService.getPasswordStrengthText(passwordValidation.score)
          }
        });

      } catch (error) {
        logger.error('Error saving new password:', error);
        
        res.status(500).json({
          success: false,
          message: 'An error occurred while resetting your password. Please try again.'
        });
      }

    } catch (error) {
      logger.error('Reset password error:', error);
      
      res.status(500).json({
        success: false,
        message: 'An error occurred while resetting your password. Please try again.'
      });
    }
  }

  // Enhanced login with security features
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'Unknown';

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // Find user
      const user = await User.findOne({
        $or: [
          { email: normalizedEmail },
          { phone: email } // Allow login with phone number
        ]
      }).select('+passwordHash +password');

      let loginSuccess = false;

      if (user && user.isActive) {
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        
        if (isPasswordValid) {
          loginSuccess = true;
          
          // Generate JWT token
          const token = jwt.sign(
            { 
              userId: user._id, 
              email: user.email,
              role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
          );

          // Add session tracking
          const sessionId = crypto.randomBytes(16).toString('hex');
          user.addSession(sessionId, userAgent, ipAddress);
          await user.save();

          // Log successful login
          logger.security.loginAttempt({
            email: user.email,
            ipAddress,
            userAgent,
            success: true
          });

          res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              lastPasswordResetAt: user.lastPasswordResetAt
            }
          });
          return;
        }
      }

      // Log failed login attempt
      logger.security.loginAttempt({
        email: normalizedEmail,
        ipAddress,
        userAgent,
        success: false
      });

      // Generic error message to prevent enumeration
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });

    } catch (error) {
      logger.error('Login error:', error);
      
      res.status(500).json({
        success: false,
        message: 'An error occurred during login'
      });
    }
  }

  // Password strength checker endpoint
  async checkPasswordStrength(req, res) {
    try {
      const { password, userInfo = {} } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }

      const validation = passwordValidationService.validatePassword(password, userInfo);

      res.status(200).json({
        success: true,
        validation: {
          isValid: validation.isValid,
          score: validation.score,
          strength: passwordValidationService.getPasswordStrengthText(validation.score),
          color: passwordValidationService.getPasswordStrengthColor(validation.score),
          feedback: validation.feedback,
          requirements: validation.requirements
        }
      });

    } catch (error) {
      logger.error('Password strength check error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error checking password strength'
      });
    }
  }
}

module.exports = new SecureAuthController();