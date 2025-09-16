const User = require('../models/User');
const { validationResult, body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { mockUsers } = require('../data/mockData');

// Runtime array for dynamically created sub-admins (when DB is not available)
let runtimeSubAdmins = [];

// Helper function to use mock data when database is not available
const useMockData = (error) => {
  return error && (
    error.name === 'MongooseServerSelectionError' || 
    error.code === 'ENOTFOUND' || 
    (error.message && error.message.includes('connect'))
  );
};

// Create Sub-Admin (Owner only)
const createSubAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, password, permissions } = req.body;
    const creatorId = req.user.id;

    // New validation for phone number format
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be between 10 to 15 digits.'
      });
    }

    let creator;
    try {
      // Try to get creator from database
      creator = await User.findById(creatorId);
    } catch (dbError) {
      if (useMockData(dbError)) {
        // Use mock data - check both mockUsers and direct mock token IDs
        creator = mockUsers.find(u => u._id === creatorId);
        if (!creator && creatorId === 'mock_9876543209') {
          // Handle mock admin token
          creator = {
            _id: 'mock_9876543209',
            name: 'Owner Admin', 
            phone: '9876543209',
            email: 'owner@promiserealty.com',
            role: 'owner',
            isActive: true
          };
        }
        if (!creator) {
          return res.status(403).json({
            success: false,
            message: 'Creator not found'
          });
        }
      } else {
        throw dbError;
      }
    }

    // Verify the creator exists and is an owner
    if (!creator) {
      return res.status(403).json({
        success: false,
        message: 'Creator not found'
      });
    }

    const canManage = creator.role === 'owner' || (creator.canManageSubAdmins && creator.canManageSubAdmins());
    if (!canManage) {
      return res.status(403).json({
        success: false,
        message: 'Only owners can create sub-admins'
      });
    }

    let existingSubAdminsCount = 0;
    let phoneExists = false;

    try {
      // Check sub-admin limit (max 3)
      existingSubAdminsCount = await User.countDocuments({ 
        role: 'sub-admin', 
        createdBy: creatorId,
        isActive: true 
      });

      // Check if phone number already exists
      const existingUser = await User.findOne({ phone });
      phoneExists = !!existingUser;
    } catch (dbError) {
      if (useMockData(dbError)) {
        // Count existing sub-admins in mock data and runtime
        const allSubAdmins = [...runtimeSubAdmins, ...mockUsers.filter(u => u.role === 'sub-admin')];
        existingSubAdminsCount = allSubAdmins.filter(u => u.createdBy === creatorId && u.isActive !== false).length;
        
        // Check phone existence
        phoneExists = allSubAdmins.some(u => u.phone === phone) || mockUsers.some(u => u.phone === phone);
      } else {
        throw dbError;
      }
    }
    
    if (existingSubAdminsCount >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum of 3 sub-admins allowed'
      });
    }

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    let subAdmin;

    try {
      // Create sub-admin with permissions
      subAdmin = new User({
        name,
        phone,
        email: `${phone}@promiserealty.com`, // Generate email based on phone
        role: 'sub-admin',
        createdBy: creatorId,
        passwordSetByAdmin: true,
        permissions: {
          addProperty: permissions?.addProperty || false,
          editProperty: permissions?.editProperty || false,
          deleteProperty: permissions?.deleteProperty || false,
          writeBlog: permissions?.writeBlog || false,
          deleteBlog: permissions?.deleteBlog || false,
          writeReview: permissions?.writeReview || false,
          deleteReview: permissions?.deleteReview || false,
          deleteUser: permissions?.deleteUser || false,
          viewMessages: permissions?.viewMessages || false,
          deleteMessages: permissions?.deleteMessages || false,
          viewInquiries: permissions?.viewInquiries || false
        }
      });

      // Set password (will be hashed by pre-save hook)
      subAdmin.passwordHash = password;
      await subAdmin.save();

      // Remove sensitive data from response
      const responseSubAdmin = subAdmin.toObject();
      delete responseSubAdmin.passwordHash;
      delete responseSubAdmin.password;
      subAdmin = responseSubAdmin;

    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('🔧 Using mock data for sub-admin creation...');
        
        // Create mock sub-admin
        subAdmin = {
          _id: Date.now().toString(),
          name,
          phone,
          email: `${phone}@promiserealty.com`,
          role: 'sub-admin',
          createdBy: creatorId,
          passwordSetByAdmin: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: {
            addProperty: permissions?.addProperty || false,
            editProperty: permissions?.editProperty || false,
            deleteProperty: permissions?.deleteProperty || false,
            writeBlog: permissions?.writeBlog || false,
            deleteBlog: permissions?.deleteBlog || false,
            writeReview: permissions?.writeReview || false,
            deleteReview: permissions?.deleteReview || false,
            deleteUser: permissions?.deleteUser || false,
            viewMessages: permissions?.viewMessages || false,
            deleteMessages: permissions?.deleteMessages || false,
            viewInquiries: permissions?.viewInquiries || false
          }
        };
        
        // Add to runtime sub-admins array
        runtimeSubAdmins.push(subAdmin);
        console.log('✅ Mock sub-admin added to runtime array');
        console.log('📊 Total runtime sub-admins:', runtimeSubAdmins.length);
        
      } else {
        throw dbError;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Sub-admin created successfully',
      data: { subAdmin }
    });

  } catch (error) {
    console.error('Create sub-admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating sub-admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get All Sub-Admins (Owner only)
const getSubAdmins = async (req, res) => {
  try {
    const creatorId = req.user.id;
    
    let creator;
    let subAdmins = [];

    try {
      // Verify the requester is an owner
      creator = await User.findById(creatorId);
      
      // Check if user has permission to manage sub-admins
      const canManage = creator.canManageSubAdmins ? creator.canManageSubAdmins() : creator.role === 'owner';
      if (!canManage) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can view sub-admins'
        });
      }

      subAdmins = await User.find({
        role: 'sub-admin',
        createdBy: creatorId
      }).select('-passwordHash -password -resetTokenHash -activeSessions');

    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('🔧 Using mock data for sub-admin retrieval...');
        
        // Use mock data - check both mockUsers and direct mock token IDs
        creator = mockUsers.find(u => u._id === creatorId);
        if (!creator && creatorId === 'mock_9876543209') {
          // Handle mock admin token
          creator = {
            _id: 'mock_9876543209',
            name: 'Owner Admin', 
            phone: '9876543209',
            email: 'owner@promiserealty.com',
            role: 'owner',
            isActive: true
          };
        }
        if (!creator || creator.role !== 'owner') {
          return res.status(403).json({
            success: false,
            message: 'Only owners can view sub-admins'
          });
        }

        // Combine ALL sub-admins (runtime created + static mock + other created admins)
        const allMockSubAdmins = [...mockUsers.filter(u => u.role === 'sub-admin')];
        const allRuntimeCreatedSubAdmins = runtimeSubAdmins; // Show all runtime created sub-admins
        
        // Include all created admins that are not owners
        const createdAdmins = runtimeSubAdmins.filter(u => u.role === 'admin' || u.role === 'sub-admin');
        
        subAdmins = [...allRuntimeCreatedSubAdmins, ...allMockSubAdmins];
        
        console.log('📊 Mock data retrieval: runtime sub-admins:', allRuntimeCreatedSubAdmins.length, 'static sub-admins:', allMockSubAdmins.length);
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      data: { subAdmins }
    });

  } catch (error) {
    console.error('Get sub-admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sub-admins'
    });
  }
};

// Update Sub-Admin Permissions (Owner only)
const updateSubAdminPermissions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subAdminId } = req.params;
    const { permissions } = req.body;
    const creatorId = req.user.id;

    let creator, subAdmin;

    try {
      // Verify the requester is an owner
      creator = await User.findById(creatorId);
      
      // Check if user has permission to manage sub-admins
      const canManage = creator.canManageSubAdmins ? creator.canManageSubAdmins() : creator.role === 'owner';
      if (!canManage) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can update sub-admin permissions'
        });
      }

      // Find and verify the sub-admin
      subAdmin = await User.findOne({
        _id: subAdminId,
        role: 'sub-admin',
        createdBy: creatorId
      });

      if (!subAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Sub-admin not found or not owned by you'
        });
      }

      // Update permissions
      subAdmin.updatePermissions(permissions);
      await subAdmin.save();

      // Remove sensitive data from response
      const responseSubAdmin = subAdmin.toObject();
      delete responseSubAdmin.passwordHash;
      delete responseSubAdmin.password;

    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('🔧 Using mock data for sub-admin permission update...');
        
        // Use mock data - check both mockUsers and direct mock token IDs
        creator = mockUsers.find(u => u._id === creatorId);
        if (!creator && creatorId === 'mock_9876543209') {
          // Handle mock admin token
          creator = {
            _id: 'mock_9876543209',
            name: 'Owner Admin', 
            phone: '9876543209',
            email: 'owner@promiserealty.com',
            role: 'owner',
            isActive: true
          };
        }
        if (!creator || creator.role !== 'owner') {
          return res.status(403).json({
            success: false,
            message: 'Only owners can update sub-admin permissions'
          });
        }

        // Find the sub-admin in runtime array
        const subAdminIndex = runtimeSubAdmins.findIndex(s => s._id === subAdminId && s.createdBy === creatorId);
        if (subAdminIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Sub-admin not found or not owned by you'
          });
        }

        // Update permissions in runtime array
        const validPermissions = [
          'addProperty', 'editProperty', 'deleteProperty',
          'writeBlog', 'deleteBlog',
          'writeReview', 'deleteReview',
          'deleteUser',
          'viewMessages', 'deleteMessages',
          'viewInquiries'
        ];

        validPermissions.forEach(perm => {
          if (permissions.hasOwnProperty(perm)) {
            runtimeSubAdmins[subAdminIndex].permissions[perm] = Boolean(permissions[perm]);
          }
        });

        subAdmin = runtimeSubAdmins[subAdminIndex];
        
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      message: 'Sub-admin permissions updated successfully',
      data: { subAdmin }
    });

  } catch (error) {
    console.error('Update sub-admin permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating sub-admin permissions'
    });
  }
};

