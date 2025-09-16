const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['Villa', 'Apartment', 'Plot', 'Bungalow', 'Flat', 'Penthouse', 'Studio', 'Duplex', 'Farmhouse'],
    default: 'Apartment'
  },
  location: {
    area: {
      type: String,
      required: [true, 'Area is required'],
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      default: 'Vadodara'
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      default: 'Gujarat'
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode']
    },
    coordinates: {
      latitude: {
        type: Number,
        default: 22.3072
      },
      longitude: {
        type: Number,
        default: 73.1812
      }
    },
    fullAddress: {
      type: String,
      trim: true
    }
  },
  price: {
    amount: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: '₹'
    },
    priceType: {
      type: String,
      enum: ['sale', 'rent'],
      required: [true, 'Price type is required']
    },
    rentPeriod: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    }
  },
  specifications: {
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative'],
      default: 0
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
      default: 0
    },
    area: {
      value: {
        type: Number,
        required: [true, 'Area is required'],
        min: [1, 'Area must be at least 1']
      },
      unit: {
        type: String,
        enum: ['sqft', 'sqm', 'acres', 'bigha'],
        default: 'sqft'
      }
    },
    parking: {
      type: Number,
      min: [0, 'Parking cannot be negative'],
      default: 0
    },
    furnished: {
      type: String,
      enum: ['Fully-Furnished', 'Semi-Furnished', 'Unfurnished'],
      default: 'Unfurnished'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Property image'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'under-negotiation'],
    default: 'available'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  contactInfo: {
    agentName: String,
    agentPhone: String,
    agentEmail: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search optimization
propertySchema.index({ 
  title: 'text', 
  description: 'text',
  'location.city': 'text',
  'location.address': 'text'
});

propertySchema.index({ 'location.city': 1, type: 1, 'price.priceType': 1 });
propertySchema.index({ isFeatured: -1, createdAt: -1 });

// Virtual for formatted price
propertySchema.virtual('formattedPrice').get(function() {
  const price = this.price.amount;
  if (price >= 10000000) { // 1 crore
    return `${this.price.currency}${(price / 10000000).toFixed(1)} Cr`;
  } else if (price >= 100000) { // 1 lakh
    return `${this.price.currency}${(price / 100000).toFixed(1)} L`;
  } else if (price >= 1000) { // 1 thousand
    return `${this.price.currency}${(price / 1000).toFixed(1)} K`;
  }
  return `${this.price.currency}${price}`;
});

// Method to increment views
propertySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Ensure virtual fields are serialized
propertySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Property', propertySchema);