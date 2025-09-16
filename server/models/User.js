const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const argon2 = require('argon2');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [10, 'Password must be at least 10 characters']
  },
  // Legacy password field for backward compatibility
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'sub-admin', 'owner'],
    default: 'user'
  },
  // Sub-admin specific fields
  permissions: {
    // Property management permissions
    addProperty: { type: Boolean, default: false },
    editProperty: { type: Boolean, default: false },
    deleteProperty: { type: Boolean, default: false },
    
    // Blog management permissions
    writeBlog: { type: Boolean, default: false },
    deleteBlog: { type: Boolean, default: false },
    
    // Review management permissions
    writeReview: { type: Boolean, default: false },
    deleteReview: { type: Boolean, default: false },
    
    // User management permissions
    deleteUser: { type: Boolean, default: false },
    
    // Message management permissions
    viewMessages: { type: Boolean, default: false },
    deleteMessages: { type: Boolean, default: false },
    
    // Visit/Inquiry management permissions
    viewInquiries: { type: Boolean, default: false }
  },
  // Creator tracking for sub-admins
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'sub-admin';
    }
  },
  // Password management - sub-admins cannot change their own passwords
  passwordSetByAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Enhanced password reset security
  resetTokenHash: {
    type: String,
    index: true,
    select: false
  },
  resetTokenExpiresAt: {
    type: Date,
    index: true
  },
  resetTokenUsed: {
    type: Boolean,
    default: false
  },
  lastPasswordResetAt: {
    type: Date
  },
  resetRequestIP: {
    type: String
  },
  failedResetRequests: {
    type: Number,
    default: 0
  },
  lastResetRequestAt: {
    type: Date
  },
  // Session management
  activeSessions: [{
    sessionId: String,
    createdAt: { type: Date, default: Date.now },
    lastAccessedAt: { type: Date, default: Date.now },
    userAgent: String,
    ipAddress: String
  }],
  // Legacy fields
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date
  },
  likedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  visitList: [{
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Ensure passwordHash is present before validation when a plain password is provided
userSchema.pre('validate', function(next) {
  if (this.isModified('password') && this.password && !this.passwordHash) {
    // Temporarily set passwordHash to plain; it will be hashed in pre('save')
    this.passwordHash = this.password;
  }
  next();
});

// Hash password before saving (Enhanced with Argon2id)
userSchema.pre('save', async function(next) {
  // Handle both legacy password and new passwordHash fields
  if (this.isModified('password') && this.password) {
    try {
      this.passwordHash = await this.hashPassword(this.password);
      this.password = undefined; // Clear legacy field
    } catch (error) {
      return next(error);
    }
  }
  
  if (this.isModified('passwordHash') && this.passwordHash && !this.passwordHash.startsWith('$argon2') && !this.passwordHash.startsWith('$2a') && !this.passwordHash.startsWith('$2b')) {
    try {
      this.passwordHash = await this.hashPassword(this.passwordHash);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Enhanced password hashing method
userSchema.methods.hashPassword = async function(plainPassword) {
  try {
    // Try Argon2id first (recommended)
    if (process.env.NODE_ENV === 'production' || process.env.USE_ARGON2 === 'true') {
      return await argon2.hash(plainPassword, {
        type: argon2.argon2id,
        memoryCost: parseInt(process.env.ARGON2_MEMORY_COST) || 65536, // 64 MB
        timeCost: parseInt(process.env.ARGON2_TIME_COST) || 3,
        parallelism: parseInt(process.env.ARGON2_PARALLELISM) || 4,
        hashLength: parseInt(process.env.ARGON2_HASH_LENGTH) || 32
      });
    } else {
      // Fallback to bcrypt for development
      const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      return await bcrypt.hash(plainPassword, rounds);
    }
  } catch (error) {
    throw new Error('Password hashing failed');
  }
};

// Enhanced password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const hash = this.passwordHash || this.password;
    if (!hash) return false;
    
    // Check if it's Argon2 hash
    if (hash.startsWith('$argon2')) {
      return await argon2.verify(hash, candidatePassword);
    }
    // Check if it's bcrypt hash
    else if (hash.startsWith('$2a') || hash.startsWith('$2b')) {
      return await bcrypt.compare(candidatePassword, hash);
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

// Ensure passwordHash exists by migrating legacy password field if necessary
userSchema.methods.ensurePasswordHash = async function() {
  // If already has passwordHash, nothing to do
  if (this.passwordHash) return;

  // If legacy password is present, migrate it
  if (this.password) {
    const legacy = this.password;
    // If legacy already looks like a hash, reuse it
    if (legacy.startsWith('$argon2') || legacy.startsWith('$2a') || legacy.startsWith('$2b')) {
      this.passwordHash = legacy;
      this.password = undefined;
      await this.save({ validateBeforeSave: false });
      return;
    }
    // Otherwise, hash it freshly
    this.passwordHash = await this.hashPassword(legacy);
    this.password = undefined;
    await this.save();
  }
};

// Generate secure reset token
userSchema.methods.generateResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  this.resetTokenHash = tokenHash;
  this.resetTokenExpiresAt = new Date(Date.now() + (parseInt(process.env.RESET_TOKEN_TTL_MINUTES) || 15) * 60 * 1000);
  this.resetTokenUsed = false;
  
  return token; // Return plaintext token for email
};

// Validate reset token
userSchema.methods.validateResetToken = function(token) {
  if (!token || !this.resetTokenHash || !this.resetTokenExpiresAt) {
    return false;
  }
  
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  return (
    this.resetTokenHash === tokenHash &&
    this.resetTokenExpiresAt > new Date() &&
    !this.resetTokenUsed
  );
};

// Clear reset token
userSchema.methods.clearResetToken = function() {
  this.resetTokenHash = undefined;
  this.resetTokenExpiresAt = undefined;
  this.resetTokenUsed = true;
  this.lastPasswordResetAt = new Date();
};

// Session management methods
userSchema.methods.addSession = function(sessionId, userAgent, ipAddress) {
  this.activeSessions.push({
    sessionId,
    userAgent,
    ipAddress,
    createdAt: new Date(),
    lastAccessedAt: new Date()
  });
};

userSchema.methods.removeSession = function(sessionId) {
  this.activeSessions = this.activeSessions.filter(session => session.sessionId !== sessionId);
};

userSchema.methods.clearAllSessions = function() {
  this.activeSessions = [];
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Method to toggle property like
userSchema.methods.toggleLike = function(propertyId) {
  const index = this.likedProperties.indexOf(propertyId);
  if (index > -1) {
    this.likedProperties.splice(index, 1);
    return false; // unliked
  } else {
    this.likedProperties.push(propertyId);
    return true; // liked
  }
};

// Method to add property to visit list
userSchema.methods.addToVisitList = function(propertyId, notes = '') {
  // Check if property is already in visit list
  const existingVisit = this.visitList.find(visit => 
    visit.property.toString() === propertyId.toString()
  );
  
  if (existingVisit) {
    return false; // already in visit list
  }
  
  this.visitList.push({
    property: propertyId,
    notes: notes
  });
  return true; // added to visit list
};

// Method to update visit status (admin only)
userSchema.methods.updateVisitStatus = function(propertyId, status, notes = '') {
  const visit = this.visitList.find(visit => 
    visit.property.toString() === propertyId.toString()
  );
  
  if (visit) {
    visit.status = status;
    if (notes) visit.notes = notes;
    return true;
  }
  return false;
};

// Permission management methods for sub-admin system
userSchema.methods.hasPermission = function(permission) {
  // Owners and regular admins have all permissions
  if (this.role === 'owner' || this.role === 'admin') {
    return true;
  }
  
  // Sub-admins only have specific permissions
  if (this.role === 'sub-admin') {
    return this.permissions && this.permissions[permission] === true;
  }
  
  // Regular users have no admin permissions
  return false;
};

userSchema.methods.updatePermissions = function(newPermissions) {
  if (this.role !== 'sub-admin') {
    throw new Error('Only sub-admins can have their permissions updated');
  }
  
  // Valid permission keys
  const validPermissions = [
    'addProperty', 'editProperty', 'deleteProperty',
    'writeBlog', 'deleteBlog',
    'writeReview', 'deleteReview',
    'deleteUser',
    'viewMessages', 'deleteMessages',
    'viewInquiries'
  ];
  
  // Update only valid permissions
  validPermissions.forEach(perm => {
    if (newPermissions.hasOwnProperty(perm)) {
      this.permissions[perm] = Boolean(newPermissions[perm]);
    }
  });
};

userSchema.methods.isOwner = function() {
  return this.role === 'owner';
};

userSchema.methods.isMainAdmin = function() {
  return this.role === 'admin' || this.role === 'owner';
};

userSchema.methods.isSubAdmin = function() {
  return this.role === 'sub-admin';
};

userSchema.methods.canManageSubAdmins = function() {
  return this.role === 'owner';
};

module.exports = mongoose.model('User', userSchema);