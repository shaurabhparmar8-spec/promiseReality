import React, { useState } from 'react';
import { reviewAPI, blogAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SubmissionTest = () => {
  const { user, isAuthenticated } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, status, message) => {
    setResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testReviewSubmission = async () => {
    try {
      addResult('Review Submission', 'testing', 'Testing review submission...');
      
      const response = await reviewAPI.create({
        rating: 5,
        comment: 'This is a test review from the frontend submission test component.',
        reviewType: 'General Experience'
      });

      if (response.data.success) {
        addResult('Review Submission', 'success', `Review submitted successfully! ID: ${response.data.data.review._id}`);
      } else {
        addResult('Review Submission', 'error', `Failed: ${response.data.message}`);
      }
    } catch (error) {
      addResult('Review Submission', 'error', `Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const testBlogSubmission = async () => {
    try {
      addResult('Blog Submission', 'testing', 'Testing blog submission...');
      
      const response = await blogAPI.create({
        title: `Frontend Test Blog - ${Date.now()}`,
        content: 'This is a test blog post created from the frontend submission test component to verify that blog creation is working properly.',
        excerpt: 'A test blog post to verify frontend blog submission functionality.',
        category: 'Tips & Advice',
        tags: ['test', 'frontend', 'verification'],
        status: 'published',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      });

      if (response.data.success) {
        addResult('Blog Submission', 'success', `Blog submitted successfully! ID: ${response.data.data.blog._id}, Slug: ${response.data.data.blog.slug}`);
      } else {
        addResult('Blog Submission', 'error', `Failed: ${response.data.message}`);
      }
    } catch (error) {
      addResult('Blog Submission', 'error', `Error: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.errors) {
        addResult('Blog Submission', 'error', `Validation errors: ${error.response.data.errors.map(e => e.msg).join(', ')}`);
      }
    }
  };

  const runAllTests = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first to test submissions');
      return;
    }

    setTesting(true);
    setResults([]);
    
    addResult('Authentication', 'success', `Logged in as: ${user.name} (${user.email})`);
    
    await testReviewSubmission();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testBlogSubmission();
    
    setTesting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'testing': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Frontend Submission Test</h2>
        <p className="text-gray-600">Test review and blog submissions directly from the frontend</p>
      </div>

      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Authentication Status</h3>
        {isAuthenticated ? (
          <div className="text-green-600">
            ✅ Logged in as: <strong>{user.name}</strong> ({user.email})
          </div>
        ) : (
          <div className="text-red-600">
            ❌ Not logged in - Please login to test submissions
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={!isAuthenticated || testing}
          className={`px-6 py-3 rounded-lg font-medium ${
            !isAuthenticated || testing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {testing ? 'Testing...' : 'Run All Tests'}
        </button>
      </div>

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getStatusIcon(result.status)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.test}</span>
                      <span className="text-sm opacity-75">{result.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm">{result.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>1. Make sure you are logged in</li>
          <li>2. Click "Run All Tests" to test both review and blog submissions</li>
          <li>3. Check the results to see if submissions are working</li>
          <li>4. If tests pass, the submission forms should work properly</li>
        </ul>
      </div>
    </div>
  );
};

export default SubmissionTest;