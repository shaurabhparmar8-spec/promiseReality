const { requireAdmin, requireMainAdmin, requireOwner } = require('./auth');

// Role-based access control
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert single role to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Map frontend role names to backend role names
    const roleMapping = {
      'mainAdmin': ['owner', 'admin'],
      'subAdmin': ['sub-admin'],
      'user': ['user']
    };

    // Get all allowed backend roles
    const allowedBackendRoles = roles.flatMap(role => 
      roleMapping[role] || [role]
    );

    if (allowedBackendRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Required roles: ${roles.join(', ')}`
    });
  };
};

// Check specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Owners and main admins have all permissions
    if (req.user.role === 'owner' || req.user.role === 'admin') {
      return next();
    }

    // Sub-admins need specific permissions
    if (req.user.role === 'sub-admin') {
      if (!req.user.permissions || !req.user.permissions[permission]) {
        console.log(`❌ Permission denied - User: ${req.user.name}, Required: ${permission}`);
        return res.status(403).json({
          success: false,
          message: `Permission denied. Required: ${permission}`
        });
      }
      return next();
    }

    // Regular users don't have admin permissions
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  };
};

// Check multiple permissions (user needs at least one)
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Owners and main admins have all permissions
    if (req.user.role === 'owner' || req.user.role === 'admin') {
      return next();
    }

    // Sub-admins need at least one of the specified permissions
    if (req.user.role === 'sub-admin') {
      if (!req.user.permissions) {
        return res.status(403).json({
          success: false,
          message: 'No permissions assigned'
        });
      }

      const hasPermission = permissions.some(permission => 
        req.user.permissions[permission] === true
      );

      if (!hasPermission) {
        console.log(`❌ Permission denied - User: ${req.user.name}, Required one of: ${permissions.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: `Permission denied. Required one of: ${permissions.join(', ')}`
        });
      }
      return next();
    }

    // Regular users don't have admin permissions
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  };
};

// Check multiple permissions (user needs all)
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Owners and main admins have all permissions
    if (req.user.role === 'owner' || req.user.role === 'admin') {
      return next();
    }

    // Sub-admins need all specified permissions
    if (req.user.role === 'sub-admin') {
      if (!req.user.permissions) {
        return res.status(403).json({
          success: false,
          message: 'No permissions assigned'
        });
      }

      const hasAllPermissions = permissions.every(permission => 
        req.user.permissions[permission] === true
      );

      if (!hasAllPermissions) {
        console.log(`❌ Permission denied - User: ${req.user.name}, Required all of: ${permissions.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: `Permission denied. Required all of: ${permissions.join(', ')}`
        });
      }
      return next();
    }

    // Regular users don't have admin permissions
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  };
};

// Permission constants
const PERMISSIONS = {
  // Property permissions
  ADD_PROPERTY: 'addProperty',
  EDIT_PROPERTY: 'editProperty',
  DELETE_PROPERTY: 'deleteProperty',
  
  // Blog permissions
  WRITE_BLOG: 'writeBlog',
  DELETE_BLOG: 'deleteBlog',
  
  // Review permissions
  WRITE_REVIEW: 'writeReview',
  DELETE_REVIEW: 'deleteReview',
  
  // User permissions
  DELETE_USER: 'deleteUser',
  
  // Message permissions
  VIEW_MESSAGES: 'viewMessages',
  DELETE_MESSAGES: 'deleteMessages',
  
  // Inquiry permissions
  VIEW_INQUIRIES: 'viewInquiries'
};

module.exports = {
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireAdmin,
  requireMainAdmin,
  requireOwner,
  PERMISSIONS
};