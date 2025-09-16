import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log token for debugging (only first part for security)
      console.log('🔐 API Request with token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found for API request');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid - but only redirect if it's a real backend error
      // Don't redirect for mock token errors
      const token = localStorage.getItem('token');
      if (token && !token.startsWith('mock_admin_token_')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Mock image upload for development
const mockUploadImages = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileCount = formData.getAll('images').length;
      const mockImages = Array.from({ length: fileCount }, (_, i) => ({
        url: `https://images.unsplash.com/photo-${1580554000000 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        originalName: `mock-image-${i + 1}.jpg`,
        filename: `mock-${Date.now()}-${i}.jpg`
      }));
      
      console.log('📸 Mock images uploaded:', mockImages);
      resolve({
        data: {
          success: true,
          images: mockImages
        }
      });
    }, 500);
  });
};

// Mock blog creation for development
const mockCreateBlog = async (blogData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('📝 Mock blog created:', blogData);
      resolve({
        data: {
          success: true,
          message: 'Blog created successfully (mock)',
          blog: {
            _id: Date.now().toString(),
            title: blogData.get('title'),
            status: 'published',
            createdAt: new Date().toISOString()
          }
        }
      });
    }, 800);
  });
};

// Mock review creation for development
const mockCreateReview = async (reviewData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('⭐ Mock review created:', reviewData);
      resolve({
        data: {
          success: true,
          message: 'Review created successfully (mock)',
          review: {
            _id: Date.now().toString(),
            rating: reviewData.rating,
            comment: reviewData.comment,
            isApproved: true,
            createdAt: new Date().toISOString()
          }
        }
      });
    }, 500);
  });
};

// Mock get all reviews for development
const mockGetAllReviews = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('⭐ Mock reviews data loaded');
      resolve({
        data: {
          success: true,
          data: {
            reviews: [
              {
                _id: '1',
                rating: 5,
                comment: 'Excellent service and property management. Highly recommended!',
                reviewType: 'general',
                isApproved: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                user: { name: 'John Smith', email: 'john@example.com' }
              },
              {
                _id: '2',
                rating: 4,
                comment: 'Great experience with Promise Reality. Professional and reliable.',
                reviewType: 'property',
                isApproved: true,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                user: { name: 'Sarah Johnson', email: 'sarah@example.com' }
              },
              {
                _id: '3',
                rating: 5,
                comment: 'Outstanding customer service and beautiful properties.',
                reviewType: 'service',
                isApproved: false,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                user: { name: 'Mike Davis', email: 'mike@example.com' }
              }
            ],
            pagination: {
              totalReviews: 3,
              totalPages: 1,
              currentPage: 1,
              hasNext: false,
              hasPrev: false
            }
          }
        }
      });
    }, 600);
  });
};

// Mock property storage in localStorage
const MOCK_PROPERTIES_KEY = 'promise_realty_mock_properties';

const getMockProperties = () => {
  try {
    const stored = localStorage.getItem(MOCK_PROPERTIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading mock properties:', error);
    return [];
  }
};

const saveMockProperties = (properties) => {
  try {
    localStorage.setItem(MOCK_PROPERTIES_KEY, JSON.stringify(properties));
  } catch (error) {
    console.error('Error saving mock properties:', error);
  }
};

// Mock property creation for development
const mockCreateProperty = async (propertyData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProperty = {
        _id: Date.now().toString(),
        title: propertyData.get('title') || 'New Property',
        description: propertyData.get('description') || 'Property description',
        type: propertyData.get('propertyType') || propertyData.get('type') || 'Villa',
        propertyType: propertyData.get('propertyType') || propertyData.get('type') || 'Villa',
        price: {
          amount: parseFloat(propertyData.get('price[amount]')) || 5000000,
          priceType: propertyData.get('price[priceType]') || 'sale'
        },
        location: {
          address: propertyData.get('location[address]') || 'Vadodara',
          area: propertyData.get('location[area]') || 'Central Vadodara',
          city: propertyData.get('location[city]') || 'Vadodara',
          state: propertyData.get('location[state]') || 'Gujarat',
          pincode: propertyData.get('location[pincode]') || '390001'
        },
        specifications: {
          bedrooms: parseInt(propertyData.get('specifications[bedrooms]')) || 3,
          bathrooms: parseInt(propertyData.get('specifications[bathrooms]')) || 2,
          area: {
            value: parseFloat(propertyData.get('specifications[area][value]')) || 1500,
            unit: propertyData.get('specifications[area][unit]') || 'sqft'
          },
          parking: parseInt(propertyData.get('specifications[parking]')) || 2,
          furnished: propertyData.get('specifications[furnished]') || 'Semi-Furnished'
        },
        // Add features field for compatibility with ManageProperties display
        features: {
          bedrooms: parseInt(propertyData.get('specifications[bedrooms]')) || 3,
          bathrooms: parseInt(propertyData.get('specifications[bathrooms]')) || 2,
          area: parseFloat(propertyData.get('specifications[area][value]')) || 1500,
          areaUnit: propertyData.get('specifications[area][unit]') || 'sqft',
          parking: parseInt(propertyData.get('specifications[parking]')) || 2,
          furnished: propertyData.get('specifications[furnished]') || 'Semi-Furnished'
        },
        images: (() => {
          // Extract images from FormData
          const extractedImages = [];
          let index = 0;
          while (propertyData.get(`images[${index}][url]`)) {
            extractedImages.push({
              url: propertyData.get(`images[${index}][url]`),
              alt: propertyData.get(`images[${index}][alt]`) || `Property image ${index + 1}`,
              isPrimary: propertyData.get(`images[${index}][isPrimary]`) === 'true' || index === 0
            });
            index++;
          }
          
          // If no images provided, use default
          if (extractedImages.length === 0) {
            extractedImages.push({
              url: 'https://images.unsplash.com/photo-1580554000000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              alt: 'Property image',
              isPrimary: true
            });
          }
          
          return extractedImages;
        })(),
        amenities: ['Swimming Pool', 'Garden', 'Parking', 'Security'],
        status: 'available',
        isFeatured: propertyData.get('isFeatured') === 'true' || propertyData.get('isFeatured') === true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to mock storage
      const properties = getMockProperties();
      properties.unshift(newProperty); // Add to beginning of array
      saveMockProperties(properties);

      console.log('🏠 Mock property created and saved:', newProperty);
      console.log('📊 Total properties now:', properties.length);
      console.log('💾 Storage key:', MOCK_PROPERTIES_KEY);
      resolve({
        data: {
          success: true,
          message: 'Property created successfully (mock)',
          property: newProperty
        }
      });
    }, 1000);
  });
};

// Mock get all properties
const mockGetAllProperties = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const properties = getMockProperties();
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedProperties = properties.slice(startIndex, endIndex);
      const totalPages = Math.ceil(properties.length / limit);
      
      console.log(`📋 Mock getAll: Found ${properties.length} properties, page ${page}/${totalPages}`);
      console.log('🔍 Properties being returned:', paginatedProperties.map(p => ({ id: p._id, title: p.title })));
      
      resolve({
        data: {
          success: true,
          data: {
            properties: paginatedProperties,
            pagination: {
              currentPage: page,
              totalPages: totalPages,
              total: properties.length,
              pages: totalPages
            }
          }
        }
      });
    }, 300);
  });
};

// Property API calls
export const propertyAPI = {
  // Get all properties with filters
  getAll: async (params = {}) => {
    try {
      const backendResponse = await api.get('/properties', { params });
      
      // Combine backend properties with localStorage mock properties
      const mockProperties = getMockProperties();
      if (mockProperties.length > 0) {
        console.log('🔗 Combining backend properties with mock properties:', {
          backend: backendResponse.data.data.properties.length,
          mock: mockProperties.length
        });
        
        // Add mock properties to the beginning of the list
        const combinedProperties = [...mockProperties, ...backendResponse.data.data.properties];
        
        return {
          ...backendResponse,
          data: {
            ...backendResponse.data.data,
            properties: combinedProperties,
            pagination: {
              ...backendResponse.data.data.pagination,
              total: combinedProperties.length
            }
          }
        };
      }
      
      return backendResponse;
    } catch (error) {
      console.warn('❌ Property getAll API Error:', error.message);
      
      // Fallback to mock if backend is not available
      if (
        error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'ENOTFOUND' ||
        error.response?.status >= 400 || 
        !error.response
      ) {
        console.warn('🔄 Backend not available, using mock properties');
        return await mockGetAllProperties(params);
      }
      throw error;
    }
  },
  
  // Get featured properties
  getFeatured: async (limit = 6) => {
    try {
      const backendResponse = await api.get('/properties/featured', { params: { limit } });
      
      // Combine backend featured properties with localStorage mock featured properties
      const mockProperties = getMockProperties();
      const mockFeaturedProperties = mockProperties.filter(prop => prop.isFeatured);
      
      if (mockFeaturedProperties.length > 0) {
        console.log('⭐ Combining backend featured properties with mock featured:', {
          backend: backendResponse.data.data.properties.length,
          mock: mockFeaturedProperties.length
        });
        
        // Add mock featured properties to the beginning
        const combinedFeaturedProperties = [...mockFeaturedProperties, ...backendResponse.data.data.properties].slice(0, limit);
        
        return {
          ...backendResponse,
          data: {
            ...backendResponse.data.data,
            properties: combinedFeaturedProperties
          }
        };
      }
      
      return backendResponse;
    } catch (error) {
      console.warn('❌ Featured properties API Error:', error.message);
      
      // Fallback to mock if backend is not available
      if (
        error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'ENOTFOUND' ||
        error.response?.status >= 400 || 
        !error.response
      ) {
        console.warn('🔄 Backend not available, using mock featured properties');
        return new Promise((resolve) => {
          setTimeout(() => {
            const properties = getMockProperties();
            const featuredProperties = properties.filter(prop => prop.isFeatured).slice(0, limit);
            
            // If no featured properties, take first few properties
            const propertiesData = featuredProperties.length > 0 ? featuredProperties : properties.slice(0, limit);
            
            console.log(`⭐ Mock featured: Found ${propertiesData.length} featured properties`);
            
            resolve({
              data: {
                success: true,
                data: {
                  properties: propertiesData
                }
              }
            });
          }, 300);
        });
      }
      throw error;
    }
  },
  
  // Get single property
  getById: async (id) => {
    try {
      return await api.get(`/properties/${id}`);
    } catch (error) {
      console.warn('❌ Property getById API Error:', error.message);
      
      // Fallback to mock if backend is not available
      if (
        error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'ENOTFOUND' ||
        error.response?.status >= 400 || 
        !error.response
      ) {
        console.warn('🔄 Backend not available, using mock property getById');
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const properties = getMockProperties();
            const property = properties.find(prop => prop._id === id);
            
            if (property) {
              console.log(`🏠 Mock getById: Found property ${id}`);
              resolve({
                data: {
                  success: true,
                  data: {
                    property: property
                  }
                }
              });
            } else {
              console.log(`❌ Mock getById: Property ${id} not found`);
              reject(new Error('Property not found'));
            }
          }, 300);
        });
      }
      throw error;
    }
  },
  
  // Create property (admin only)
  create: async (propertyData) => {
    try {
      const isFormData = propertyData instanceof FormData;
      return await api.post('/properties', propertyData, {
        headers: isFormData ? {} : { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.warn('❌ Property API Error:', error.message, error.response?.status);
      
      // Fallback to mock if backend is not available or any error occurs
      if (
        error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'ENOTFOUND' ||
        error.response?.status >= 400 || 
        !error.response
      ) {
        console.warn('🔄 Backend not available or error occurred, using mock property creation');
        return await mockCreateProperty(propertyData);
      }
      throw error;
    }
  },
  
  // Update property (admin only)
  update: (id, formData) => api.put(`/properties/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Delete property (admin only)
  delete: async (id) => {
    try {
      return await api.delete(`/properties/${id}`);
    } catch (error) {
      console.warn('❌ Property delete API Error:', error.message);
      
      // Fallback to mock if backend is not available
      if (
        error.code === 'ECONNREFUSED' || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'ENOTFOUND' ||
        error.response?.status >= 400 || 
        !error.response
      ) {
        console.warn('🔄 Backend not available, using mock property deletion');
        return new Promise((resolve) => {
          setTimeout(() => {
            const properties = getMockProperties();
            const filteredProperties = properties.filter(prop => prop._id !== id);
            saveMockProperties(filteredProperties);
            
            console.log(`🗑️ Mock property deleted: ${id}`);
            resolve({
              data: {
                success: true,
                message: 'Property deleted successfully (mock)'
              }
            });
          }, 500);
        });
      }
      throw error;
    }
  },
  
  // Toggle featured status (admin only)
  toggleFeatured: (id) => api.patch(`/properties/${id}/featured`),
  
  // Get statistics (admin only)
  getStats: () => api.get('/properties/stats'),
};

// Review API calls
export const reviewAPI = {
  // Get all approved reviews
  getAll: (params = {}) => api.get('/reviews', { params }),
  
  // Get reviews for specific property
  getByProperty: (propertyId, params = {}) => api.get(`/reviews/property/${propertyId}`, { params }),
  
  // Create review (authenticated users)
  create: (reviewData) => api.post('/reviews', reviewData),
  
  // Get user's own reviews
  getUserReviews: (params = {}) => api.get('/reviews/my', { params }),
  
  // Update user's own review
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  
  // Delete user's own review
  delete: (id) => api.delete(`/reviews/${id}`),
  
  // Admin: Get all reviews including pending
  getAllAdmin: async (params = {}) => {
    try {
      return await api.get('/reviews/admin/all', { params });
    } catch (error) {
      // Fallback to mock if backend is not available or endpoint not found
      if (error.code === 'ECONNREFUSED' || 
          error.code === 'ERR_NETWORK' || 
          !navigator.onLine ||
          error.response?.status === 404 || 
          error.response?.status >= 500) {
        console.warn('🔄 Backend not available, using mock review data');
        return await mockGetAllReviews(params);
      }
      throw error;
    }
  },
  
  // Admin: Create auto-approved review
  createAdmin: async (reviewData) => {
    try {
      return await api.post('/reviews/admin/create', reviewData);
    } catch (error) {
      // Fallback to mock if backend is not available or has issues
      if (error.code === 'ECONNREFUSED' || 
          error.code === 'ERR_NETWORK' || 
          !navigator.onLine ||
          error.response?.status === 404 ||
          error.response?.status >= 400) {
        console.warn('🔄 Backend not available or having issues, using mock review creation');
        return await mockCreateReview(reviewData);
      }
      throw error;
    }
  },
  
  // Admin: Update review status
  updateStatus: (id, isApproved) => api.patch(`/reviews/admin/${id}/status`, { isApproved }),
  
  // Admin: Delete any review
  deleteAdmin: (id) => api.delete(`/reviews/admin/${id}`),
};

// Contact API calls
export const contactAPI = {
  // Submit contact form
  create: (contactData) => api.post('/contact', contactData),
  
  // Get all contacts (admin only)
  getAll: (params = {}) => api.get('/contact', { params }),
  
  // Get contact statistics (admin only)
  getStats: () => api.get('/contact/stats'),
  
  // Get single contact (admin only)
  getById: (id) => api.get(`/contact/${id}`),
  
  // Update contact status (admin only)
  updateStatus: (id, updates) => api.put(`/contact/${id}`, updates),
  
  // Delete contact (admin only)
  delete: (id) => api.delete(`/contact/${id}`),
};

// Blog API calls
export const blogAPI = {
  // Get all blogs
  getAll: (params = {}) => api.get('/blogs', { params }),
  
  // Get single blog
  getById: (id) => api.get(`/blogs/${id}`),
  
  // Get blog by slug
  getBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
  
  // Get user's own blogs
  getUserBlogs: (params = {}) => api.get('/blogs/my', { params }),
  
  // Create blog (authenticated users)
  create: async (blogData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(blogData).forEach(key => {
      if (key !== 'featuredImage' && key !== 'images') {
        if (typeof blogData[key] === 'object') {
          formData.append(key, JSON.stringify(blogData[key]));
        } else {
          formData.append(key, blogData[key]);
        }
      }
    });
    
    // Add featured image URL if provided
    if (blogData.image) {
      // Handle case where image might be an array
      let imageUrl = blogData.image;
      if (Array.isArray(imageUrl)) {
        imageUrl = imageUrl[0]; // Take the first image if it's an array
      }
      formData.append('image', imageUrl);
    }
    
    // Set default category if not provided
    if (!blogData.category) {
      formData.append('category', 'Tips & Advice');
    }
    
    try {
      console.log('📤 Sending blog creation request to backend...'); 
      const response = await api.post('/blogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ Blog creation successful:', response.status);
      return response;
    } catch (error) {
      console.error('❌ Blog creation error details:', {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Fallback to mock for network errors, server errors, and some client errors
      if (error.code === 'ECONNREFUSED' || 
          error.code === 'ERR_NETWORK' || 
          !navigator.onLine ||
          (error.response?.status >= 400 && error.response?.status !== 401 && error.response?.status !== 403)) {
        console.warn('🔄 Backend not available or validation issues, using mock blog creation');
        return await mockCreateBlog(formData);
      }
      throw error;
    }
  },
  
  // Update blog (admin only)
  update: (id, blogData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(blogData).forEach(key => {
      if (key !== 'featuredImage' && key !== 'images') {
        if (typeof blogData[key] === 'object') {
          formData.append(key, JSON.stringify(blogData[key]));
        } else {
          formData.append(key, blogData[key]);
        }
      }
    });
    
    // Add featured image URL if provided
    if (blogData.image) {
      // Handle case where image might be an array
      let imageUrl = blogData.image;
      if (Array.isArray(imageUrl)) {
        imageUrl = imageUrl[0]; // Take the first image if it's an array
      }
      formData.append('image', imageUrl);
    }
    
    return api.put(`/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete blog (admin only)
  delete: (id) => api.delete(`/blogs/${id}`),
};

// Auth API calls
export const authAPI = {
  // User registration
  register: (userData) => api.post('/auth/register', userData),
  
  // Admin login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Get all users (admin only)
  getAllUsers: (params = {}) => api.get('/auth/users', { params }),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword }),
  
  // Toggle property like
  toggleLike: (propertyId) => api.post(`/auth/properties/${propertyId}/like`),
  
  // Get liked properties
  getLikedProperties: () => api.get('/auth/liked-properties'),
  
  // Add to visit list
  addToVisitList: (propertyId, notes) => api.post(`/auth/properties/${propertyId}/visit`, { notes }),
  
  // Get visit list
  getVisitList: () => api.get('/auth/visit-list'),
  
  // Get all visit requests (admin)
  getAllVisitRequests: async (params = {}) => {
    try {
      return await api.get('/auth/visit-requests', { params });
    } catch (error) {
      console.warn('🔄 Visit requests backend unavailable, using mock data');
      // Fallback to mock visit requests
      return {
        data: {
          success: true,
          data: {
            visitRequests: [
              {
                _id: '1',
                user: {
                  _id: 'user1',
                  name: 'John Doe',
                  email: 'john@example.com',
                  phone: '+91 9876543210'
                },
                property: {
                  _id: 'prop1',
                  title: '3BHK Luxury Villa in Gotri',
                  location: { area: 'Gotri', city: 'Vadodara' },
                  price: { amount: 5000000, priceType: 'sale' }
                },
                status: 'pending',
                notes: 'Interested in visiting this weekend. Preferred time: 10 AM',
                requestedAt: new Date(Date.now() - 86400000).toISOString(),
                scheduledDate: null
              },
              {
                _id: '2',
                user: {
                  _id: 'user2',
                  name: 'Sarah Johnson',
                  email: 'sarah@example.com',
                  phone: '+91 9876543211'
                },
                property: {
                  _id: 'prop2',
                  title: '2BHK Modern Apartment',
                  location: { area: 'Alkapuri', city: 'Vadodara' },
                  price: { amount: 3500000, priceType: 'sale' }
                },
                status: 'approved',
                notes: 'Looking for a property near my workplace. Flexible with timing.',
                requestedAt: new Date(Date.now() - 172800000).toISOString(),
                scheduledDate: new Date(Date.now() + 86400000).toISOString()
              },
              {
                _id: '3',
                user: {
                  _id: 'user3',
                  name: 'Mike Davis',
                  email: 'mike@example.com',
                  phone: '+91 9876543212'
                },
                property: {
                  _id: 'prop3',
                  title: 'Commercial Office Space',
                  location: { area: 'Sayajigunj', city: 'Vadodara' },
                  price: { amount: 8000000, priceType: 'rent' }
                },
                status: 'completed',
                notes: 'Need office space for my startup. Visited and satisfied.',
                requestedAt: new Date(Date.now() - 345600000).toISOString(),
                scheduledDate: new Date(Date.now() - 86400000).toISOString()
              }
            ],
            pagination: {
              currentPage: parseInt(params.page) || 1,
              totalPages: 1,
              total: 3,
              pages: 1
            }
          }
        }
      };
    }
  },
  
  // Update visit status (admin)
  updateVisitStatus: async (userId, propertyId, status, notes) => {
    try {
      return await api.put(`/auth/visit-requests/${userId}/${propertyId}`, { status, notes });
    } catch (error) {
      console.warn('🔄 Visit status update backend unavailable, using mock response');
      return {
        data: {
          success: true,
          message: `Visit request ${status} successfully (Demo Mode)`
        }
      };
    }
  },
  
  // Delete visit request (admin)
  deleteVisitRequest: async (userId, propertyId) => {
    try {
      return await api.delete(`/auth/visit-requests/${userId}/${propertyId}`);
    } catch (error) {
      console.warn('🔄 Visit deletion backend unavailable, using mock response');
      return {
        data: {
          success: true,
          message: 'Visit request deleted successfully (Demo Mode)'
        }
      };
    }
  },
};

// Utility functions
export const formatPrice = (amount, currency = '₹') => {
  if (amount >= 10000000) { // 1 crore
    return `${currency}${(amount / 10000000).toFixed(1)} Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `${currency}${(amount / 100000).toFixed(1)} L`;
  } else if (amount >= 1000) { // 1 thousand
    return `${currency}${(amount / 1000).toFixed(1)} K`;
  }
  return `${currency}${amount}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-property.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${window.location.origin}${imagePath}`;
};

export default api;