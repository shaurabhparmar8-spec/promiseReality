const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const crypto = require('crypto');
const productionEmailService = require('../services/productionEmailService');
const passwordValidationService = require('../services/passwordValidationService');
const logger = require('../utils/logger');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Helper function to mask sensitive data for logging
const maskSensitiveData = (data) => {
  const masked = { ...data };
  if (masked.email) {
    const [local, domain] = masked.email.split('@');
    masked.email = `${local[0]}***@${domain}`;
  }
  if (masked.phone) {
    masked.phone = `***${masked.phone.slice(-4)}`;
  }
  delete masked.password;
  delete masked.newPassword;
  delete masked.confirmPassword;
  return masked;
};

// Enhanced forgot password with production-grade security
const forgotPassword = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Forgot password validation failed', {
        ip: req.ip,
        errors: errors.array(),
        userAgent: req.get('User-Agent')
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent');

    // Log the attempt (without revealing if email exists)
    logger.info('Password reset requested', {
      ip: clientIP,
      email: maskSensitiveData({ email: normalizedEmail }).email,
      userAgent
    });

    let user;
    try {
      // Find user by email
      user = await User.findOne({ 
        email: normalizedEmail,
        isActive: true 
      });
    } catch (dbError) {
      logger.error('Database error during password reset lookup', {
        error: dbError.message,
        ip: clientIP
      });
      
      // Still return success to prevent enumeration
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Always return the same response to prevent email enumeration
    const genericResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    };

    if (!user) {
      // Log potential enumeration attempt
      logger.warn('Password reset attempted for non-existent email', {
        ip: clientIP,
        email: maskSensitiveData({ email: normalizedEmail }).email,
        userAgent
      });
      
      // Add artificial delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      return res.json(genericResponse);
    }

    // Check if user has too many recent reset requests
    const now = new Date();
    const recentResetWindow = 15 * 60 * 1000; // 15 minutes
    
    if (user.lastResetRequestAt && 
        (now - user.lastResetRequestAt) < recentResetWindow && 
        user.failedResetRequests >= 3) {
      
      logger.warn('Too many password reset attempts for user', {
        userId: user._id,
        ip: clientIP,
        failedAttempts: user.failedResetRequests,
        lastAttempt: user.lastResetRequestAt
      });
      
      // Still return success to prevent enumeration
      return res.json(genericResponse);
    }

    try {
      // Generate secure reset token
      const resetToken = user.generateResetToken();
      user.resetRequestIP = clientIP;
      user.lastResetRequestAt = now;
      user.failedResetRequests = (user.failedResetRequests || 0) + 1;
      
      // Save without full schema validation to avoid legacy validation issues
      await user.save({ validateBeforeSave: false });

      // Create reset URL
      const resetURL = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      
      // Generate email content
      const emailContent = productionEmailService.generatePasswordResetEmail(
        user.name,
        resetURL,
        parseInt(process.env.RESET_TOKEN_TTL_MINUTES) || 15
      );

      // In development, return reset link directly to avoid email provider issues
      if (process.env.NODE_ENV === 'development') {
        logger.info('Development mode: returning password reset link directly to client', {
          userId: user._id,
        });
        // Fire-and-forget email attempt (ignored if it fails)
        productionEmailService
          .sendEmail(
            user.email,
            'Password Reset Request - Promise Realty',
            emailContent.html,
            emailContent.text
          )
          .catch(err => {
            logger.warn('Dev mode: email send failed (ignored)', { error: err.message });
          });

        return res.json({
          success: true,
          message: 'Password reset link generated successfully. Use the link below:',
          resetLink: resetURL,
          instructions: 'Click the link or copy it to reset your password. Link expires in 15 minutes.'
        });
      }

      // Production: send email and return generic response
      const emailResult = await productionEmailService.sendEmail(
        user.email,
        'Password Reset Request - Promise Realty',
        emailContent.html,
        emailContent.text
      );

      // Log successful email send (without sensitive data)
      logger.info('Password reset email sent', {
        userId: user._id,
        email: maskSensitiveData({ email: user.email }).email,
        provider: emailResult.provider,
        messageId: emailResult.messageId
      });

      return res.json(genericResponse);

    } catch (error) {
      logger.error('Error during password reset process', {
        userId: user?._id,
        error: error.message,
        stack: error.stack,
        ip: clientIP
      });

      // In production, still return success to prevent information leakage
      if (process.env.NODE_ENV === 'production') {
        return res.json(genericResponse);
      }

      return res.status(500).json({
        success: false,
        message: 'Server error during password reset request',
        error: error.message
      });
    }

  } catch (error) {
    logger.error('Unexpected error in forgotPassword', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    // Always return generic success in production
    if (process.env.NODE_ENV === 'production') {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// Enhanced reset password with production-grade security
const resetPassword = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Reset password validation failed', {
        ip: req.ip,
        errors: errors.array(),
        userAgent: req.get('User-Agent')
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.params;
    const { newPassword } = req.body;
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent');

    if (!token) {
      logger.warn('Reset password attempted without token', { ip: clientIP });
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Validate new password strength
    const passwordValidation = passwordValidationService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      logger.info('Reset password failed - weak password', {
        ip: clientIP,
        feedback: passwordValidation.feedback
      });
      
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.feedback,
        requirements: passwordValidation.requirements
      });
    }

    let user;
    try {
      // Find user with matching token hash and valid/unused token
      const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
      user = await User.findOne({
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { $gt: new Date() },
        resetTokenUsed: { $ne: true },
        isActive: true
      }).select('+resetTokenHash');

      if (!user) {
        logger.warn('Invalid or expired reset token used', {
          ip: clientIP,
          tokenProvided: !!token,
          userFound: !!user,
          userAgent
        });
        
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

    } catch (dbError) {
      logger.error('Database error during password reset', {
        error: dbError.message,
        ip: clientIP
      });
      
      return res.status(500).json({
        success: false,
        message: 'Server error during password reset'
      });
    }

    try {
      // Update password and clear reset token
      user.passwordHash = await user.hashPassword(newPassword);
      user.clearResetToken();
      
      // Clear failed reset attempts
      user.failedResetRequests = 0;
      
      // Invalidate all existing sessions (optional security measure)
      if (process.env.INVALIDATE_SESSIONS_ON_RESET === 'true') {
        user.clearAllSessions();
      }
      
      await user.save();

      // Log successful password reset
      logger.info('Password reset successful', {
        userId: user._id,
        email: maskSensitiveData({ email: user.email }).email,
        ip: clientIP,
        sessionsCleared: process.env.INVALIDATE_SESSIONS_ON_RESET === 'true'
      });

      // Send confirmation email
      try {
        const confirmationEmail = productionEmailService.generatePasswordResetSuccessEmail(user.name);
        await productionEmailService.sendEmail(
          user.email,
          'Password Reset Successful - Promise Realty',
          confirmationEmail.html,
          confirmationEmail.text
        );
      } catch (emailError) {
        // Don't fail the reset if confirmation email fails
        logger.warn('Failed to send password reset confirmation email', {
          userId: user._id,
          error: emailError.message
        });
      }

      return res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.'
      });

    } catch (error) {
      logger.error('Error updating password', {
        userId: user._id,
        error: error.message,
        ip: clientIP
      });

      return res.status(500).json({
        success: false,
        message: 'Server error during password update'
      });
    }

  } catch (error) {
    logger.error('Unexpected error in resetPassword', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// Validate reset token endpoint (optional - for pre-validation)
const validateResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    let user;
    try {
      user = await User.findOne({
        resetTokenExpiresAt: { $gt: new Date() },
        resetTokenUsed: { $ne: true },
        isActive: true
      }).select('+resetTokenHash');

      const isValid = !!(user && user.validateResetToken(token));
      
      // Don't reveal user information, just token validity
      return res.json({
        success: true,
        valid: isValid,
        message: isValid ? 'Token is valid' : 'Token is invalid or expired'
      });

    } catch (dbError) {
      logger.error('Database error during token validation', {
        error: dbError.message,
        ip: req.ip
      });
      
      return res.json({
        success: true,
        valid: false,
        message: 'Token validation failed'
      });
    }

  } catch (error) {
    logger.error('Error in validateResetToken', {
      error: error.message,
      ip: req.ip
    });

    return res.json({
      success: true,
      valid: false,
      message: 'Token validation failed'
    });
  }
};

// Enhanced change password (for authenticated users)
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      logger.warn('Change password failed - invalid current password', {
        userId,
        ip: req.ip
      });
      
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
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
        message: 'New password does not meet security requirements',
        errors: passwordValidation.feedback,
        requirements: passwordValidation.requirements
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.passwordHash = await user.hashPassword(newPassword);
    user.lastPasswordResetAt = new Date();
    
    // Optionally invalidate other sessions
    if (process.env.INVALIDATE_SESSIONS_ON_CHANGE === 'true') {
      user.clearAllSessions();
    }
    
    await user.save();

    logger.info('Password changed successfully', {
      userId,
      ip: req.ip
    });

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Error in changePassword', {
      error: error.message,
      userId: req.user?._id,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  validateResetToken,
  changePassword
};