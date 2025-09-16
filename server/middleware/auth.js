const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { mockUsers } = require('../data/mockData');

// Helper function to use mock data when database is not available
const useMockData = (error) => {
  return error && (
    error.name === 'MongooseServerSelectionError' || 
    error.code === 'ENOTFOUND' || 
    (error.message && error.message.includes('connect'))
  );
};

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // console.log('🔐 Auth middleware - checking token...');
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Handle mock tokens for development
    if (token.startsWith('mock_admin_token_')) {
      console.log('🎭 Mock token detected:', token.substring(0, 30) + '...');
      console.log('🎭 Using mock admin user for development');
      const mockAdmin = {
        _id: 'mock_9876543209',
        name: 'Owner Admin', 
        phone: '9876543209',
        email: 'owner@promiserealty.com',
        role: 'owner',
        permissions: {
          addProperty: true,
          editProperty: true,
          deleteProperty: true,
          writeReview: true,
          deleteReview: true,
          writeBlog: true,
          deleteBlog: true,
          deleteUser: true,
          viewInquiries: true,
          viewMessages: true,
          deleteMessages: true
        },
        isActive: true
      };
      req.user = mockAdmin;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;

    try {
      user = await User.findById(decoded.userId).select('-password');
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for auth - database not available');
        // Use mock data for demo
        user = mockUsers.find(u => u._id === decoded.userId);
        if (user) {
          // Remove password field if it exists
          const { password, ...userWithoutPassword } = user;
          user = userWithoutPassword;
        }
      } else {
        throw dbError;
      }
    }
    
    if (!user || (user.isActive !== undefined && !user.isActive)) {
      console.log('❌ Invalid user or inactive:', decoded.userId);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found' 
      });
    }

    // console.log('✅ Auth successful - User:', user.name, 'Role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Check if user is admin (includes owner, admin, or sub-admin)
const requireAdmin = (req, res, next) => {
  // console.log('🔐 Admin check - User role:', req.user?.role);
  const adminRoles = ['owner', 'admin', 'sub-admin'];
  if (req.user && adminRoles.includes(req.user.role)) {
    // console.log('✅ Admin access granted');
    next();
  } else {
    console.log('❌ Admin access denied - User role:', req.user?.role);
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
};

// Check if user is main admin (owner or admin, not sub-admin)
const requireMainAdmin = (req, res, next) => {
  const mainAdminRoles = ['owner', 'admin'];
  if (req.user && mainAdminRoles.includes(req.user.role)) {
    next();
  } else {
    console.log('❌ Main admin access denied - User role:', req.user?.role);
    return res.status(403).json({ 
      success: false, 
      message: 'Main admin access required' 
    });
  }
};

// Check if user is owner
const requireOwner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    console.log('❌ Owner access denied - User role:', req.user?.role);
    return res.status(403).json({ 
      success: false, 
      message: 'Owner access required' 
    });
  }
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user;

      try {
        user = await User.findById(decoded.userId).select('-password');
      } catch (dbError) {
        if (useMockData(dbError)) {
          // Use mock data for demo
          user = mockUsers.find(u => u._id === decoded.userId);
          if (user) {
            // Remove password field if it exists
            const { password, ...userWithoutPassword } = user;
            user = userWithoutPassword;
          }
        }
      }
      
      if (user && (user.isActive === undefined || user.isActive)) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireMainAdmin,
  requireOwner,
  optionalAuth
};