const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  subject: {
    type: String,
    trim: true,
    enum: ['property-inquiry', 'buying', 'selling', 'investment', 'legal', 'other', ''],
    default: ''
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'walk-in', 'referral'],
    default: 'website'
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  responseCount: {
    type: Number,
    default: 0
  },
  lastResponseAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
contactSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for subject display
contactSchema.virtual('subjectDisplay').get(function() {
  const subjectMap = {
    'property-inquiry': 'Property Inquiry',
    'buying': 'Buying Property',
    'selling': 'Selling Property',
    'investment': 'Investment Consultation',
    'legal': 'Legal Assistance',
    'other': 'Other',
    '': 'General Inquiry'
  };
  return subjectMap[this.subject] || 'General Inquiry';
});

// Virtual for priority color
contactSchema.virtual('priorityColor').get(function() {
  const colorMap = {
    'low': 'green',
    'medium': 'yellow',
    'high': 'orange',
    'urgent': 'red'
  };
  return colorMap[this.priority] || 'gray';
});

// Virtual for status color
contactSchema.virtual('statusColor').get(function() {
  const colorMap = {
    'new': 'blue',
    'in-progress': 'yellow',
    'resolved': 'green',
    'closed': 'gray'
  };
  return colorMap[this.status] || 'gray';
});

// Index for better search performance
contactSchema.index({ email: 1 });
contactSchema.index({ phone: 1 });
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ priority: 1, createdAt: -1 });
contactSchema.index({ isRead: 1, createdAt: -1 });
contactSchema.index({ assignedTo: 1, status: 1 });

// Pre-save middleware to set priority based on subject
contactSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set priority based on subject
    if (this.subject === 'urgent' || this.message.toLowerCase().includes('urgent')) {
      this.priority = 'urgent';
    } else if (this.subject === 'investment' || this.subject === 'legal') {
      this.priority = 'high';
    } else if (this.subject === 'buying' || this.subject === 'selling') {
      this.priority = 'medium';
    }
  }
  next();
});

module.exports = mongoose.model('Contact', contactSchema);