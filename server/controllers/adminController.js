const { validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const Property = require('../models/Property');
const Blog = require('../models/Blog');
const Review = require('../models/Review');
const Contact = require('../models/Contact');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const emailService = require('../services/enhancedEmailService');

// Create sub-admin
const createSubAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, permissions } = req.body;
    const createdBy = req.user.id;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone';
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Generate random password for sub-admin
    const randomPassword = crypto.randomBytes(12).toString('base64').slice(0, 12);

    // Create sub-admin user
    const subAdmin = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      phone,
      password: randomPassword,
      role: 'sub-admin',
      permissions: {
        addProperty: permissions.addProperty || false,
        editProperty: permissions.editProperty || false,
        deleteProperty: permissions.deleteProperty || false,
        writeReview: permissions.writeReview || false,
        deleteReview: permissions.deleteReview || false,
        writeBlog: permissions.writeBlog || false,
        deleteBlog: permissions.deleteBlog || false,
        deleteUser: permissions.deleteUser || false,
        viewInquiries: permissions.viewInquiries || false,
        viewMessages: permissions.viewMessages || false,
        deleteMessages: permissions.deleteMessages || false
      },
      createdBy,
      passwordSetByAdmin: true,
      isActive: true
    });

    await subAdmin.save();

    // Send credentials email
    try {
      await emailService.sendSubAdminCredentials(
        subAdmin.email,
        subAdmin.name,
        randomPassword,
        permissions
      );

      logger.info('Sub-admin created successfully', {
        subAdminId: subAdmin._id,
        createdBy,
        permissions: Object.keys(permissions).filter(key => permissions[key])
      });
    } catch (emailError) {
      logger.error('Failed to send sub-admin credentials', {
        subAdminId: subAdmin._id,
        error: emailError.message
      });
      
      // Don't fail the creation if email fails, but log it
    }

    res.status(201).json({
      success: true,
      message: 'Sub-admin created successfully. Login credentials sent via email.',
      data: {
        subAdmin: {
          id: subAdmin._id,
          name: subAdmin.name,
          email: subAdmin.email,
          phone: subAdmin.phone,
          role: subAdmin.role,
          permissions: subAdmin.permissions,
          isActive: subAdmin.isActive,
          createdAt: subAdmin.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Sub-admin creation failed', {
      error: error.message,
      createdBy: req.user?.id,
      email: req.body?.email
    });
    next(error);
  }
};

// Get all sub-admins
const getSubAdmins = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'sub-admin' };
    
    // Add search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (req.query.status) {
      query.isActive = req.query.status === 'active';
    }

    const subAdmins = await User.find(query)
      .populate('createdBy', 'name email')
      .select('-password -passwordHash -resetTokenHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: 'Sub-admins retrieved successfully',
      data: {
        subAdmins,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get sub-admin by ID
const getSubAdminById = async (req, res, next) => {
  try {
    const subAdmin = await User.findOne({
      _id: req.params.id,
      role: 'sub-admin'
    })
      .populate('createdBy', 'name email')
      .select('-password -passwordHash -resetTokenHash');

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Sub-admin retrieved successfully',
      data: { subAdmin }
    });
  } catch (error) {
    next(error);
  }
};

// Update sub-admin permissions
const updateSubAdminPermissions = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const subAdmin = await User.findOne({
      _id: req.params.id,
      role: 'sub-admin'
    });

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found'
      });
    }

    // Update permissions
    subAdmin.updatePermissions(req.body.permissions);
    await subAdmin.save();

    logger.info('Sub-admin permissions updated', {
      subAdminId: subAdmin._id,
      updatedBy: req.user.id,
      oldPermissions: subAdmin.permissions,
      newPermissions: req.body.permissions
    });

    // Notify sub-admin about permission changes
    emailService.sendPermissionUpdateNotification(
      subAdmin.email,
      subAdmin.name,
      req.body.permissions
    ).catch(err => {
      logger.error('Permission update notification failed', {
        subAdminId: subAdmin._id,
        error: err.message
      });
    });

    res.json({
      success: true,
      message: 'Sub-admin permissions updated successfully',
      data: {
        subAdmin: {
          id: subAdmin._id,
          name: subAdmin.name,
          email: subAdmin.email,
          permissions: subAdmin.permissions,
          updatedAt: new Date()
        }
      }
    });
  } catch (error) {
    logger.error('Sub-admin permission update failed', {
      subAdminId: req.params.id,
      updatedBy: req.user?.id,
      error: error.message
    });
    next(error);
  }
};

