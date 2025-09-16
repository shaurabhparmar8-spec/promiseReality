import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { blogAPI } from '../../utils/api';
import { staggerAnimation } from '../../styles/animations';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';
import BackButton from './BackButton';
import { useAuth } from '../../context/AuthContext';

const ManageBlogs = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAll();
      
      if (response.data.success) {
        setBlogs(response.data.data.blogs || []);
      } else {
        toast.error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        staggerAnimation(document.querySelectorAll('.blog-card'));
      }, 100);
    }
  }, [loading]);

  const handleAddBlog = () => {
    // Check permission before proceeding
    if (!user?.permissions?.writeBlog) {
      toast.error('You do not have permission to create blogs');
      return;
    }
    reset();
    setShowAddModal(true);
  };

  const handleEditBlog = (blog) => {
    // Check permission before proceeding
    if (!user?.permissions?.writeBlog) {
      toast.error('You do not have permission to edit blogs');
      return;
    }
    setEditingBlog(blog);
    setValue('title', blog.title);
    setValue('excerpt', blog.excerpt);
    setValue('content', blog.content);
    setValue('category', blog.category);
    setValue('image', blog.image);
    setShowEditModal(true);
  };

  const handleDeleteBlog = async (blogId) => {
    // Check permission before proceeding
    if (!user?.permissions?.deleteBlog) {
      toast.error('You do not have permission to delete blogs');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await blogAPI.delete(blogId);
      
      if (response.data.success) {
        toast.success('Blog deleted successfully!');
        fetchBlogs();
      } else {
        toast.error(response.data.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const onSubmit = async (data) => {
    // Check permission before proceeding
    if (!user?.permissions?.writeBlog && user?.role !== 'owner') {
      toast.error('You do not have permission to create/edit blogs');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!data.title?.trim() || !data.excerpt?.trim() || !data.content?.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const blogData = {
        title: data.title.trim(),
        excerpt: data.excerpt.trim(),
        content: data.content.trim(),
        category: data.category || 'General',
        image: data.image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        status: 'published',
        author: user.id,
        readTime: Math.max(1, Math.ceil(data.content.trim().split(/\s+/).length / 200)) // Estimate read time
      };

      let response;
      try {
        if (editingBlog) {
          response = await blogAPI.update(editingBlog._id, blogData);
        } else {
          response = await blogAPI.create(blogData);
        }
      } catch (apiError) {
        // If backend is not available, create a mock blog for demo purposes
        if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ERR_NETWORK' || !navigator.onLine) {
          console.warn('🔄 Backend not available, using demo mode');
          const mockBlog = {
            _id: Date.now().toString(),
            ...blogData,
            author: { name: user.name, id: user.id },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: Math.floor(Math.random() * 100),
            likes: Math.floor(Math.random() * 20),
            isFeatured: false
          };
          
          // Add to local state
          if (editingBlog) {
            setBlogs(prev => prev.map(blog => blog._id === editingBlog._id ? { ...mockBlog, _id: editingBlog._id } : blog));
          } else {
            setBlogs(prev => [mockBlog, ...prev]);
          }
          
          toast.success(`Blog ${editingBlog ? 'updated' : 'created'} successfully! (Demo Mode)`);
          reset();
          setShowAddModal(false);
          setShowEditModal(false);
          setEditingBlog(null);
          return;
        }
        throw apiError;
      }

      if (response?.data?.success) {
        toast.success(`Blog ${editingBlog ? 'updated' : 'created'} successfully!`);
        reset();
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingBlog(null);
        fetchBlogs();
      } else {
        throw new Error(response?.data?.message || `Failed to ${editingBlog ? 'update' : 'create'} blog`);
      }
    } catch (error) {
      console.error('Error submitting blog:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else if (error.message && !error.message.includes('Failed to')) {
        toast.error(error.message);
      } else {
        toast.error(`Failed to ${editingBlog ? 'update' : 'create'} blog. Please check your connection and try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Blog Posts</h1>
          <p className="text-gray-600 mt-1">Create and manage blog articles</p>
        </div>
        {user?.permissions?.writeBlog && (
          <button 
            onClick={handleAddBlog}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Write New Post
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div key={blog._id} className="blog-card border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={blog.featuredImage?.url || '/images/blog-placeholder.jpg'}
                      alt={blog.title}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{blog.title}</h3>
                      <p className="text-sm text-gray-500">
                        {blog.category} • {blog.readTime} min read
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Author: {blog.author?.name || 'Admin'} • {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{blog.excerpt}</p>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      blog.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : blog.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {blog.status}
                    </span>
                    {blog.isFeatured && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Featured
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {blog.views} views • {blog.likes} likes
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {user?.permissions?.writeBlog && (
                    <button 
                      onClick={() => handleEditBlog(blog)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                  {user?.permissions?.deleteBlog && (
                    <button 
                      onClick={() => handleDeleteBlog(blog._id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Blog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Write New Blog Post</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter blog title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <textarea
                    {...register('excerpt', { required: 'Excerpt is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the blog post"
                  />
                  {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    {...register('content', { required: 'Content is required' })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your blog content here..."
                  />
                  {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Home Buying">Home Buying</option>
                    <option value="Investment">Investment</option>
                    <option value="Home Selling">Home Selling</option>
                    <option value="Market Trends">Market Trends</option>
                    <option value="Tips & Advice">Tips & Advice</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
                  <input
                    type="url"
                    {...register('image')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="small" color="white" />
                        <span className="ml-2">Publishing...</span>
                      </>
                    ) : (
                      'Publish Post'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Blog Post</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBlog(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter blog title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <textarea
                    {...register('excerpt', { required: 'Excerpt is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the blog post"
                  />
                  {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    {...register('content', { required: 'Content is required' })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your blog content here..."
                  />
                  {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Home Buying">Home Buying</option>
                    <option value="Investment">Investment</option>
                    <option value="Home Selling">Home Selling</option>
                    <option value="Market Trends">Market Trends</option>
                    <option value="Tips & Advice">Tips & Advice</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
                  <input
                    type="url"
                    {...register('image')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingBlog(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="small" color="white" />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      'Update Post'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;