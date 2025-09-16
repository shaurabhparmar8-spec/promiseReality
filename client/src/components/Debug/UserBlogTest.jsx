import React, { useState } from 'react';
import { blogAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const UserBlogTest = () => {
  const { user, isAuthenticated } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    category: 'Tips & Advice',
    tags: [],
    status: 'published'
  });

  const addResult = (test, status, message) => {
    setResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testUserBlogSubmission = async () => {
    try {
      addResult('User Blog Test', 'testing', 'Testing user blog submission...');
      
      const testBlogData = {
        title: `User Test Blog - ${Date.now()}`,
        content: 'This is a comprehensive test blog post created by a logged-in user to verify that the blog creation functionality is working properly for regular users.',
        excerpt: 'A test blog post to verify user blog submission functionality.',
        category: 'Tips & Advice',
        tags: ['test', 'user', 'blog', 'verification'],
        status: 'published',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      };

      console.log('Submitting blog data:', testBlogData);
      addResult('Data Preparation', 'success', `Blog data prepared: ${testBlogData.title}`);

      const response = await blogAPI.create(testBlogData);
      console.log('Blog API response:', response);

      if (response.data.success) {
        addResult('User Blog Test', 'success', `Blog created successfully! ID: ${response.data.data.blog._id}, Slug: ${response.data.data.blog.slug}`);
        addResult('Blog Details', 'success', `Title: ${response.data.data.blog.title}, Category: ${response.data.data.blog.category}`);
      } else {
        addResult('User Blog Test', 'error', `Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Blog submission error:', error);
      addResult('User Blog Test', 'error', `Error: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.data?.errors) {
        addResult('Validation Errors', 'error', `Validation errors: ${error.response.data.errors.map(e => e.msg).join(', ')}`);
      }
      
      if (error.response?.status) {
        addResult('HTTP Status', 'error', `Status Code: ${error.response.status}`);
      }
      
      if (error.response?.data) {
        addResult('Full Error Response', 'error', JSON.stringify(error.response.data, null, 2));
      }
    }
  };

  const testFormSubmission = async () => {
    try {
      addResult('Form Test', 'testing', 'Testing form-based blog submission...');
      
      if (!blogForm.title.trim()) {
        addResult('Form Test', 'error', 'Please enter a blog title');
        return;
      }
      if (!blogForm.content.trim()) {
        addResult('Form Test', 'error', 'Please enter blog content');
        return;
      }
      if (!blogForm.excerpt.trim()) {
        addResult('Form Test', 'error', 'Please enter a blog excerpt');
        return;
      }

      console.log('Submitting form data:', blogForm);
      const response = await blogAPI.create(blogForm);

      if (response.data.success) {
        addResult('Form Test', 'success', `Form blog created successfully! ID: ${response.data.data.blog._id}`);
        setBlogForm({
          title: '',
          content: '',
          excerpt: '',
          image: '',
          category: 'Tips & Advice',
          tags: [],
          status: 'published'
        });
      } else {
        addResult('Form Test', 'error', `Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      addResult('Form Test', 'error', `Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const runAllTests = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login first to test blog submissions');
      return;
    }

    setTesting(true);
    setResults([]);
    
    addResult('Authentication', 'success', `Logged in as: ${user.name} (${user.email}) - Role: ${user.role || 'user'}`);
    
    await testUserBlogSubmission();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Blog Submission Test</h2>
        <p className="text-gray-600">Detailed testing for user blog creation functionality</p>
      </div>

      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Authentication Status</h3>
        {isAuthenticated() ? (
          <div className="text-green-600">
            ✅ Logged in as: <strong>{user.name}</strong> ({user.email}) - Role: <strong>{user.role || 'user'}</strong>
          </div>
        ) : (
          <div className="text-red-600">
            ❌ Not logged in - Please login to test blog submissions
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={runAllTests}
          disabled={!isAuthenticated() || testing}
          className={`px-6 py-3 rounded-lg font-medium ${
            !isAuthenticated() || testing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {testing ? 'Testing...' : 'Run API Test'}
        </button>

        <button
          onClick={testFormSubmission}
          disabled={!isAuthenticated() || testing}
          className={`px-6 py-3 rounded-lg font-medium ${
            !isAuthenticated() || testing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Test Form Submission
        </button>
      </div>

      {/* Blog Form for Testing */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Test Blog Form</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={blogForm.title}
              onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter blog title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={blogForm.category}
              onChange={(e) => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tips & Advice">Tips & Advice</option>
              <option value="Market Trends">Market Trends</option>
              <option value="Investment">Investment</option>
              <option value="Home Buying">Home Buying</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={blogForm.image}
              onChange={(e) => setBlogForm(prev => ({ ...prev, image: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <input
              type="text"
              value={blogForm.excerpt}
              onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Short description"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={blogForm.content}
              onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Blog content"
            />
          </div>
        </div>
      </div>

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
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
                    <p className="mt-1 text-sm whitespace-pre-wrap">{result.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBlogTest;