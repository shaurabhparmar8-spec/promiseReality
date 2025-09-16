import React from 'react';
import SimpleReviewForm from '../components/Reviews/SimpleReviewForm';

const ReviewFormDemo = () => {
  const handleSubmitReview = async (reviewData) => {
    // Demo handler - just log the data
    console.log('Review submitted:', reviewData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, this would call the API
    // const response = await reviewAPI.create(reviewData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Review Form Demo</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern, clean user interface for Promise Realty's review form
          </p>
        </div>

        {/* Review Form */}
        <SimpleReviewForm onSubmit={handleSubmitReview} />

        {/* Form Specifications */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Specifications</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Features</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ Title: "Write a Review" in bold</li>
                  <li>✅ Descriptive subtext for user guidance</li>
                  <li>✅ Clean, modern interface design</li>
                  <li>✅ Responsive layout for all devices</li>
                  <li>✅ Blue color scheme matching branding</li>
                  <li>✅ Rounded corners and subtle shadows</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Fields</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ Full Name (Text input)</li>
                  <li>✅ Phone Number (Text input)</li>
                  <li>✅ Email Address (Text input)</li>
                  <li>✅ Review Type (Dropdown with 4 options)</li>
                  <li>✅ Your Review (Textarea, 500 char limit)</li>
                  <li>✅ Submit Button (Blue, rounded, bold)</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Review Type Options</h3>
              <div className="grid grid-cols-2 gap-2 text-blue-800">
                <span>• General Experience</span>
                <span>• Service Quality</span>
                <span>• Property Purchase/Sale</span>
                <span>• Customer Support</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Additional Features</h3>
              <ul className="space-y-1 text-green-800">
                <li>• Real-time character counter (500 limit)</li>
                <li>• Form validation with error messages</li>
                <li>• Loading states during submission</li>
                <li>• Success/error toast notifications</li>
                <li>• Accessible design with proper labels</li>
                <li>• Available for both users and admins</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewFormDemo;