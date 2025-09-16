import React, { useState, useEffect } from 'react';
import { staggerAnimation } from '../../styles/animations';
import WriteReviewForm from '../Reviews/WriteReviewForm';
import { reviewAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import BackButton from './BackButton';
import { useAuth } from '../../context/AuthContext';

const ManageReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('manage');

  // Ensure valid tab based on permissions
  useEffect(() => {
    if (activeTab === 'create' && !user?.permissions?.writeReview) {
      setActiveTab('manage');
    }
  }, [activeTab, user?.permissions?.writeReview]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reviews/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdminReview = async (reviewData) => {
    // Check permission before proceeding
    if (!user?.permissions?.writeReview && user?.role !== 'owner') {
      toast.error('You do not have permission to create reviews');
      return;
    }

    try {
      console.log('Admin creating review with data:', reviewData);
      
      const response = await reviewAPI.createAdmin({
        rating: reviewData.rating,
        comment: reviewData.review,
        reviewType: reviewData.reviewType || 'general',
        author: user.id
      });
      
      if (response.data.success) {
        toast.success('Review created successfully!');
        fetchReviews(); // Refresh the reviews list
        setActiveTab('manage'); // Switch back to manage tab
      }
    } catch (error) {
      console.error('Error creating review:', error);
      
      // If backend is not available, create a mock review for demo purposes
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        console.warn('🔄 Backend not available, using demo mode');
        const mockReview = {
          _id: Date.now().toString(),
          rating: reviewData.rating,
          comment: reviewData.review,
          reviewType: reviewData.reviewType || 'general',
          user: { name: user.name, id: user.id },
          isApproved: true,
          createdAt: new Date().toISOString()
        };
        
        // Add to local state
        setReviews(prev => [mockReview, ...prev]);
        toast.success('Review created successfully! (Demo Mode)');
        setActiveTab('manage');
        return;
      }
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create review. Please check your connection and try again.');
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        const reviewCards = document.querySelectorAll('.review-card');
        if (reviewCards && reviewCards.length > 0) {
          staggerAnimation(reviewCards);
        }
      }, 100);
    }
  }, [loading]);

  const StarRating = ({ rating }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );

  const handleApproveReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/admin/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isApproved: true })
      });

      const data = await response.json();
      if (data.success) {
        alert('Review approved successfully!');
        fetchReviews();
      } else {
        alert('Failed to approve review: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Error approving review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    // Check permission before proceeding
    if (!user?.permissions?.deleteReview) {
      toast.error('You do not have permission to delete reviews');
      return;
    }

    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/admin/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Review deleted successfully!');
        fetchReviews();
      } else {
        toast.error('Failed to delete review: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Error deleting review');
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
          <p className="text-gray-600 mt-1">Approve and manage customer reviews</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Reviews
            </button>
            {user?.permissions?.writeReview && (
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Create Review
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            {reviews.map((review) => (
            <div key={review._id} className="review-card border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} />
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">{review.reviewType}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {!review.isApproved && (
                    <button 
                      onClick={() => handleApproveReview(review._id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Approve
                    </button>
                  )}
                  {user?.permissions?.deleteReview && (
                    <button 
                      onClick={() => handleDeleteReview(review._id)}
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
      )}

      {/* Create Review Tab */}
      {activeTab === 'create' && user?.permissions?.writeReview && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Review</h2>
            <p className="text-gray-600">Create a review on behalf of a customer or add a testimonial.</p>
          </div>
          <WriteReviewForm 
            onSubmit={handleCreateAdminReview} 
            isAdmin={true}
            className="max-w-none shadow-none"
          />
        </div>
      )}
    </div>
  );
};

export default ManageReviews;