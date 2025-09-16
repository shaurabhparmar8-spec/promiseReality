const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const emailService = require('../services/enhancedEmailService');
const { httpStatus } = require('../utils/response');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
      issuer: 'promise-realty-api',
      audience: 'promise-realty-client'
    }
  );

  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
      issuer: 'promise-realty-api',
      audience: 'promise-realty-client'
    }
  );

  return { accessToken, refreshToken };
};

// Register new user
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return httpStatus.BAD_REQUEST(res, 'Validation failed', errors.array());
    }

    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone';
      return httpStatus.BAD_REQUEST(res, `User with this ${field} already exists`);
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      phone,
      password, // Will be hashed by the pre-save hook
      role: 'user'
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Add session
    const sessionId = crypto.randomUUID();
    user.addSession(sessionId, req.get('User-Agent'), req.ip);
    await user.save();

    // Log registration
    logger.security.authentication('registration_success', {
      userId: user._id,
      email,
      phone,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send welcome email (don't wait)
    emailService.sendWelcomeEmail(user.email, user.name).catch(err => {
      logger.error('Welcome email failed', { userId: user._id, error: err.message });
    });

    return httpStatus.CREATED(res, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      },
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
    });
  } catch (error) {
    logger.error('Registration failed', { 
      error: error.message,
      email: req.body?.email,
      ip: req.ip
    });
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return httpStatus.BAD_REQUEST(res, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +passwordHash');

    if (!user || !user.isActive) {
      logger.security.authentication('login_failed_user_not_found', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return httpStatus.UNAUTHORIZED(res, 'Invalid credentials');
    }

    // Ensure passwordHash is migrated from legacy password
    await user.ensurePasswordHash();

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.security.authentication('login_failed_invalid_password', {
        userId: user._id,
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return httpStatus.UNAUTHORIZED(res, 'Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Add session
    const sessionId = crypto.randomUUID();
    user.addSession(sessionId, req.get('User-Agent'), req.ip);
    await user.save();

    // Log successful login
    logger.security.authentication('login_success', {
      userId: user._id,
      email,
      role: user.role,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return httpStatus.OK(res, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.role === 'sub-admin' ? user.permissions : undefined,
        isActive: user.isActive
      },
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
    });
  } catch (error) {
    logger.error('Login failed', { 
      error: error.message,
      email: req.body?.email,
      ip: req.ip
    });
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return httpStatus.NOT_FOUND(res, 'User not found');
    }

    // Remove all sessions for security (or just the current one if sessionId is provided)
    user.clearAllSessions();
    await user.save();

    logger.security.authentication('logout', {
      userId: user._id,
      ip: req.ip
    });

    return httpStatus.OK(res, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return httpStatus.BAD_REQUEST(res, 'Refresh token is required');
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      return httpStatus.UNAUTHORIZED(res, 'Invalid token type');
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return httpStatus.UNAUTHORIZED(res, 'User not found or inactive');
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    return httpStatus.OK(res, 'Tokens refreshed successfully', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return httpStatus.UNAUTHORIZED(res, 'Invalid or expired refresh token');
    }
    next(error);
  }
};

// Forgot password
const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return httpStatus.BAD_REQUEST(res, 'Validation failed', errors.array());
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      logger.security.passwordReset('forgot_password_user_not_found', {
        email,
        ip: req.ip
      });
      
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    if (!user.isActive) {
      logger.security.passwordReset('forgot_password_inactive_user', {
        userId: user._id,
        email,
        ip: req.ip
      });
      
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Rate limiting check
    const now = new Date();
    if (user.lastResetRequestAt && (now - user.lastResetRequestAt) < 5 * 60 * 1000) { // 5 minutes
      user.failedResetRequests = (user.failedResetRequests || 0) + 1;
      
      if (user.failedResetRequests >= 3) {
        logger.security.passwordReset('reset_rate_limit_exceeded', {
          userId: user._id,
          email,
          ip: req.ip,
          attempts: user.failedResetRequests
        });
        
        return res.status(429).json({
          success: false,
          message: 'Too many reset attempts. Please try again later.'
        });
      }
    } else {
      user.failedResetRequests = 0;
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    user.resetRequestIP = req.ip;
    user.lastResetRequestAt = now;
    
    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
      
      logger.security.passwordReset('reset_email_sent', {
        userId: user._id,
        email,
        ip: req.ip
      });
    } catch (emailError) {
      logger.security.emailFailed({
        userId: user._id,
        email,
        type: 'password_reset',
        error: emailError.message
      });
      
      // Clear the reset token if email failed
      user.clearResetToken();
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  } catch (error) {
    logger.error('Forgot password failed', { 
      error: error.message,
      email: req.body?.email,
      ip: req.ip
    });
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return httpStatus.BAD_REQUEST(res, 'Validation failed', errors.array());
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      resetTokenExpiresAt: { $gt: new Date() },
      resetTokenUsed: { $ne: true }
    }).select('+resetTokenHash');

    if (!user || !user.validateResetToken(token)) {
      logger.security.passwordReset('reset_invalid_token', {
        token: token?.substring(0, 8) + '...',
        ip: req.ip
      });
      
      return httpStatus.BAD_REQUEST(res, 'Invalid or expired reset token');
    }

    // Update password
    user.password = password; // Will be hashed by pre-save hook
    user.clearResetToken();
    user.failedResetRequests = 0;
    
    // Clear all active sessions for security
    user.clearAllSessions();
    
    await user.save();

    logger.security.passwordReset('password_reset_success', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    // Send confirmation email
    emailService.sendPasswordResetConfirmation(user.email, user.name).catch(err => {
      logger.error('Password reset confirmation email failed', { 
        userId: user._id, 
        error: err.message 
      });
    });

    return httpStatus.OK(res, 'Password reset successful');
  } catch (error) {
    logger.error('Password reset failed', { 
      error: error.message,
      ip: req.ip
    });
    next(error);
  }
};

// Change password (authenticated user)
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return httpStatus.BAD_REQUEST(res, 'Validation failed', errors.array());
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password +passwordHash');

    if (!user) {
      return httpStatus.NOT_FOUND(res, 'User not found');
    }

    // Sub-admins cannot change their own passwords
    if (user.role === 'sub-admin' && user.passwordSetByAdmin) {
      return httpStatus.FORBIDDEN(res, 'Sub-admins cannot change their passwords. Contact the main admin.');
    }

    // Ensure passwordHash is migrated
    await user.ensurePasswordHash();

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      logger.security.passwordReset('change_password_invalid_current', {
        userId: user._id,
        ip: req.ip
      });
      
      return httpStatus.BAD_REQUEST(res, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    user.lastPasswordResetAt = new Date();
    
    // Clear all other sessions for security
    user.clearAllSessions();
    
    await user.save();

    logger.security.passwordReset('password_change_success', {
      userId: user._id,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change failed', { 
      userId: req.user?.id,
      error: error.message,
      ip: req.ip
    });
    next(error);
  }
};

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('likedProperties', 'title price location type images')
      .populate('visitList.property', 'title price location type images');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.role === 'sub-admin' ? user.permissions : undefined,
          isActive: user.isActive,
          likedProperties: user.likedProperties,
          visitList: user.visitList,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if phone number is already taken by another user
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ 
        phone, 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already in use'
        });
      }
    }

    // Update fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone;

    await user.save();

    logger.info('Profile updated', {
      userId: user._id,
      changes: { name: !!name, phone: !!phone }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Sub-admins cannot delete their own accounts
    if (user.role === 'sub-admin') {
      return res.status(403).json({
        success: false,
        message: 'Sub-admins cannot delete their own accounts. Contact the main admin.'
      });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.phone = `deleted_${Date.now()}_${user.phone}`;
    await user.save();

    logger.security.authentication('account_deleted', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Verify email (if email verification is implemented)
const verifyEmail = async (req, res, next) => {
  try {
    // Implementation would depend on email verification system
    res.json({
      success: true,
      message: 'Email verification not implemented yet'
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
const resendVerification = async (req, res, next) => {
  try {
    // Implementation would depend on email verification system
    res.json({
      success: true,
      message: 'Email verification not implemented yet'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  deleteAccount,
  verifyEmail,
  resendVerification
};