// Change Sub-Admin Password (Owner only)
const changeSubAdminPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subAdminId } = req.params;
    const { newPassword } = req.body;
    const creatorId = req.user.id;

    let creator, subAdmin;

    try {
      // Verify the requester is an owner
      creator = await User.findById(creatorId);
      
      // Check if user has permission to manage sub-admins
      const canManage = creator.canManageSubAdmins ? creator.canManageSubAdmins() : creator.role === 'owner';
      if (!canManage) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can change sub-admin passwords'
        });
      }

      // Find and verify the sub-admin
      subAdmin = await User.findOne({
        _id: subAdminId,
        role: 'sub-admin',
        createdBy: creatorId
      });

      if (!subAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Sub-admin not found or not owned by you'
        });
      }

      // Update password (will be hashed by pre-save hook)
      subAdmin.passwordHash = newPassword;
      subAdmin.passwordSetByAdmin = true;
      await subAdmin.save();

    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('🔧 Using mock data for sub-admin password change...');
        
        // Use mock data - check both mockUsers and direct mock token IDs
        creator = mockUsers.find(u => u._id === creatorId);
        if (!creator && creatorId === 'mock_9876543209') {
          // Handle mock admin token
          creator = {
            _id: 'mock_9876543209',
            name: 'Owner Admin', 
            phone: '9876543209',
            email: 'owner@promiserealty.com',
            role: 'owner',
            isActive: true
          };
        }
        if (!creator || creator.role !== 'owner') {
          return res.status(403).json({
            success: false,
            message: 'Only owners can change sub-admin passwords'
          });
        }

        // Find the sub-admin in runtime array
        const subAdminIndex = runtimeSubAdmins.findIndex(s => s._id === subAdminId && s.createdBy === creatorId);
        if (subAdminIndex === -1) {
          return res.status(404).json({
            success: false,
            message: 'Sub-admin not found or not owned by you'
          });
        }

        // Update password in runtime array (in real app this would be hashed)
        runtimeSubAdmins[subAdminIndex].passwordHash = newPassword;
        runtimeSubAdmins[subAdminIndex].passwordSetByAdmin = true;
        
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      message: 'Sub-admin password updated successfully'
    });

  } catch (error) {
    console.error('Change sub-admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing sub-admin password'
    });
  }
};

