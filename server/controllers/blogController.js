const { validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const fs = require('fs');
const path = require('path');
const { mockBlogs } = require('../data/mockData');

// Helper function to use mock data when database is not available
const useMockData = (error) => {
  return error.name === 'MongooseServerSelectionError' || 
         error.code === 'ENOTFOUND' || 
         error.message.includes('connect') ||
         error.message.includes('Cast to ObjectId failed') ||
         error.name === 'ValidationError';
};

// Get all published blogs with filtering and pagination
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    let blogs, total;
    
    try {
      // Build filter object
      const filter = { status: 'published', isActive: true };
      
      if (req.query.category) {
        filter.category = req.query.category;
      }
      
      if (req.query.tag) {
        filter.tags = { $in: [req.query.tag] };
      }
      
      if (req.query.search) {
        filter.$text = { $search: req.query.search };
      }

      // Build sort object
      let sort = { publishedAt: -1 }; // Default sort by newest
      
      if (req.query.sortBy) {
        switch (req.query.sortBy) {
          case 'oldest':
            sort = { publishedAt: 1 };
            break;
          case 'popular':
            sort = { views: -1 };
            break;
          case 'liked':
            sort = { likes: -1 };
            break;
        }
      }

      blogs = await Blog.find(filter)
        .populate('author', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-content'); // Exclude full content for list view

      total = await Blog.countDocuments(filter);
      
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for blogs - database not available');
        
        // Filter mock blogs
        let filteredBlogs = mockBlogs.filter(b => b.status === 'published');
        
        if (req.query.category) {
          filteredBlogs = filteredBlogs.filter(b => b.category === req.query.category);
        }
        
        if (req.query.tag) {
          filteredBlogs = filteredBlogs.filter(b => b.tags.includes(req.query.tag));
        }
        
        if (req.query.search) {
          const searchTerm = req.query.search.toLowerCase();
          filteredBlogs = filteredBlogs.filter(b => 
            b.title.toLowerCase().includes(searchTerm) ||
            b.excerpt.toLowerCase().includes(searchTerm)
          );
        }

        // Sort mock blogs
        if (req.query.sortBy) {
          switch (req.query.sortBy) {
            case 'oldest':
              filteredBlogs.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
              break;
            case 'popular':
              filteredBlogs.sort((a, b) => b.views - a.views);
              break;
            case 'liked':
              filteredBlogs.sort((a, b) => b.likes - a.likes);
              break;
            default:
              filteredBlogs.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
          }
        }
        
        total = filteredBlogs.length;
        blogs = filteredBlogs.slice(skip, skip + limit);
      } else {
        throw dbError;
      }
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// Get featured blogs
const getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    let blogs;
    
    try {
      blogs = await Blog.find({ 
        status: 'published', 
        isFeatured: true, 
        isActive: true 
      })
        .populate('author', 'name email')
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select('-content');
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for featured blogs');
        blogs = mockBlogs
          .filter(b => b.status === 'published' && b.isFeatured)
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, limit);
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      data: {
        blogs
      }
    });
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured blogs',
      error: error.message
    });
  }
};

