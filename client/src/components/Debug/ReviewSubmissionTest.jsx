import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ReviewSubmissionTest = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testReviewSubmission = async () => {
    setIsSubmitting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing Review Submission...');
      console.log('User authenticated:', isAuthenticated());
      console.log('User data:', user);

      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const testReviewData = {
        rating: 5,
        comment: 'This is a test review to check if the submission is working properly.',
        reviewType: 'General Experience'
      };

      console.log('Submitting review data:', testReviewData);

      const response = await reviewAPI.create(testReviewData);
      
      console.log('Review submission response:', response);

      if (response.data.success) {
        setTestResult({
          success: true,
          message: 'Review submitted successfully!',
          data: response.data
        });
        toast.success('Test review submitted successfully!');
      } else {
        throw new Error(response.data.message || 'Unknown error');
      }

    } catch (error) {
      console.error('Review submission test failed:', error);
      
      setTestResult({
        success: false,
        message: error.message || 'Review submission failed',
        error: error.response?.data || error
      });
      
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const testBlogSubmission = async () => {
    setIsSubmitting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing Blog Submission...');
      console.log('User authenticated:', isAuthenticated());
      console.log('User data:', user);

      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const testBlogData = {
        title: 'Test Blog Post',
        content: 'This is a test blog post to check if the submission is working properly. It contains some sample content to test the blog creation functionality.',
        excerpt: 'This is a test blog post excerpt.',
        category: 'Tips & Advice',
        tags: ['test', 'blog'],
        status: 'published',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
      };

      console.log('Submitting blog data:', testBlogData);

      // Import blogAPI dynamically
      const { blogAPI } = await import('../../utils/api');
      const response = await blogAPI.create(testBlogData);
      
      console.log('Blog submission response:', response);

      if (response.data.success) {
        setTestResult({
          success: true,
          message: 'Blog submitted successfully!',
          data: response.data
        });
        toast.success('Test blog submitted successfully!');
      } else {
        throw new Error(response.data.message || 'Unknown error');
      }

    } catch (error) {
      console.error('Blog submission test failed:', error);
      
      setTestResult({
        success: false,
        message: error.message || 'Blog submission failed',
        error: error.response?.data || error
      });
      
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Blog Submission Test</h2>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        <div className="space-y-2">
          <p><strong>Authenticated:</strong> {isAuthenticated() ? '✅ Yes' : '❌ No'}</p>
          <p><strong>User:</strong> {user ? `${user.name} (${user.phone})` : 'Not logged in'}</p>
          <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={testReviewSubmission}
          disabled={isSubmitting || !isAuthenticated()}
          className={`px-6 py-3 rounded-lg font-semibold ${
            isSubmitting || !isAuthenticated()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? 'Testing...' : 'Test Review Submission'}
        </button>

        <button
          onClick={testBlogSubmission}
          disabled={isSubmitting || !isAuthenticated()}
          className={`px-6 py-3 rounded-lg font-semibold ${
            isSubmitting || !isAuthenticated()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isSubmitting ? 'Testing...' : 'Test Blog Submission'}
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-2 ${
            testResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            Test Result: {testResult.success ? '✅ Success' : '❌ Failed'}
          </h3>
          <p className={`mb-2 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.message}
          </p>
          
          {testResult.data && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Response Data:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          )}
          
          {testResult.error && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-red-700">Error Details:</h4>
              <pre className="bg-red-100 p-3 rounded text-sm overflow-auto text-red-800">
                {JSON.stringify(testResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h3>
        <ul className="text-blue-700 space-y-1">
          <li>• Make sure you are logged in before testing</li>
          <li>• Check the browser console for detailed logs</li>
          <li>• Review submission requires authentication</li>
          <li>• Blog submission requires authentication</li>
          <li>• Check the server console for backend logs</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewSubmissionTest;