const { validationResult } = require('express-validator');
const Property = require('../models/Property');
const fs = require('fs');
const path = require('path');
const { mockProperties } = require('../data/mockData');
const { correctedMockProperties } = require('../data/correctedMockProperties');

// Runtime array for dynamically created properties (when DB is not available)
let runtimeMockProperties = [];

// Helper function to use mock data when database is not available
const useMockData = (error) => {
  return error.name === 'MongooseServerSelectionError' || 
         error.code === 'ENOTFOUND' || 
         error.message.includes('connect');
};

// Get all properties with filtering and pagination
const getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let properties, total;
    
    try {
      // Try database first
      const filter = {};
      
      if (req.query.type) {
        filter.type = req.query.type;
      }
      
      if (req.query.city) {
        filter['location.city'] = new RegExp(req.query.city, 'i');
      }
      
      if (req.query.priceType) {
        filter['price.priceType'] = req.query.priceType;
      }
      
      if (req.query.minPrice || req.query.maxPrice) {
        filter['price.amount'] = {};
        if (req.query.minPrice) {
          filter['price.amount'].$gte = parseInt(req.query.minPrice);
        }
        if (req.query.maxPrice) {
          filter['price.amount'].$lte = parseInt(req.query.maxPrice);
        }
      }
      
      if (req.query.bedrooms) {
        filter['specifications.bedrooms'] = parseInt(req.query.bedrooms);
      }

      let sort = { createdAt: -1 };
      
      if (req.query.sortBy) {
        switch (req.query.sortBy) {
          case 'price-low':
            sort = { 'price.amount': 1 };
            break;
          case 'price-high':
            sort = { 'price.amount': -1 };
            break;
          case 'newest':
            sort = { createdAt: -1 };
            break;
          case 'oldest':
            sort = { createdAt: 1 };
            break;
          case 'views':
            sort = { views: -1 };
            break;
        }
      }

      properties = await Property.find(filter)
        .populate('createdBy', 'name phone')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      total = await Property.countDocuments(filter);
      
    } catch (dbError) {
      if (useMockData(dbError)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data - database not available');
        }
        
        // Combine static mock data with runtime created properties
        console.log('📊 Mock data retrieval: runtime properties:', runtimeMockProperties.length, 'static properties:', mockProperties.length);
        let filteredProperties = [...runtimeMockProperties, ...mockProperties];
        
        if (req.query.type) {
          filteredProperties = filteredProperties.filter(p => p.type === req.query.type);
        }
        
        if (req.query.city) {
          filteredProperties = filteredProperties.filter(p => 
            p.location.city.toLowerCase().includes(req.query.city.toLowerCase())
          );
        }
        
        if (req.query.priceType) {
          filteredProperties = filteredProperties.filter(p => p.price.priceType === req.query.priceType);
        }
        
        if (req.query.minPrice) {
          filteredProperties = filteredProperties.filter(p => p.price.amount >= parseInt(req.query.minPrice));
        }
        
        if (req.query.maxPrice) {
          filteredProperties = filteredProperties.filter(p => p.price.amount <= parseInt(req.query.maxPrice));
        }
        
        if (req.query.bedrooms) {
          filteredProperties = filteredProperties.filter(p => p.specifications.bedrooms === parseInt(req.query.bedrooms));
        }

        // Sort mock data
        if (req.query.sortBy) {
          switch (req.query.sortBy) {
            case 'price-low':
              filteredProperties.sort((a, b) => a.price.amount - b.price.amount);
              break;
            case 'price-high':
              filteredProperties.sort((a, b) => b.price.amount - a.price.amount);
              break;
            case 'newest':
              filteredProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              break;
            case 'oldest':
              filteredProperties.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
              break;
            case 'views':
              filteredProperties.sort((a, b) => b.views - a.views);
              break;
          }
        }
        
        total = filteredProperties.length;
        properties = filteredProperties.slice(skip, skip + limit);
        console.log('📊 Final results: total properties:', total, 'returned:', properties.length, 'page:', page);
      } else {
        throw dbError;
      }
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: page,
          totalPages,
          totalProperties: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
};

// Get featured properties
const getFeaturedProperties = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    let properties;
    
    try {
      properties = await Property.find({ isFeatured: true })
        .populate('createdBy', 'name phone')
        .sort({ views: -1 })
        .limit(limit);
    } catch (dbError) {
      if (useMockData(dbError)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data for featured properties');
        }
        properties = mockProperties
          .filter(p => p.isFeatured)
          .sort((a, b) => b.views - a.views)
          .slice(0, limit);
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      data: {
        properties
      }
    });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured properties',
      error: error.message
    });
  }
};

// Get single property by ID
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('getPropertyById called with ID:', id);
    
    let property;
    
    try {
      // Check if MongoDB is available first
      property = await Property.findById(id).populate('createdBy', 'name phone');
      
      if (property) {
        // Increment views only if it's a real Mongoose document
        try {
          property.views = (property.views || 0) + 1;
          await property.save();
        } catch (saveError) {
          console.log('Could not save view increment:', saveError.message);
          // Continue without saving view increment
        }
      }
    } catch (dbError) {
      console.log('Database error occurred:', dbError.name, dbError.message);
      
      // Use mock data for any database connection issues or invalid ObjectId
      if (useMockData(dbError) || dbError.name === 'CastError' || dbError.message.includes('ObjectId')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data for single property, reason:', dbError.name);
        }
        
        // Try corrected mock properties first, then regular mock properties
        const foundProperty = correctedMockProperties.find(p => p._id === id) || mockProperties.find(p => p._id === id);
        
        if (foundProperty) {
          // Create a copy with incremented views for mock data
          property = { 
            ...foundProperty, 
            views: (foundProperty.views || 0) + 1,
            // Ensure createdBy is properly formatted for mock data
            createdBy: foundProperty.createdBy || {
              _id: '507f1f77bcf86cd799439011',
              name: 'Admin User',
              phone: '9876543210'
            }
          };
          console.log('Found mock property:', property.title);
        } else {
          console.log('Property not found in mock data, ID:', id);
        }
      } else {
        // Don't return 422 for database connection issues
        console.error('Database connection error:', dbError);
        // Fall back to mock data
        const foundProperty = correctedMockProperties.find(p => p._id === id) || mockProperties.find(p => p._id === id);
        
        if (foundProperty) {
          property = { 
            ...foundProperty, 
            views: (foundProperty.views || 0) + 1,
            createdBy: foundProperty.createdBy || {
              _id: '507f1f77bcf86cd799439011',
              name: 'Admin User',
              phone: '9876543210'
            }
          };
          console.log('Using mock data due to database error:', property.title);
        }
      }
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: {
        property
      }
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message
    });
  }
};

