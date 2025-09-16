import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const WriteReviewForm = ({ onSubmit, isAdmin = false, className = "" }) => {
  const [formData, setFormData] = useState({
    reviewType: '',
    review: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const reviewTypes = [
    'General Experience',
    'Service Quality',
    'Property Purchase/Sale',
    'Customer Support'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle character limit for review
    if (name === 'review' && value.length > 500) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.reviewType) {
      toast.error('Please select a review type');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reviewData = {
        ...formData,
        rating,
        isAdmin
      };
      
      await onSubmit(reviewData);
      
      // Reset form
      setFormData({
        reviewType: '',
        review: ''
      });
      setRating(0);
      
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-colors duration-200"
          >
            <Star
              size={28}
              className={`${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              } hover:text-yellow-400 transition-colors duration-200`}
            />
          </button>
        ))}
        <span className="ml-3 text-sm text-gray-600">
          {rating > 0 && (
            <>
              {rating} star{rating !== 1 ? 's' : ''} - 
              {rating === 1 && ' Poor'}
              {rating === 2 && ' Fair'}
              {rating === 3 && ' Good'}
              {rating === 4 && ' Very Good'}
              {rating === 5 && ' Excellent'}
            </>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Write a Review</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Share your experience with Promise Realty and help others make informed decisions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Your Rating *
          </label>
          {renderStars()}
        </div>



        {/* Review Type */}
        <div>
          <label htmlFor="reviewType" className="block text-sm font-semibold text-gray-700 mb-2">
            Review Type *
          </label>
          <select
            id="reviewType"
            name="reviewType"
            value={formData.reviewType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
            required
          >
            <option value="">Select review type</option>
            {reviewTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Review *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
            <textarea
              id="review"
              name="review"
              value={formData.review}
              onChange={handleInputChange}
              rows={6}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
              placeholder="Share your experience with Promise Realty..."
              required
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              Share details about your experience, service quality, or any feedback you'd like to provide.
            </p>
            <span className={`text-sm font-medium ${
              formData.review.length > 450 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {formData.review.length}/500
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          <span className="font-semibold">Note:</span> Your review will be reviewed by our team before being published. 
          We appreciate your honest feedback and use it to improve our services.
        </p>
      </div>
    </div>
  );
};

export default WriteReviewForm;