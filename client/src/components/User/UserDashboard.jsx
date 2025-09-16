import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { reviewAPI, blogAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { formatPrice, getImageUrl } from '../../utils/api';
import WriteReviewForm from '../Reviews/WriteReviewForm';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [likedProperties, setLikedProperties] = useState([]);
  const [visitList, setVisitList] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    propertyId: '',
    rating: 5,
    title: '',
    comment: ''
  });

  // Blog form state
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    category: 'Tips & Advice',
    tags: [],
    status: 'published'
  });

  useEffect(() => {
    if (activeTab === 'liked') {
      fetchLikedProperties();
    } else if (activeTab === 'visits') {
      fetchVisitList();
    } else if (activeTab === 'reviews') {
      fetchUserReviews();
    } else if (activeTab === 'blogs') {
      fetchUserBlogs();
    }
  }, [activeTab]);

  const fetchLikedProperties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/liked-properties');
      if (response.data.success) {
        setLikedProperties(response.data.data.likedProperties);
      }
    } catch (error) {
      console.error('Error fetching liked properties:', error);
      toast.error('Failed to load liked properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitList = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/visit-list');
      if (response.data.success) {
        setVisitList(response.data.data.visitList);
      }
    } catch (error) {
      console.error('Error fetching visit list:', error);
      toast.error('Failed to load visit list');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getUserReviews();
      if (response.data.success) {
        setUserReviews(response.data.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getUserBlogs();
      if (response.data.success) {
        setUserBlogs(response.data.data.blogs || []);
      }
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLike = async (propertyId) => {
    try {
      const response = await api.post(`/auth/properties/${propertyId}/like`);
      if (response.data.success) {
        setLikedProperties(prev => prev.filter(p => p._id !== propertyId));
        toast.success('Removed from favorites');
      }
    } catch (error) {
      console.error('Error removing like:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/auth/profile', profileForm);
      if (response.data.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCreateReview = async (reviewData) => {
    try {
      console.log('Creating review from UserDashboard:', reviewData);
      
      const response = await reviewAPI.create({
        rating: reviewData.rating,
        comment: reviewData.review,
        reviewType: reviewData.reviewType || 'general'
      });

      if (response.data.success) {
        toast.success('Review submitted successfully! It will be published after approval.');
        fetchUserReviews();
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error creating review:', error);
      
      // Show specific error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
      
      throw error;
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!blogForm.title.trim()) {
      toast.error('Please enter a blog title');
      return;
    }
    if (!blogForm.content.trim()) {
      toast.error('Please enter blog content');
      return;
    }
    if (!blogForm.excerpt.trim()) {
      toast.error('Please enter a blog excerpt');
      return;
    }
    
    try {
      console.log('Creating blog with data:', blogForm);
      console.log('User token exists:', !!localStorage.getItem('token'));
      console.log('User data:', user);
      
      const response = await blogAPI.create(blogForm);
      if (response.data.success) {
        toast.success('Blog post created successfully');
        setBlogForm({
          title: '',
          content: '',
          excerpt: '',
          image: '',
          category: 'Tips & Advice',
          tags: [],
          status: 'published'
        });
        fetchUserBlogs();
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      
      // Show specific error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error('Failed to create blog post');
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await reviewAPI.delete(reviewId);
      if (response.data.success) {
        toast.success('Review deleted successfully');
        fetchUserReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const tabs = [
    { id: 'profile', name: 'My Profile', icon: '👤' },
    { id: 'liked', name: 'Liked Properties', icon: '❤️' },
    { id: 'visits', name: 'Visit List', icon: '🏷️' },
    { id: 'reviews', name: 'My Reviews', icon: '⭐' },
    { id: 'blogs', name: 'My Blogs', icon: '📝' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3 text-lg">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Update Profile
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Liked Properties Tab */}
              {activeTab === 'liked' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">❤️ My Liked Properties</h2>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : likedProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-6xl mb-4">💔</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Liked Properties</h3>
                      <p className="text-gray-600 mb-4">You haven't liked any properties yet.</p>
                      <button
                        onClick={() => navigate('/properties')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Browse Properties
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {likedProperties.map((property) => (
                        <div key={property._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                          <div className="aspect-video bg-gray-200">
                            <img
                              src={getImageUrl(property.images?.[0]?.url)}
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {property.location?.area}, {property.location?.city}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-blue-600">
                                {formatPrice(property.price?.amount)}
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/property/${property._id}`)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleRemoveLike(property._id)}
                                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors duration-200"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Visit List Tab */}
              {activeTab === 'visits' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">🏷️ My Visit List</h2>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : visitList.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-6xl mb-4">📋</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit Requests</h3>
                      <p className="text-gray-600 mb-4">You haven't added any properties to your visit list yet.</p>
                      <button
                        onClick={() => navigate('/properties')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Browse Properties
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visitList.map((visit) => (
                        <div key={visit._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {visit.property?.title || 'Property'}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {visit.property?.location?.area}, {visit.property?.location?.city}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Requested: {new Date(visit.requestedAt).toLocaleDateString()}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  visit.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                  visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                                </span>
                              </div>
                              {visit.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Notes:</strong> {visit.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => navigate(`/property/${visit.property?._id}`)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                              >
                                View Property
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">⭐ My Reviews</h2>
                  
                  {/* Create Review Form */}
                  <div className="mb-8">
                    <WriteReviewForm 
                      onSubmit={handleCreateReview} 
                      className="max-w-none"
                    />
                  </div>

                  {/* User Reviews List */}
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : userReviews.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-6xl mb-4">⭐</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-600">You haven't written any reviews yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userReviews.map((review) => (
                        <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{review.title}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                      ⭐
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {review.isApproved ? 'Approved' : 'Pending'}
                              </span>
                              <button
                                onClick={() => handleDeleteReview(review._id)}
                                className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                          {review.property && (
                            <p className="text-sm text-gray-500 mt-2">
                              Property: {review.property.title}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Blogs Tab */}
              {activeTab === 'blogs' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">📝 My Blogs</h2>
                  
                  {/* Create Blog Form */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Blog Post</h3>
                    <form onSubmit={handleCreateBlog} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blog Title
                        </label>
                        <input
                          type="text"
                          value={blogForm.title}
                          onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter blog title"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={blogForm.category}
                            onChange={(e) => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="Tips & Advice">Tips & Advice</option>
                            <option value="Home Buying">Home Buying</option>
                            <option value="Investment">Investment</option>
                            <option value="Home Selling">Home Selling</option>
                            <option value="Market Trends">Market Trends</option>
                            <option value="Real Estate Tips">Real Estate Tips</option>
                            <option value="Market Updates">Market Updates</option>
                            <option value="Investment Guide">Investment Guide</option>
                            <option value="Property News">Property News</option>
                            <option value="Legal Advice">Legal Advice</option>
                            <option value="Selling Tips">Selling Tips</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Featured Image URL
                          </label>
                          <input
                            type="url"
                            value={blogForm.image}
                            onChange={(e) => setBlogForm(prev => ({ ...prev, image: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Excerpt (Short Description)
                        </label>
                        <textarea
                          value={blogForm.excerpt}
                          onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Brief description of your blog post..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blog Content
                        </label>
                        <textarea
                          value={blogForm.content}
                          onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Write your blog content here..."
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Publish Blog
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* User Blogs List */}
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : userBlogs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts Yet</h3>
                      <p className="text-gray-600">You haven't written any blog posts yet.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {userBlogs.map((blog) => (
                        <div key={blog._id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {blog.featuredImage?.url && (
                            <img
                              src={blog.featuredImage.url}
                              alt={blog.title}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop';
                              }}
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">{blog.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{blog.excerpt}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/blog/${blog._id}`)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => {/* Add edit functionality */}}
                                  className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors duration-200"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;