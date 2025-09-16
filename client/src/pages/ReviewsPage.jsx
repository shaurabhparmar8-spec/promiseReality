import React, { useState, useEffect } from 'react';
import { Star, Calendar, User, MessageCircle } from 'lucide-react';
import { reviewAPI, formatDate } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import WriteReviewForm from '../components/Reviews/WriteReviewForm';
import toast from 'react-hot-toast';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getAll();
      if (response.data.success) {
        setReviews(response.data.data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      console.log('Submitting review from ReviewsPage:', reviewData);
      
      const response = await reviewAPI.create({
        rating: reviewData.rating,
        comment: reviewData.review,
        reviewType: reviewData.reviewType || 'general'
      });

      if (response.data.success) {
        setShowWriteForm(false);
        fetchReviews(); // Refresh reviews
        toast.success('Review submitted successfully! It will be published after approval.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Reviews</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Read what our clients have to say about their experience with Promise Realty
          </p>
          <button
            onClick={() => setShowWriteForm(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Write a Review
          </button>
        </div>

        {/* Write Review Form Modal */}
        {showWriteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
                  <button
                    onClick={() => setShowWriteForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <WriteReviewForm 
                  onSubmit={handleSubmitReview}
                  className="shadow-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {review.user?.name || review.name || 'Anonymous'}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{review.comment}"
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                  {review.reviewType && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {review.reviewType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your experience with Promise Realty!</p>
            <button
              onClick={() => setShowWriteForm(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Write First Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;