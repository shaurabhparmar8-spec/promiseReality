const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const { mockReviews, mockUsers } = require('../data/mockData');

// Helper function to use mock data when database is not available
const useMockData = (error) => {
  return error.name === 'MongooseServerSelectionError' || 
         error.code === 'ENOTFOUND' || 
         error.message.includes('connect');
};

// Get all approved reviews
const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isApproved: true, isActive: true };

    // Filter by property if specified
    if (req.query.property) {
      filter.property = req.query.property;
    }

    // Filter by review type
    if (req.query.type) {
      filter.reviewType = req.query.type;
    }

    let reviews, total;
    
    try {
      reviews = await Review.find(filter)
        .populate('property', 'title type location.city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await Review.countDocuments(filter);
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for reviews - database not available');
        
        // Filter mock reviews
        let filteredReviews = mockReviews.filter(r => r.isApproved);
        
        if (req.query.type) {
          filteredReviews = filteredReviews.filter(r => r.reviewType === req.query.type);
        }
        
        // Add user data to reviews
        filteredReviews = filteredReviews.map(review => ({
          ...review,
          user: mockUsers.find(u => u._id === review.user)
        }));
        
        total = filteredReviews.length;
        reviews = filteredReviews.slice(skip, skip + limit);
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
};

// Get reviews for a specific property
const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      property: propertyId,
      isApproved: true,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      property: propertyId,
      isApproved: true,
      isActive: true
    });

    // Get average rating
    const ratingStats = await Review.getAverageRating(propertyId);

    res.json({
      success: true,
      data: {
        reviews,
        ratingStats,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get property reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching property reviews'
    });
  }
};

// Create new review (Authenticated users only)
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment, property, reviewType } = req.body;

    // Check if user already reviewed this property (if property-specific)
    if (property) {
      const existingReview = await Review.findOne({
        user: req.user._id,
        property: property
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this property'
        });
      }
    }

    const review = new Review({
      user: req.user._id,
      rating,
      comment,
      property: property || null,
      reviewType: reviewType || 'general'
    });

    await review.save();
    await review.populate('user', 'name phone');
    
    if (property) {
      await review.populate('property', 'title type location.city');
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible after admin approval.',
      data: {
        review
      }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review'
    });
  }
};

// Get user's own reviews
const getUserReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      user: req.user._id,
      isActive: true
    })
      .populate('property', 'title type location.city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      user: req.user._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews'
    });
  }
};

// Update review (User can update their own review)
const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to update it'
      });
    }

    review.rating = rating;
    review.comment = comment;
    review.isApproved = false; // Reset approval status for updated review

    await review.save();
    await review.populate('user', 'name phone');
    
    if (review.property) {
      await review.populate('property', 'title type location.city');
    }

    res.json({
      success: true,
      message: 'Review updated successfully. It will be visible after admin approval.',
      data: {
        review
      }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
};

// Delete review (User can delete their own review)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({
      _id: id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to delete it'
      });
    }

    await Review.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
};

// Admin: Get all reviews (including pending)
const getAllReviewsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = { isActive: true };

    // Filter by approval status
    if (req.query.status) {
      if (req.query.status === 'pending') {
        filter.isApproved = false;
      } else if (req.query.status === 'approved') {
        filter.isApproved = true;
      }
    }

    const reviews = await Review.find(filter)
      .populate('property', 'title type location.city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    // Get counts for different statuses
    const statusCounts = await Review.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$isApproved',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      pending: statusCounts.find(s => s._id === false)?.count || 0,
      approved: statusCounts.find(s => s._id === true)?.count || 0
    };

    res.json({
      success: true,
      data: {
        reviews,
        counts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
};

// Admin: Approve/Reject review
const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    )
      .populate('user', 'name phone')
      .populate('property', 'title type location.city');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: {
        review
      }
    });

  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review status'
    });
  }
};

// Admin: Delete review
const deleteReviewAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
};

// Admin: Create review (auto-approved)
const createReviewAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment, property, reviewType } = req.body;

    const review = new Review({
      user: req.user._id,
      rating,
      comment,
      property: property || null,
      reviewType: reviewType || 'general',
      isApproved: true // Admin reviews are auto-approved
    });

    await review.save();
    await review.populate('user', 'name phone');
    
    if (property) {
      await review.populate('property', 'title type location.city');
    }

    res.status(201).json({
      success: true,
      message: 'Admin review created and approved successfully.',
      data: {
        review
      }
    });

  } catch (error) {
    console.error('Create admin review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating admin review'
    });
  }
};

module.exports = {
  getAllReviews,
  getPropertyReviews,
  createReview,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReviewAdmin,
  createReviewAdmin
};