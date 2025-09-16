const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  reviewType: {
    type: String,
    enum: ['property', 'general', 'service', 'General Experience', 'Service Quality', 'Property Purchase/Sale', 'Customer Support'],
    default: 'general'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ property: 1, isApproved: 1, isActive: 1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ isApproved: 1, createdAt: -1 });

// Static method to get average rating for a property
reviewSchema.statics.getAverageRating = async function(propertyId) {
  const result = await this.aggregate([
    {
      $match: {
        property: propertyId,
        isApproved: true,
        isActive: true
      }
    },
    {
      $group: {
        _id: '$property',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

// Pre-populate user info when querying
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name phone'
  });
  next();
});

module.exports = mongoose.model('Review', reviewSchema);