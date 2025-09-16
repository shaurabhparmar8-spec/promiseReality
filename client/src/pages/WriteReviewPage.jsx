import React, { useEffect } from 'react';
import WriteReviewForm from '../components/Reviews/WriteReviewForm';
import { reviewAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const WriteReviewPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to write a review');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmitReview = async (reviewData) => {
    try {
      console.log('Submitting review data:', reviewData);
      
      // Create the review using the API
      const response = await reviewAPI.create({
        rating: reviewData.rating,
        comment: reviewData.review,
        reviewType: reviewData.reviewType || 'general'
      });

      console.log('Review submission response:', response);

      if (response.data.success) {
        toast.success('Review submitted successfully! It will be published after approval.');
        
        // Redirect to a thank you page or back to home
        setTimeout(() => {
          navigate('/', { 
            state: { 
              message: 'Thank you for your review! It will be published after approval.' 
            }
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12 px-4">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Share Your Experience</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your feedback helps us improve and assists other clients in making informed decisions about Promise Realty.
          </p>
        </div>

        {/* Review Form */}
        <WriteReviewForm onSubmit={handleSubmitReview} />

        {/* Additional Information */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Reviews</h3>
              <p className="text-gray-600 text-sm">
                All reviews are verified and moderated to ensure authenticity and quality.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Protected</h3>
              <p className="text-gray-600 text-sm">
                Your personal information is kept secure and used only for review verification.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-gray-600 text-sm">
                We review and respond to feedback within 24-48 hours of submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewPage;