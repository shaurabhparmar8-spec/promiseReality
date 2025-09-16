import React, { useState } from 'react';
import { blogAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SimpleBlogTest = () => {
  const { user, isAuthenticated } = useAuth();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testBlogCreation = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('=== SIMPLE BLOG TEST START ===');
      console.log('User authenticated:', isAuthenticated());
      console.log('User data:', user);
      console.log('Token exists:', !!localStorage.getItem('token'));
      console.log('Token value:', localStorage.getItem('token')?.substring(0, 20) + '...');

      const testBlogData = {
        title: 'Simple Test Blog',
        content: 'This is a simple test blog to verify frontend blog creation is working.',
        excerpt: 'Simple test blog for verification.',
        category: 'Tips & Advice',
        tags: ['test'],
        status: 'published',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      };

      console.log('Blog data to submit:', testBlogData);

      const response = await blogAPI.create(testBlogData);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);

      if (response.data.success) {
        setResult({
          success: true,
          message: 'Blog created successfully!',
          blogId: response.data.data.blog._id,
          blogSlug: response.data.data.blog.slug
        });
        toast.success('Blog created successfully!');
      } else {
        setResult({
          success: false,
          message: response.data.message || 'Unknown error'
        });
        toast.error(response.data.message || 'Failed to create blog');
      }

    } catch (error) {
      console.error('=== BLOG CREATION ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);

      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      
      setResult({
        success: false,
        message: errorMessage,
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          errors: error.response?.data?.errors
        }
      });
      
      toast.error(errorMessage);
    } finally {
      setTesting(false);
      console.log('=== SIMPLE BLOG TEST END ===');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Simple Blog Creation Test</h2>
        <p className="text-gray-600">Direct test of blog creation functionality</p>
      </div>

      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Authenticated:</strong> {isAuthenticated() ? '✅ Yes' : '❌ No'}
          </div>
          {isAuthenticated() && (
            <>
              <div>
                <strong>User:</strong> {user?.name} ({user?.email})
              </div>
              <div>
                <strong>Role:</strong> {user?.role || 'user'}
              </div>
              <div>
                <strong>Token:</strong> {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={testBlogCreation}
          disabled={!isAuthenticated() || testing}
          className={`px-6 py-3 rounded-lg font-medium ${
            !isAuthenticated() || testing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {testing ? 'Testing...' : 'Test Blog Creation'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
            {result.success ? '✅ Success' : '❌ Error'}
          </h3>
          <p className={result.success ? 'text-green-800' : 'text-red-800'}>
            {result.message}
          </p>
          
          {result.success && result.blogId && (
            <div className="mt-2 text-sm text-green-700">
              <div><strong>Blog ID:</strong> {result.blogId}</div>
              <div><strong>Blog Slug:</strong> {result.blogSlug}</div>
            </div>
          )}
          
          {!result.success && result.details && (
            <div className="mt-2 text-sm text-red-700">
              {result.details.status && (
                <div><strong>Status:</strong> {result.details.status} {result.details.statusText}</div>
              )}
              {result.details.errors && (
                <div><strong>Validation Errors:</strong> {result.details.errors.map(e => e.msg).join(', ')}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
        <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
          <li>Make sure you are logged in as a regular user</li>
          <li>Click "Test Blog Creation" button</li>
          <li>Check the result and any console messages</li>
          <li>If it fails, check browser console for detailed error information</li>
        </ol>
      </div>

      {/* Console Instructions */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">Debug Information</h3>
        <p className="text-yellow-800 text-sm">
          Open browser console (F12) to see detailed logging information during the test.
          All API calls, responses, and errors will be logged there.
        </p>
      </div>
    </div>
  );
};

export default SimpleBlogTest;