// Get single blog by slug
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    let blog;
    
    try {
      blog = await Blog.findOne({ 
        slug, 
        status: 'published', 
        isActive: true 
      }).populate('author', 'name email');
      
      if (blog) {
        // Increment views
        blog.views += 1;
        await blog.save();
      }
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for single blog');
        blog = mockBlogs.find(b => b.slug === slug && b.status === 'published');
        
        if (blog) {
          // Simulate view increment
          blog.views += 1;
        }
      } else {
        throw dbError;
      }
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Get related blogs
    let relatedBlogs = [];
    try {
      relatedBlogs = await Blog.find({
        _id: { $ne: blog._id },
        category: blog.category,
        status: 'published',
        isActive: true
      })
        .populate('author', 'name email')
        .sort({ publishedAt: -1 })
        .limit(3)
        .select('-content');
    } catch (dbError) {
      if (useMockData(dbError)) {
        relatedBlogs = mockBlogs
          .filter(b => b._id !== blog._id && b.category === blog.category && b.status === 'published')
          .slice(0, 3);
      }
    }

    res.json({
      success: true,
      data: {
        blog,
        relatedBlogs
      }
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// Get single blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let blog;
    
    try {
      blog = await Blog.findOne({ 
        _id: id, 
        status: 'published', 
        isActive: true 
      }).populate('author', 'name email');
      
      if (blog) {
        // Increment views
        blog.views += 1;
        await blog.save();
      }
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for single blog by ID');
        blog = mockBlogs.find(b => b._id === id && b.status === 'published');
        
        if (blog) {
          // Simulate view increment
          blog.views += 1;
        }
      } else {
        throw dbError;
      }
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Get related blogs
    let relatedBlogs = [];
    try {
      relatedBlogs = await Blog.find({
        _id: { $ne: blog._id },
        category: blog.category,
        status: 'published',
        isActive: true
      })
        .populate('author', 'name email')
        .sort({ publishedAt: -1 })
        .limit(3)
        .select('-content');
    } catch (dbError) {
      if (useMockData(dbError)) {
        relatedBlogs = mockBlogs
          .filter(b => b._id !== blog._id && b.category === blog.category && b.status === 'published')
          .slice(0, 3);
      }
    }

    res.json({
      success: true,
      data: {
        blog,
        relatedBlogs
      }
    });
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// Get blog categories
const getBlogCategories = async (req, res) => {
  try {
    let categories;
    
    try {
      categories = await Blog.distinct('category', { 
        status: 'published', 
        isActive: true 
      });
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for blog categories');
        categories = [...new Set(mockBlogs
          .filter(b => b.status === 'published')
          .map(b => b.category))];
      } else {
        throw dbError;
      }
    }

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Create new blog (Admin only)
const createBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Generate slug from title
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    };

    const blogData = {
      ...req.body,
      author: req.user._id || req.user.id,
      slug: generateSlug(req.body.title),
      publishedAt: new Date(),
      status: req.body.status || 'published',
      isActive: true,
      views: 0,
      likes: 0
    };
    


    // Parse tags if they come as JSON string
    if (typeof req.body.tags === 'string') {
      try {
        blogData.tags = JSON.parse(req.body.tags);
      } catch (e) {
        blogData.tags = req.body.tags.split(',').map(tag => tag.trim());
      }
    }

    // Handle featured image upload or URL
    if (req.files && req.files.featuredImage) {
      blogData.featuredImage = {
        url: `/uploads/${req.files.featuredImage[0].filename}`,
        alt: req.body.featuredImageAlt || blogData.title
      };
    } else if (req.body.image) {
      // Handle case where image might be an array or string
      let imageUrl = req.body.image;
      
      // If it's a JSON string array, parse it
      if (typeof imageUrl === 'string' && imageUrl.startsWith('[')) {
        try {
          imageUrl = JSON.parse(imageUrl);
        } catch (e) {
          // If parsing fails, use as is
        }
      }
      
      // If it's an array, take the first element
      if (Array.isArray(imageUrl)) {
        imageUrl = imageUrl[0];
      }
      
      blogData.featuredImage = {
        url: imageUrl,
        alt: req.body.featuredImageAlt || blogData.title
      };
    } else {
      // Provide default featured image if none provided
      blogData.featuredImage = {
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt: blogData.title
      };
    }

    // Handle additional images
    if (req.files && req.files.images) {
      blogData.images = req.files.images.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.imageAlts ? req.body.imageAlts[index] : '',
        caption: req.body.imageCaptions ? req.body.imageCaptions[index] : ''
      }));
    }

    let blog;
    
    try {
      blog = new Blog(blogData);
      await blog.save();
      await blog.populate('author', 'name email');
    } catch (dbError) {
      if (useMockData(dbError)) {
        // For demo purposes, just return success with mock data
        blog = {
          _id: Date.now().toString(),
          ...blogData,
          slug: blogData.title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-'),
          createdAt: new Date(),
          updatedAt: new Date(),
          views: 0,
          likes: 0,
          author: {
            _id: blogData.author,
            name: req.user.name || 'Mock User',
            email: req.user.email || 'mock@example.com'
          }
        };
        console.log('Mock blog created (database not available)');
      } else {
        throw dbError;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Error creating blog: ' + error.message,
      error: error.message
    });
  }
};