// Create new property (Admin only)
const createProperty = async (req, res) => {
  try {
    console.log('🔍 Create property request received');
    console.log('📁 Files received:', req.files ? req.files.length : 0);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation errors:', errors.array());
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + errorMessages.join(', '),
        errors: errors.array()
      });
    }

    // Transform frontend data to match backend model
    // Handle both JSON and FormData
    const isFormData = req.headers['content-type']?.includes('multipart/form-data');
    
    let title, description, propertyType, price, location, features, amenities, images, status, isFeatured;
    
    if (isFormData) {
      // Extract data from FormData
      title = req.body.title;
      description = req.body.description;
      propertyType = req.body.propertyType;
      price = {
        amount: parseFloat(req.body['price[amount]']),
        priceType: req.body['price[priceType]']
      };
      location = {
        address: req.body['location[address]'] || '',
        area: req.body['location[area]'],
        city: req.body['location[city]'] || 'Vadodara',
        state: req.body['location[state]'] || 'Gujarat',
        pincode: req.body['location[pincode]'] || '390001',
        coordinates: {
          latitude: parseFloat(req.body['location[coordinates][latitude]']) || 22.3072,
          longitude: parseFloat(req.body['location[coordinates][longitude]']) || 73.1812
        }
      };
      features = {
        bedrooms: parseInt(req.body['specifications[bedrooms]']) || 0,
        bathrooms: parseInt(req.body['specifications[bathrooms]']) || 0,
        area: parseFloat(req.body['specifications[area][value]']),
        areaUnit: req.body['specifications[area][unit]'],
        parking: parseInt(req.body['specifications[parking]']) || 0,
        furnished: req.body['specifications[furnished]'] || 'Unfurnished'
      };
      amenities = [];
      // Extract amenities array from FormData
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('amenities[')) {
          amenities.push(req.body[key]);
        }
      });
      status = req.body.status || 'available';
      isFeatured = req.body.isFeatured === 'true';
      images = []; // For FormData, images come from req.files, not req.body
    } else {
      // Extract from JSON body
      ({
        title,
        description,
        propertyType,
        price,
        location,
        features,
        amenities,
        images,
        status,
        isFeatured
      } = req.body);
    }

    console.log('🔍 Processing property creation...');

    const propertyData = {
      title: title || 'Default Property Title',
      description: description || 'Default property description',
      type: propertyType || 'Villa', // Frontend sends 'propertyType', backend expects 'type'
      location: {
        area: location?.area || 'Default Area',
        address: location?.address || '',
        city: location?.city || 'Vadodara',
        state: location?.state || 'Gujarat',
        pincode: location?.pincode || '390001',
        coordinates: {
          latitude: location?.coordinates?.latitude || 22.3072,
          longitude: location?.coordinates?.longitude || 73.1812
        },
        fullAddress: location?.fullAddress || ''
      },
      price: {
        amount: price?.amount || 1000000,
        priceType: price?.priceType || 'sale'
      },
      specifications: {
        bedrooms: features?.bedrooms || 0,
        bathrooms: features?.bathrooms || 0,
        area: {
          value: features?.area || 1000,
          unit: features?.areaUnit || 'sqft'
        },
        parking: features?.parking || 0,
        furnished: features?.furnished || 'Unfurnished'
      },
      images: (() => {
        // Handle uploaded files
        if (req.files && req.files.length > 0) {
          return req.files.map((file, index) => ({
            url: `/uploads/${file.filename}`,
            alt: `Property image ${index + 1}`,
            isPrimary: index === 0
          }));
        }
        // Handle image URLs from request body (fallback)
        if (images && Array.isArray(images)) {
          return images.map((img, index) => ({
            url: img.url || img,
            alt: img.alt || `Property image ${index + 1}`,
            isPrimary: index === 0
          }));
        }
        return [];
      })(),
      amenities: amenities || [],
      status: (status || 'Available').toLowerCase(),
      isFeatured: isFeatured || false,
      createdBy: req.user.id
    };

    console.log('📝 Creating property:', propertyData.title, 'with', propertyData.images.length, 'images');
    
    let property;
    
    try {
      property = new Property(propertyData);
      await property.save();
      console.log('✅ Property created successfully:', property._id);
      await property.populate('createdBy', 'name phone');
    } catch (dbError) {
      console.error('Database error:', dbError);
      if (useMockData(dbError)) {
        console.log('🔧 Using mock data for property creation...');
        
        // Create mock property
        property = {
          _id: Date.now().toString(),
          ...propertyData,
          createdAt: new Date(),
          updatedAt: new Date(),
          views: 0
        };
        
        // Add to runtime mock properties array
        runtimeMockProperties.unshift(property);
        console.log('✅ Mock property added to runtime array');
        console.log('📊 Total runtime properties:', runtimeMockProperties.length);
        
      } else {
        throw dbError;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: {
        property
      }
    });
  } catch (error) {
    console.error('❌ Error creating property:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update property (Admin only)
const updateProperty = async (req, res) => {
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
    const updateData = { ...req.body };

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: `Property image ${index + 1}`,
        isPrimary: index === 0 && !updateData.images
      }));

      if (updateData.images) {
        updateData.images = [...updateData.images, ...newImages];
      } else {
        updateData.images = newImages;
      }
    }

    let property;
    
    try {
      property = await Property.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name phone');
    } catch (dbError) {
      if (useMockData(dbError)) {
        // For demo purposes, find and update mock property
        const mockIndex = mockProperties.findIndex(p => p._id === id);
        if (mockIndex !== -1) {
          property = { ...mockProperties[mockIndex], ...updateData, updatedAt: new Date() };
          mockProperties[mockIndex] = property;
          console.log('Mock property updated (database not available)');
        }
      } else {
        throw dbError;
      }
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: {
        property
      }
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message
    });
  }
};

