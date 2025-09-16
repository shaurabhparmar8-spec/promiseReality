import React, { useState } from 'react';
import toast from 'react-hot-toast';

const SimpleReviewForm = ({ onSubmit, className = "" }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    reviewType: '',
    review: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (!formData.reviewType) {
      toast.error('Please select a review type');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        reviewType: '',
        review: ''
      });
      
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Write a Review</h2>
        <p className="text-gray-600 text-base">
          Share your experience with Promise Realty and help others make informed decisions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your phone number"
            required
          />
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your email address"
            required
          />
        </div>

        {/* Review Type */}
        <div>
          <label htmlFor="reviewType" className="block text-sm font-medium text-gray-700 mb-2">
            Review Type
          </label>
          <select
            id="reviewType"
            name="reviewType"
            value={formData.reviewType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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

        {/* Your Review */}
        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="review"
            name="review"
            value={formData.review}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Share your experience with Promise Realty..."
            required
          />
          <div className="flex justify-end mt-2">
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
            className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
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
    </div>
  );
};

export default SimpleReviewForm;