// Delete Sub-Admin (Owner only)
const deleteSubAdmin = async (req, res) => {
  try {
    const { subAdminId } = req.params;
    const creatorId = req.user.id;

    // Verify the requester is an owner
    const creator = await User.findById(creatorId);
    if (!creator.canManageSubAdmins()) {
      return res.status(403).json({
        success: false,
        message: 'Only owners can delete sub-admins'
      });
    }

    // Find and verify the sub-admin
    const subAdmin = await User.findOne({
      _id: subAdminId,
      role: 'sub-admin',
      createdBy: creatorId
    });

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found or not owned by you'
      });
    }

    // Soft delete by deactivating
    subAdmin.isActive = false;
    await subAdmin.save();

    // Or hard delete if preferred
    // await User.findByIdAndDelete(subAdminId);

    res.json({
      success: true,
      message: 'Sub-admin deleted successfully'
    });

  } catch (error) {
    console.error('Delete sub-admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting sub-admin'
    });
  }
};

// Sub-Admin Login
const subAdminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, password } = req.body;

    // Find sub-admin by phone
    const subAdmin = await User.findOne({ 
      phone, 
      role: 'sub-admin',
      isActive: true 
    });

    if (!subAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await subAdmin.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: subAdmin._id, 
        role: subAdmin.role,
        permissions: subAdmin.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data from response
    const responseSubAdmin = subAdmin.toObject();
    delete responseSubAdmin.passwordHash;
    delete responseSubAdmin.password;

    res.json({
      success: true,
      message: 'Sub-admin login successful',
      data: {
        user: responseSubAdmin,
        token
      }
    });

  } catch (error) {
    console.error('Sub-admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during sub-admin login'
    });
  }
};

// Toggle Sub-Admin Status (Owner only)
const toggleSubAdminStatus = async (req, res) => {
  try {
    const { subAdminId } = req.params;
    const creatorId = req.user.id;

    // Verify the requester is an owner
    const creator = await User.findById(creatorId);
    if (!creator.canManageSubAdmins()) {
      return res.status(403).json({
        success: false,
        message: 'Only owners can toggle sub-admin status'
      });
    }

    // Find and verify the sub-admin
    const subAdmin = await User.findOne({
      _id: subAdminId,
      role: 'sub-admin',
      createdBy: creatorId
    });

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found or not owned by you'
      });
    }

    // Toggle active status
    subAdmin.isActive = !subAdmin.isActive;
    await subAdmin.save();

    // Remove sensitive data from response
    const responseSubAdmin = subAdmin.toObject();
    delete responseSubAdmin.passwordHash;
    delete responseSubAdmin.password;

    res.json({
      success: true,
      message: `Sub-admin ${subAdmin.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { subAdmin: responseSubAdmin }
    });

  } catch (error) {
    console.error('Toggle sub-admin status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling sub-admin status'
    });
  }
};

module.exports = {
  createSubAdmin,
  getSubAdmins,
  updateSubAdminPermissions,
  changeSubAdminPassword,
  deleteSubAdmin,
  subAdminLogin,
  toggleSubAdminStatus
};