// Delete sub-admin
const deleteSubAdmin = async (req, res, next) => {
  try {
    const subAdmin = await User.findOne({
      _id: req.params.id,
      role: 'sub-admin'
    });

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found'
      });
    }

    // Soft delete - deactivate instead of removing
    subAdmin.isActive = false;
    subAdmin.email = `deleted_${Date.now()}_${subAdmin.email}`;
    subAdmin.phone = `deleted_${Date.now()}_${subAdmin.phone}`;
    await subAdmin.save();

    logger.info('Sub-admin deleted', {
      subAdminId: subAdmin._id,
      deletedBy: req.user.id,
      subAdminName: subAdmin.name
    });

    res.json({
      success: true,
      message: 'Sub-admin deleted successfully'
    });
  } catch (error) {
    logger.error('Sub-admin deletion failed', {
      subAdminId: req.params.id,
      deletedBy: req.user?.id,
      error: error.message
    });
    next(error);
  }
};

// Toggle sub-admin status
const toggleSubAdminStatus = async (req, res, next) => {
  try {
    const subAdmin = await User.findOne({
      _id: req.params.id,
      role: 'sub-admin'
    });

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found'
      });
    }

    subAdmin.isActive = !subAdmin.isActive;
    await subAdmin.save();

    logger.info('Sub-admin status toggled', {
      subAdminId: subAdmin._id,
      updatedBy: req.user.id,
      newStatus: subAdmin.isActive
    });

    res.json({
      success: true,
      message: `Sub-admin ${subAdmin.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        subAdmin: {
          id: subAdmin._id,
          name: subAdmin.name,
          isActive: subAdmin.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalBlogs,
      totalReviews,
      totalContacts,
      activeSubAdmins,
      recentProperties,
      recentContacts
    ] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      Property.countDocuments({ isActive: true }),
      Blog.countDocuments({ status: 'published' }),
      Review.countDocuments({ status: 'approved' }),
      Contact.countDocuments({}),
      User.countDocuments({ role: 'sub-admin', isActive: true }),
      Property.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title price location type createdAt'),
      Contact.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email subject createdAt status')
    ]);

    // Get monthly statistics
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await Promise.all([
      User.countDocuments({ 
        role: 'user', 
        createdAt: { $gte: startOfMonth } 
      }),
      Property.countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      }),
      Blog.countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      }),
      Contact.countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      })
    ]);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalUsers,
          totalProperties,
          totalBlogs,
          totalReviews,
          totalContacts,
          activeSubAdmins
        },
        monthly: {
          newUsers: monthlyStats[0],
          newProperties: monthlyStats[1],
          newBlogs: monthlyStats[2],
          newContacts: monthlyStats[3]
        },
        recent: {
          properties: recentProperties,
          contacts: recentContacts
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get system health
const getSystemHealth = async (req, res, next) => {
  try {
    const dbStatus = require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const systemInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: dbStatus,
        name: require('mongoose').connection.name
      },
      environment: process.env.NODE_ENV,
      version: require('../../package.json').version
    };

    res.json({
      success: true,
      message: 'System health retrieved successfully',
      data: systemInfo
    });
  } catch (error) {
    next(error);
  }
};

// Get audit logs (implementation depends on audit logging system)
const getAuditLogs = async (req, res, next) => {
  try {
    // This would typically query an audit log collection
    // For now, return a placeholder response
    
    res.json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: {
        logs: [],
        message: 'Audit logging system not fully implemented'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Manage users (list/delete)
const manageUsers = async (req, res, next) => {
  try {
    if (req.method === 'DELETE') {
      // Delete user
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.role !== 'user') {
        return res.status(403).json({
          success: false,
          message: 'Can only delete regular users'
        });
      }

      // Soft delete
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`;
      user.phone = `deleted_${Date.now()}_${user.phone}`;
      await user.save();

      logger.info('User deleted by admin', {
        userId: user._id,
        deletedBy: req.user.id
      });

      return res.json({
        success: true,
        message: 'User deleted successfully'
      });
    }

    // List users
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'user' };
    
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.status) {
      query.isActive = req.query.status === 'active';
    }

    const users = await User.find(query)
      .select('-password -passwordHash -resetTokenHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get reports
const getReports = async (req, res, next) => {
  try {
    const { type = 'users', startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const filter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    let data;
    switch (type) {
      case 'users':
        data = await User.aggregate([
          { $match: { role: 'user', ...filter } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        break;

      case 'properties':
        data = await Property.aggregate([
          { $match: filter },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              avgPrice: { $avg: '$price' }
            }
          }
        ]);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      message: `${type} report generated successfully`,
      data: {
        type,
        period: { startDate, endDate },
        results: data
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubAdmin,
  getSubAdmins,
  getSubAdminById,
  updateSubAdminPermissions,
  deleteSubAdmin,
  toggleSubAdminStatus,
  getDashboardStats,
  getSystemHealth,
  getAuditLogs,
  manageUsers,
  getReports
};