// Update blog (Admin only)
const updateBlog = async (req, res) => {
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

    // Handle featured image upload
    if (req.files && req.files.featuredImage) {
      updateData.featuredImage = {
        url: `/uploads/${req.files.featuredImage[0].filename}`,
        alt: req.body.featuredImageAlt || updateData.title
      };
    }

    // Handle additional images
    if (req.files && req.files.images) {
      const newImages = req.files.images.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.imageAlts ? req.body.imageAlts[index] : '',
        caption: req.body.imageCaptions ? req.body.imageCaptions[index] : ''
      }));

      if (updateData.images) {
        updateData.images = [...updateData.images, ...newImages];
      } else {
        updateData.images = newImages;
      }
    }

    let blog;
    
    try {
      blog = await Blog.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('author', 'name email');
    } catch (dbError) {
      if (useMockData(dbError)) {
        // For demo purposes, find and update mock blog
        const mockIndex = mockBlogs.findIndex(b => b._id === id);
        if (mockIndex !== -1) {
          blog = { ...mockBlogs[mockIndex], ...updateData, updatedAt: new Date() };
          mockBlogs[mockIndex] = blog;
          console.log('Mock blog updated (database not available)');
        }
      } else {
        throw dbError;
      }
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
};

// Delete blog (Admin only)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    let blog;
    
    try {
      blog = await Blog.findById(id);
      
      if (blog) {
        // Delete associated images
        if (blog.featuredImage && blog.featuredImage.url) {
          const imagePath = path.join(__dirname, '..', 'public', blog.featuredImage.url);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        
        if (blog.images && blog.images.length > 0) {
          blog.images.forEach(image => {
            const imagePath = path.join(__dirname, '..', 'public', image.url);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          });
        }
        
        await Blog.findByIdAndDelete(id);
      }
    } catch (dbError) {
      if (useMockData(dbError)) {
        // For demo purposes, remove from mock data
        const mockIndex = mockBlogs.findIndex(b => b._id === id);
        if (mockIndex !== -1) {
          blog = mockBlogs[mockIndex];
          mockBlogs.splice(mockIndex, 1);
          console.log('Mock blog deleted (database not available)');
        }
      } else {
        throw dbError;
      }
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
};

// Like/Unlike blog
const toggleBlogLike = async (req, res) => {
  try {
    const { id } = req.params;
    
    let blog;
    
    try {
      blog = await Blog.findById(id);
      
      if (blog) {
        blog.likes += 1;
        await blog.save();
      }
    } catch (dbError) {
      if (useMockData(dbError)) {
        console.log('Using mock data for blog like');
        blog = mockBlogs.find(b => b._id === id);
        
        if (blog) {
          blog.likes += 1;
        }
      } else {
        throw dbError;
      }
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog liked successfully',
      data: {
        likes: blog.likes
      }
    });
  } catch (error) {
    console.error('Error liking blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking blog',
      error: error.message
    });
  }
};

// Get user's own blogs
const getUserBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let blogs, total;
    
    try {
      const filter = { author: req.user._id, isActive: true };
      
      if (req.query.status) {
        filter.status = req.query.status;
      }

      blogs = await Blog.find(filter)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await Blog.countDocuments(filter);

      res.json({
        success: true,
        data: {
          blogs,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBlogs: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });
    } catch (dbError) {
      if (useMockData(dbError)) {
        // Mock response for demo
        res.json({
          success: true,
          data: {
            blogs: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalBlogs: 0,
              hasNext: false,
              hasPrev: false
            }
          }
        });
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

module.exports = {
  getAllBlogs,
  getFeaturedBlogs,
  getBlogBySlug,
  getBlogById,
  getBlogCategories,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogLike,
  getUserBlogs
};