// Delete property (Admin only)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    let property;
    
    try {
      property = await Property.findById(id);
      
      if (property) {
        // Delete associated images
        if (property.images && property.images.length > 0) {
          property.images.forEach(image => {
            const imagePath = path.join(__dirname, '..', 'public', image.url);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          });
        }
        
        await Property.findByIdAndDelete(id);
      }
    } catch (dbError) {
      if (useMockData(dbError)) {
        // For demo purposes, remove from mock data
        const mockIndex = mockProperties.findIndex(p => p._id === id);
        if (mockIndex !== -1) {
          property = mockProperties[mockIndex];
          mockProperties.splice(mockIndex, 1);
          console.log('Mock property deleted (database not available)');
        }
      } else {
        throw dbError;
      }
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message
    });
  }
};

// Toggle property status (admin only)
const togglePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    let property;
    try {
      property = await Property.findById(id);
      if (property) {
        property.isActive = !property.isActive;
        await property.save();
      }
    } catch (dbError) {
      if (useMockData(dbError)) {
        // Mock implementation
        const mockProperty = mockProperties.find(p => p._id === id);
        if (mockProperty) {
          property = mockProperty;
          mockProperty.isActive = !mockProperty.isActive;
        }
      } else {
        throw dbError;
      }
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: `Property ${property.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { property }
    });
  } catch (error) {
    console.error('Error toggling property status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling property status',
      error: error.message
    });
  }
};

// Get properties by type
const getPropertiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let properties, total;
    try {
      properties = await Property.find({ type, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await Property.countDocuments({ type, isActive: true });
    } catch (dbError) {
      if (useMockData(dbError)) {
        const filteredProperties = mockProperties.filter(p => p.type === type);
        total = filteredProperties.length;
        properties = filteredProperties.slice(skip, skip + limit);
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      message: `${type} properties retrieved successfully`,
      data: {
        properties,
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
    console.error('Error getting properties by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving properties by type',
      error: error.message
    });
  }
};

// Search properties
const searchProperties = async (req, res) => {
  try {
    const { q, type, minPrice, maxPrice, city } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let searchQuery = { isActive: true };

    if (q) {
      searchQuery.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } }
      ];
    }

    if (type) {
      searchQuery.type = type;
    }

    if (minPrice || maxPrice) {
      searchQuery['price.amount'] = {};
      if (minPrice) searchQuery['price.amount'].$gte = parseInt(minPrice);
      if (maxPrice) searchQuery['price.amount'].$lte = parseInt(maxPrice);
    }

    if (city) {
      searchQuery['location.city'] = { $regex: city, $options: 'i' };
    }

    let properties, total;
    try {
      properties = await Property.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      total = await Property.countDocuments(searchQuery);
    } catch (dbError) {
      if (useMockData(dbError)) {
        // Mock search implementation
        let filteredProperties = mockProperties.filter(p => {
          let matches = true;
          if (q) {
            matches = p.title.toLowerCase().includes(q.toLowerCase()) ||
                     p.description.toLowerCase().includes(q.toLowerCase());
          }
          if (type && matches) matches = p.type === type;
          if (city && matches) matches = p.location.city.toLowerCase().includes(city.toLowerCase());
          return matches;
        });
        total = filteredProperties.length;
        properties = filteredProperties.slice(skip, skip + limit);
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      message: 'Property search completed',
      data: {
        properties,
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
    console.error('Error searching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching properties',
      error: error.message
    });
  }
};

// Get property statistics
const getPropertyStats = async (req, res) => {
  try {
    let stats;
    try {
      const pipeline = [
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            averagePrice: { $avg: '$price.amount' },
            minPrice: { $min: '$price.amount' },
            maxPrice: { $max: '$price.amount' }
          }
        }
      ];
      
      stats = await Property.aggregate(pipeline);
    } catch (dbError) {
      if (useMockData(dbError)) {
        // Mock stats implementation
        const types = {};
        mockProperties.forEach(p => {
          if (!types[p.type]) {
            types[p.type] = { count: 0, prices: [] };
          }
          types[p.type].count++;
          types[p.type].prices.push(p.price.amount);
        });
        
        stats = Object.keys(types).map(type => ({
          _id: type,
          count: types[type].count,
          averagePrice: types[type].prices.reduce((a, b) => a + b, 0) / types[type].prices.length,
          minPrice: Math.min(...types[type].prices),
          maxPrice: Math.max(...types[type].prices)
        }));
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      message: 'Property statistics retrieved successfully',
      data: { stats }
    });
  } catch (error) {
    console.error('Error getting property stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving property statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  togglePropertyStatus,
  getPropertiesByType,
  searchProperties,
  getPropertyStats
};